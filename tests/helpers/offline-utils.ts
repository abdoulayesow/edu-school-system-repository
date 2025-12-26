import { Page, expect } from '@playwright/test'

/**
 * Offline testing utilities for Playwright E2E tests
 */

// Types matching the Dexie schema
export interface LocalStudent {
  id: string
  serverId?: string
  firstName: string
  lastName: string
  email?: string
  dateOfBirth?: string
  guardianName?: string
  guardianPhone?: string
  guardianEmail?: string
  enrollmentDate: string
  status: 'active' | 'inactive' | 'graduated' | 'transferred'
  grade?: string
  classId?: string
  notes?: string
  syncStatus: string
  localUpdatedAt: number
  version: number
}

export interface SyncQueueItem {
  id?: number
  operation: string
  entity: string
  entityId: string
  payload: Record<string, unknown>
  createdAt: number
  attempts: number
  status: string
}

/**
 * Simulate offline mode by blocking API requests and dispatching offline event
 */
export async function goOffline(page: Page): Promise<void> {
  // Block all API requests to simulate network failure
  await page.route('**/api/**', (route) => {
    route.abort('internetdisconnected')
  })

  // Also block health check endpoint specifically
  await page.route('**/api/health', (route) => {
    route.abort('internetdisconnected')
  })

  // Dispatch offline event to trigger app state change
  await page.evaluate(() => {
    window.dispatchEvent(new Event('offline'))
  })

  // Give the app time to react to offline state
  await page.waitForTimeout(500)
}

/**
 * Restore online mode by removing route blocks and dispatching online event
 */
export async function goOnline(page: Page): Promise<void> {
  // Remove all route blocks
  await page.unroute('**/api/**')
  await page.unroute('**/api/health')

  // Dispatch online event
  await page.evaluate(() => {
    window.dispatchEvent(new Event('online'))
  })

  // Give the app time to react and potentially trigger sync
  await page.waitForTimeout(500)
}

/**
 * Wait for the offline indicator to show a specific status
 */
export async function waitForOfflineIndicator(
  page: Page,
  status: 'online' | 'offline' | 'syncing' | 'pending' | 'error',
  timeout: number = 10000
): Promise<void> {
  const indicator = page.locator('[data-testid="offline-indicator"]').first()
  await expect(indicator).toHaveAttribute('data-status', status, { timeout })
}

/**
 * Get data from IndexedDB via Dexie
 */
export async function getIndexedDBData<T>(
  page: Page,
  tableName: string
): Promise<T[]> {
  return page.evaluate(async (table) => {
    // Dynamic import of Dexie database
    const Dexie = (window as any).Dexie
    if (!Dexie) {
      // If Dexie is not on window, try to access the database directly
      return new Promise<T[]>((resolve, reject) => {
        const request = indexedDB.open('GSPNOfflineDB')
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          const db = request.result
          if (!db.objectStoreNames.contains(table)) {
            resolve([])
            return
          }
          const transaction = db.transaction(table, 'readonly')
          const store = transaction.objectStore(table)
          const getAllRequest = store.getAll()
          getAllRequest.onerror = () => reject(getAllRequest.error)
          getAllRequest.onsuccess = () => resolve(getAllRequest.result as T[])
        }
      })
    }
    return []
  }, tableName)
}

/**
 * Clear all IndexedDB data for test isolation
 */
export async function clearIndexedDB(page: Page): Promise<void> {
  await page.evaluate(async () => {
    // Delete the entire database
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase('GSPNOfflineDB')
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
      request.onblocked = () => {
        // Database is blocked, try closing connections
        console.warn('IndexedDB delete blocked, proceeding anyway')
        resolve()
      }
    })
  })
}

/**
 * Add a student directly to IndexedDB (simulating offline creation)
 * Creates the database and stores if they don't exist.
 */
