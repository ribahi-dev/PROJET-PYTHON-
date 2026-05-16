import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

export function useSmoothScroll(smooth = 0.08) {
  const contentRef = useRef(null)

  useEffect(() => {
    const content = contentRef.current
    if (!content) return

    gsap.set(content, { position: 'fixed', top: 0, left: 0, width: '100%' })

    let currentY = 0
    let targetY  = 0
    let rafId

    const setBodyHeight = () => {
      document.body.style.height = content.scrollHeight + 'px'
    }
    setBodyHeight()

    const ro = new ResizeObserver(setBodyHeight)
    ro.observe(content)

    const lerp = (a, b, t) => a + (b - a) * t

    const tick = () => {
      targetY  = window.scrollY
      currentY = lerp(currentY, targetY, smooth)
      if (Math.abs(currentY - targetY) < 0.05) currentY = targetY
      gsap.set(content, { y: -currentY })
      ScrollTrigger.update()
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length) window.scrollTo(0, value)
        return window.scrollY
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
      },
      pinType: 'transform',
    })

    ScrollTrigger.addEventListener('refresh', setBodyHeight)
    ScrollTrigger.refresh()

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      ScrollTrigger.removeEventListener('refresh', setBodyHeight)
      gsap.set(content, { clearProps: 'all' })
      document.body.style.height = ''
      ScrollTrigger.scrollerProxy(document.body, null)
      ScrollTrigger.refresh()
    }
  }, [smooth])

  return contentRef
}
