import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRef } from 'react'

gsap.registerPlugin(SplitText, Flip, ScrollTrigger)

const sc = { scroller: document.body }

/* ── Hero entrance ── */
export function useHeroGSAP() {
  const scope = useRef(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

    tl.from('[data-gsap="badge"]', { opacity: 0, y: 20, scale: 0.9, duration: 0.7 })

    const heading = scope.current?.querySelector('[data-gsap="hero-heading"]')
    if (heading) {
      gsap.set(heading, { opacity: 1 })
      SplitText.create(heading, {
        type: 'words', aria: 'hidden',
        onSplit: (self) => {
          tl.from(self.words, { opacity: 0, duration: 2, ease: 'sine.out', stagger: 0.1 }, '-=0.3')
        },
      })
    }

    tl.from('[data-gsap="underline"]',  { scaleX: 0, transformOrigin: 'left center', duration: 0.7, ease: 'power3.inOut' }, '-=0.2')
    tl.from('[data-gsap="hero-p"]',     { opacity: 0, y: 24, duration: 0.7 }, '-=0.4')
    tl.from('[data-gsap="hero-btns"]',  { opacity: 0, y: 18, duration: 0.6 }, '-=0.35')
    tl.from('[data-gsap="hero-trust"]', { opacity: 0, duration: 0.5 }, '-=0.2')
    tl.from('[data-gsap="hero-img"]',   { opacity: 0, x: 60, scale: 0.92, duration: 1.1, ease: 'power3.out' }, 0.2)

    gsap.to('[data-gsap="ring"]', {
      scale: 1.06, opacity: 0.6, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: 0.8,
    })
  }, { scope })

  return scope
}

/* ── Trusted logos ── */
export function useLogosGSAP() {
  const scope = useRef(null)
  useGSAP(() => {
    const logos = scope.current?.querySelectorAll('[data-gsap="logo"]')
    if (!logos?.length) return
    gsap.set(logos, { opacity: 0, y: 16 })
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      obs.disconnect()
      gsap.to(logos, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' })
    }, { threshold: 0.1 })
    obs.observe(scope.current)
  }, { scope })
  return scope
}

/* ── Stats counter ── */
export function useStatsGSAP() {
  const scope = useRef(null)
  useGSAP(() => {
    const cards = scope.current?.querySelectorAll('[data-gsap="stat-card"]')
    if (!cards?.length) return

    gsap.from(cards, {
      opacity: 0, y: 40, scale: 0.92, duration: 0.7, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: scope.current, start: 'top 90%', once: true, ...sc },
    })

    cards.forEach((card) => {
      const el = card.querySelector('[data-gsap="stat-num"]')
      if (!el) return
      const raw    = el.textContent.replace(/[^0-9.]/g, '')
      const target = parseFloat(raw)
      if (isNaN(target)) return
      const suffix = el.textContent.replace(/[0-9.]/g, '')
      ScrollTrigger.create({
        trigger: card, start: 'top 90%', once: true, ...sc,
        onEnter: () => {
          gsap.fromTo({ val: 0 }, { val: target }, {
            duration: 1.8, ease: 'power2.out', delay: 0.3,
            onUpdate() { el.textContent = Math.round(this.targets()[0].val) + suffix },
          })
        },
      })
    })
  }, { scope })
  return scope
}

/* ── Features bento entrance + hover animation ── */
export function useFeaturesGSAP() {
  const scope = useRef(null)

  useGSAP(() => {
    const el = scope.current
    if (!el) return

    const heading = el.querySelector('[data-gsap="features-heading"]')
    const cards   = el.querySelectorAll('[data-gsap="feature-card"]')
    if (!heading || !cards?.length) return

    gsap.set([heading, ...cards], { opacity: 0, y: 40 })

    let animated = false
    const animate = () => {
      if (animated) return
      animated = true
      observer.disconnect()
      const tl = gsap.timeline()
      tl.to(heading, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
        .to(cards,   { opacity: 1, y: 0, scale: 1, duration: 0.65, stagger: 0.09, ease: 'power3.out' }, '-=0.4')
    }

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) animate() },
      { threshold: 0.1 }
    )
    observer.observe(el)

    cards.forEach((card) => {
      const icon = card.querySelector('.feature-icon')

      card.addEventListener('mouseenter', () => {
        gsap.to(card, { y: -6, scale: 1.03, duration: 0.3, ease: 'power2.out' })
        if (icon) gsap.to(icon, { rotate: 10, scale: 1.15, duration: 0.3, ease: 'power2.out' })
      })
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { y: 0, scale: 1, duration: 0.4, ease: 'power2.inOut' })
        if (icon) gsap.to(icon, { rotate: 0, scale: 1, duration: 0.4, ease: 'power2.inOut' })
      })
    })
  }, { scope })

  return scope
}

/* ── useFlipFeatures kept as alias so Home.jsx import doesn't break ── */
export function useFlipFeatures() {
  return useRef(null)
}

/* ── Testimonials ── */
export function useTestimonialsGSAP() {
  const scope = useRef(null)
  useGSAP(() => {
    const heading = scope.current?.querySelector('[data-gsap="test-heading"]')
    const cards   = scope.current?.querySelectorAll('[data-gsap="test-card"]')
    if (!heading || !cards?.length) return
    const tl = gsap.timeline({
      scrollTrigger: { trigger: scope.current, start: 'top 90%', once: true, ...sc },
    })
    tl.from(heading, { opacity: 0, y: 28, duration: 0.75, ease: 'power3.out' })
      .from(cards, { opacity: 0, y: 50, rotateY: 8, duration: 0.7, stagger: 0.12, ease: 'power3.out' }, '-=0.35')
  }, { scope })
  return scope
}

/* ── Section headings + items ── */
export function useSectionGSAP() {
  const scope = useRef(null)
  useGSAP(() => {
    const el = scope.current
    if (!el) return

    el.querySelectorAll('[data-gsap="section-heading"]').forEach((h) => {
      gsap.set(h, { opacity: 0, y: 30 })
      const obs = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return
        obs.disconnect()
        gsap.to(h, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
      }, { threshold: 0.1 })
      obs.observe(h)
    })

    el.querySelectorAll('[data-gsap="section-item"]').forEach((item, i) => {
      gsap.set(item, { opacity: 0, y: 40 })
      const obs = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return
        obs.disconnect()
        gsap.to(item, { opacity: 1, y: 0, duration: 0.65, delay: i * 0.07, ease: 'power3.out' })
      }, { threshold: 0.1 })
      obs.observe(item)
    })
  }, { scope })
  return scope
}

/* ── CTA banner ── */
export function useCtaGSAP() {
  const scope = useRef(null)
  useGSAP(() => {
    const banner = scope.current?.querySelector('[data-gsap="cta-banner"]')
    if (!banner) return
    gsap.from(banner, {
      opacity: 0, y: 48, scale: 0.96, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: banner, start: 'top 90%', once: true, ...sc },
    })
    gsap.to('[data-gsap="cta-orb"]', {
      y: -18, duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: 1.2,
    })
  }, { scope })
  return scope
}
