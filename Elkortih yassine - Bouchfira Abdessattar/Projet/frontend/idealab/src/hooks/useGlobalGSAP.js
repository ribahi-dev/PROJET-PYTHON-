import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

export function initPageAnimations() {
  ScrollTrigger.getAll().forEach((t) => t.kill())

  document.querySelectorAll('[data-gsap="split-title"]').forEach((el) => {
    gsap.set(el, { opacity: 1 })
    SplitText.create(el, {
      type: 'words', aria: 'hidden',
      onSplit: (self) => {
        gsap.from(self.words, {
          opacity: 0, duration: 1.2, ease: 'sine.out', stagger: 0.07,
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        })
      },
    })
  })

  document.querySelectorAll('[data-gsap="fade-up"]').forEach((el) => {
    gsap.from(el, {
      opacity: 0, y: 30, duration: 0.7, ease: 'power3.out',
      delay: parseFloat(el.dataset.gsapDelay || 0),
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    })
  })

  document.querySelectorAll('[data-gsap="scale-in"]').forEach((el) => {
    gsap.from(el, {
      opacity: 0, scale: 0.9, y: 16, duration: 0.6, ease: 'power3.out',
      delay: parseFloat(el.dataset.gsapDelay || 0),
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    })
  })

  document.querySelectorAll('[data-gsap="stagger-group"]').forEach((el) => {
    gsap.from(el.children, {
      opacity: 0, y: 30, duration: 0.6, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    })
  })
}

export function pageEnter(container) {
  if (!container) return
  gsap.fromTo(container,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', clearProps: 'all' }
  )
}
