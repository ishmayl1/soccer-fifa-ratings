import { ref, onMounted, onUnmounted } from 'vue'

const BREAKPOINTS = {
  mobile: '(max-width: 599px)',
  tablet: '(min-width: 600px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
}

export function useBreakpoints() {
  const isMobile = ref(false)
  const isTablet = ref(false)
  const isDesktop = ref(false)

  const listeners = []

  onMounted(() => {
    const entries = [
      [BREAKPOINTS.mobile, isMobile],
      [BREAKPOINTS.tablet, isTablet],
      [BREAKPOINTS.desktop, isDesktop],
    ]
    for (const [query, matched] of entries) {
      const mql = window.matchMedia(query)
      matched.value = mql.matches
      const handler = (e) => { matched.value = e.matches }
      mql.addEventListener('change', handler)
      listeners.push({ mql, handler })
    }
  })

  onUnmounted(() => {
    listeners.forEach(({ mql, handler }) => mql.removeEventListener('change', handler))
  })

  return { isMobile, isTablet, isDesktop }
}
