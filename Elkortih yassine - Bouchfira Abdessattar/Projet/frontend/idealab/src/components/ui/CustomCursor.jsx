import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const INTERACTIVE_SELECTOR = 'a, button, input, textarea, select, [role="button"], [data-cursor="interactive"]'

export default function CustomCursor() {
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const x = useSpring(cursorX, { stiffness: 150, damping: 20, mass: 0.45 })
  const y = useSpring(cursorY, { stiffness: 150, damping: 20, mass: 0.45 })
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const frameRef = useRef(null)

  useEffect(() => {
    const media = window.matchMedia('(pointer: coarse)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches || reduced.matches) return undefined

    let targetX = -100
    let targetY = -100

    const animate = () => {
      cursorX.set(targetX - 10)
      cursorY.set(targetY - 10)
      frameRef.current = requestAnimationFrame(animate)
    }

    const handleMove = (e) => {
      targetX = e.clientX
      targetY = e.clientY
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseOver = (e) => {
      const element = e.target instanceof Element ? e.target.closest(INTERACTIVE_SELECTOR) : null
      setIsHovering(Boolean(element))
    }

    const handleLeaveWindow = () => {
      setIsVisible(false)
      setIsHovering(false)
      cursorX.set(-100)
      cursorY.set(-100)
    }

    frameRef.current = requestAnimationFrame(animate)
    window.addEventListener('pointermove', handleMove, { passive: true })
    window.addEventListener('mouseover', handleMouseOver, true)
    window.addEventListener('mouseout', handleMouseOver, true)
    window.addEventListener('blur', handleLeaveWindow)
    document.addEventListener('mouseleave', handleLeaveWindow)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('mouseover', handleMouseOver, true)
      window.removeEventListener('mouseout', handleMouseOver, true)
      window.removeEventListener('blur', handleLeaveWindow)
      document.removeEventListener('mouseleave', handleLeaveWindow)
    }
  }, [cursorX, cursorY, isVisible])

  return (
    <motion.div
      style={{ translateX: x, translateY: y, willChange: 'transform' }}
      animate={{
        scale: isHovering ? 3 : 1,
        opacity: isVisible ? (isHovering ? 0.88 : 0.62) : 0,
      }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className='pointer-events-none fixed left-0 top-0 z-[99999] h-5 w-5 rounded-full mix-blend-difference'
      aria-hidden='true'
    >
      <div style={{ backgroundColor: '#681A15' }} className='h-full w-full rounded-full' />
    </motion.div>
  )
}
