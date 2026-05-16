import { motion } from 'framer-motion'

export const easePremium = [0.22, 1, 0.36, 1]

export const revealVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: easePremium },
  },
}

export const staggerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08, ease: easePremium },
  },
}

export function Reveal({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={className}
      variants={revealVariants}
      initial='hidden'
      whileInView='show'
      viewport={{ once: true, amount: 0.25 }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}

export function Stagger({ children, className = '' }) {
  return (
    <motion.div className={className} variants={staggerVariants} initial='hidden' whileInView='show' viewport={{ once: true, amount: 0.2 }}>
      {children}
    </motion.div>
  )
}

export function HoverScale({ children, className = '' }) {
  return (
    <motion.div whileHover={{ scale: 1.025 }} whileTap={{ scale: 0.99 }} transition={{ duration: 0.35, ease: easePremium }} className={className}>
      {children}
    </motion.div>
  )
}
