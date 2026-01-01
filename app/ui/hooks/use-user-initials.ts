import { useMemo } from 'react'
import { useSession } from 'next-auth/react'

/**
 * Hook to extract user initials from session data
 * Returns first letter of each name part, up to 2 characters, uppercase
 */
export function useUserInitials(): string {
  const { data: session } = useSession()

  const initials = useMemo(() => {
    const name = session?.user?.name || session?.user?.email || ''
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }, [session?.user?.name, session?.user?.email])

  return initials
}
