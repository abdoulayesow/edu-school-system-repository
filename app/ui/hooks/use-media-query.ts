import { useState, useEffect } from 'react'

/**
 * Hook to detect if media query matches
 * @param query - Media query string (e.g., "(min-width: 1024px)")
 * @param defaultValue - Default value before first render (defaults to false)
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(
  query: string,
  defaultValue: boolean = false
): boolean {
  const [matches, setMatches] = useState(defaultValue)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [query])

  return matches
}