export async function addStudentViaIndexedDB(
  page: Page,
  data: Partial<Omit<LocalStudent, 'id' | 'syncStatus' | 'localUpdatedAt' | 'version'>>
): Promise<string> {
  return page.evaluate(async (studentData) => {
    const id = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    const student = {
      id,
      firstName: studentData.firstName || 'Test',
      lastName: studentData.lastName || 'Student',
      email: studentData.email,
      status: studentData.status || 'active',
      enrollmentDate: studentData.enrollmentDate || new Date().toISOString(),
      grade: studentData.grade,
      classId: studentData.classId,
      syncStatus: 'pending',
      localUpdatedAt: Date.now(),
      version: 1,
    }

    const syncQueueItem = {
      operation: 'CREATE',
      entity: 'student',
      entityId: id,
      payload: studentData,
      createdAt: Date.now(),
      attempts: 0,
      status: 'pending',
    }

    // Helper function to add data to an open database
    function addToDatabase(db: IDBDatabase): Promise<string> {
      return new Promise((resolve, reject) => {
        try {
          const transaction = db.transaction(['students', 'syncQueue'], 'readwrite')

          transaction.onerror = () => {
            reject(new Error(`Transaction error: ${transaction.error?.message || 'Unknown error'}`))
          }

          transaction.oncomplete = () => {
            db.close()
            resolve(id)
          }

          const studentsStore = transaction.objectStore('students')
          const syncQueueStore = transaction.objectStore('syncQueue')

          const studentRequest = studentsStore.add(student)
          studentRequest.onerror = () => {
            reject(new Error(`Failed to add student: ${studentRequest.error?.message || 'Unknown error'}`))
          }

          const queueRequest = syncQueueStore.add(syncQueueItem)
          queueRequest.onerror = () => {
            reject(new Error(`Failed to add to sync queue: ${queueRequest.error?.message || 'Unknown error'}`))
          }
        } catch (err) {
          db.close()
          reject(err)
        }
      })
    }

    // Open database and check for stores, use a high version to ensure upgrade works
    return new Promise<string>((resolve, reject) => {
      // First, get the current database version
      const checkRequest = indexedDB.open('GSPNOfflineDB')

      checkRequest.onerror = () => {
        reject(new Error(`Failed to open database: ${checkRequest.error?.message || 'Unknown error'}`))
      }

      checkRequest.onsuccess = () => {
        const checkDb = checkRequest.result
        const currentVersion = checkDb.version
        const hasStores = checkDb.objectStoreNames.contains('students') && checkDb.objectStoreNames.contains('syncQueue')
        checkDb.close()

        if (hasStores) {
          // Stores exist, open normally and add data
          const openRequest = indexedDB.open('GSPNOfflineDB')
          openRequest.onerror = () => reject(new Error(`Failed to open database: ${openRequest.error?.message || 'Unknown error'}`))
          openRequest.onsuccess = () => addToDatabase(openRequest.result).then(resolve).catch(reject)
        } else {
          // Stores don't exist, upgrade to create them
          // Use currentVersion + 1, but ensure it's at least 100 to avoid conflicts with Dexie
          const newVersion = Math.max(currentVersion + 1, 100)

          const upgradeRequest = indexedDB.open('GSPNOfflineDB', newVersion)

          upgradeRequest.onerror = () => {
            reject(new Error(`Failed to upgrade database: ${upgradeRequest.error?.message || 'Unknown error'}`))
          }

          upgradeRequest.onupgradeneeded = (event) => {
            const upgradeDb = (event.target as IDBOpenDBRequest).result
            // Create stores if they don't exist
            if (!upgradeDb.objectStoreNames.contains('students')) {
              upgradeDb.createObjectStore('students', { keyPath: 'id' })
            }
            if (!upgradeDb.objectStoreNames.contains('syncQueue')) {
              upgradeDb.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true })
            }
          }

          upgradeRequest.onsuccess = () => {
            addToDatabase(upgradeRequest.result).then(resolve).catch(reject)
          }
        }
      }
    })
  }, data)
}

/**
 * Get count of pending sync queue items
 */
export async function getSyncQueueCount(page: Page): Promise<number> {
  return page.evaluate(async () => {
    return new Promise<number>((resolve, reject) => {
      const request = indexedDB.open('GSPNOfflineDB')
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const db = request.result
        if (!db.objectStoreNames.contains('syncQueue')) {
          resolve(0)
          return
        }
        const transaction = db.transaction('syncQueue', 'readonly')
        const store = transaction.objectStore('syncQueue')
        const countRequest = store.count()
        countRequest.onerror = () => reject(countRequest.error)
        countRequest.onsuccess = () => resolve(countRequest.result)
      }
    })
  })
}

/**
 * Get pending sync queue items (status = 'pending')
 */
export async function getPendingSyncItems(page: Page): Promise<SyncQueueItem[]> {
  const allItems = await getIndexedDBData<SyncQueueItem>(page, 'syncQueue')
  return allItems.filter((item) => item.status === 'pending')
}

/**
 * Wait for sync to complete (poll until queue is empty and status is idle)
 */
export async function waitForSyncComplete(
  page: Page,
  timeout: number = 30000
): Promise<void> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    // Check sync queue count
    const queueCount = await getSyncQueueCount(page)

    // Check indicator status
    const indicator = page.locator('[data-testid="offline-indicator"]')
    const status = await indicator.getAttribute('data-status').catch(() => null)

    // Sync is complete when queue is empty and status is online/idle
    if (queueCount === 0 && (status === 'online' || status === null)) {
      return
    }

    // Wait before next check
    await page.waitForTimeout(500)
  }

  throw new Error(`Sync did not complete within ${timeout}ms`)
}

/**
 * Trigger manual sync by clicking the indicator (if it supports it)
 */
export async function triggerManualSync(page: Page): Promise<void> {
  const indicator = page.locator('[data-testid="offline-indicator"]').first()
  await indicator.click()
  // Wait for sync to start
  await page.waitForTimeout(500)
}

/**
 * Generate unique test data to avoid conflicts between test runs
 */
export function generateTestStudent(prefix: string = 'Test'): {
  firstName: string
  lastName: string
  email: string
  status: 'active'
  enrollmentDate: string
} {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 7)
  return {
    firstName: `${prefix}${random}`,
    lastName: `Student${timestamp}`,
    email: `test-${timestamp}-${random}@example.com`,
    status: 'active',
    enrollmentDate: new Date().toISOString().split('T')[0],
  }
}

/**
 * Wait for the app to initialize (offline store, service worker, etc.)
 */
export async function waitForAppInitialization(page: Page): Promise<void> {
  // Wait for the offline indicator to be present in DOM
  const indicator = page.locator('[data-testid="offline-indicator"]').first()
  await indicator.waitFor({ state: 'attached', timeout: 10000 }).catch(() => {
    // If indicator is not found, app might still be initialized
  })

  // Give the app time to initialize stores
  await page.waitForLoadState('networkidle')

  // Wait for IndexedDB to be ready by checking if the database exists
  await page.evaluate(async () => {
    return new Promise<void>((resolve) => {
      const request = indexedDB.open('GSPNOfflineDB')
      request.onsuccess = () => {
        const db = request.result
        db.close()
        resolve()
      }
      request.onerror = () => {
        // Database doesn't exist yet, that's okay
        resolve()
      }
      // Set a timeout in case the database never opens
      setTimeout(resolve, 2000)
    })
  })
}
