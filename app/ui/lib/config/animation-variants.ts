/**
 * Centralized animation configurations for Framer Motion
 *
 * Provides reusable animation variants for consistent motion design
 * across the application, following GSPN brand guidelines.
 */

// Check for reduced motion preference
const getPrefersReducedMotion = () => {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * Card interaction animations
 * Used for clickable card components with hover and tap feedback
 */
export const cardAnimations = {
  tap: { scale: 0.98 },
  hover: { scale: 1.01 },
  transition: { type: "spring" as const, stiffness: 400, damping: 25 },
}

/**
 * Badge/label animations
 * Used for status badges with smooth fade transitions
 */
export const badgeAnimations = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.15 },
}

/**
 * Icon animations
 * Used for icon elements with rotate-in effect
 */
export const iconAnimations = {
  initial: { rotate: -15, opacity: 0 },
  animate: { rotate: 0, opacity: 1 },
  exit: { rotate: 15, opacity: 0 },
  transition: { duration: 0.2 },
}

/**
 * Border transition animations
 * Used for border color changes on state updates
 */
export const borderAnimations = {
  transition: { duration: 0.2, ease: "easeInOut" },
}

/**
 * Get card animations with reduced motion support
 */
export const getCardAnimations = () => {
  const reducedMotion = getPrefersReducedMotion()
  return {
    tap: reducedMotion ? {} : cardAnimations.tap,
    hover: reducedMotion ? {} : cardAnimations.hover,
    transition: cardAnimations.transition,
  }
}

/**
 * Get badge animations with reduced motion support
 */
export const getBadgeAnimations = () => {
  const reducedMotion = getPrefersReducedMotion()
  return reducedMotion
    ? {
        initial: {},
        animate: {},
        exit: {},
        transition: { duration: 0 },
      }
    : badgeAnimations
}

/**
 * Get icon animations with reduced motion support
 */
export const getIconAnimations = () => {
  const reducedMotion = getPrefersReducedMotion()
  return reducedMotion
    ? {
        initial: {},
        animate: {},
        exit: {},
        transition: { duration: 0 },
      }
    : iconAnimations
}
