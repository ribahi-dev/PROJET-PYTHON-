import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight, BarChart3, CheckCircle2, Lightbulb, MessageSquare,
  Quote, Shield, Sparkles, Target, TrendingUp, Users, Zap,
  FileText, BarChart2, RefreshCw,
} from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { getAdminStats } from '../api/analytics.api'
import IdeaCard from '../components/ideas/IdeaCard'
import { HoverScale, Reveal, Stagger, easePremium, revealVariants } from '../components/motion/Reveal'
import Button from '../components/ui/Button'
import { SkeletonCard } from '../components/ui/Skeleton'
import { useTrending } from '../hooks/useIdeas'
import {
  useHeroGSAP, useLogosGSAP, useStatsGSAP,
  useFeaturesGSAP, useFlipFeatures, useTestimonialsGSAP, useSectionGSAP, useCtaGSAP,
} from '../hooks/useHomeGSAP'
import heroImg from '../assets/hero.png'
import step1Img from '../assets/step1.jpg'
import step2Img from '../assets/step2.jpg'
import step3Img from '../assets/step3.webp'
import step4Img from '../assets/step4.jpg'

import { useSmoothScroll } from '../hooks/useSmoothScroll'

gsap.registerPlugin(ScrollTrigger)

const fallbackStats = { total_ideas: 120, total_users: 450, total_feedbacks: 1200, avg_sgv: 61.4 }

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'Founder, NovaTech', text: 'IdeaLab gave me the structured feedback I needed before spending a single dollar. The SGV score was a game-changer.' },
  { name: 'Marcus L.', role: 'Serial Entrepreneur', text: 'I validated three ideas in one month. The reviewer community is sharp, honest, and incredibly helpful.' },
  { name: 'Amina R.', role: 'Product Manager', text: "The quality of feedback here is unlike anything I've seen. Real experts, real insights, zero fluff." },
]

const FEATURES = [
  { icon: Target,    title: 'Structured Validation', desc: 'Multi-dimensional scoring across market fit, innovation, feasibility, and ROI — not just gut feelings.' },
  { icon: Users,     title: 'Expert Community',      desc: 'Get reviewed by vetted entrepreneurs, investors, and domain experts who have built real companies.' },
  { icon: BarChart3, title: 'SGV Analytics',         desc: 'Track your Startup Global Validation score over time and benchmark against top-performing ideas.' },
  { icon: Zap,       title: 'Fast Turnaround',       desc: 'Receive your first feedback within 48 hours. Iterate quickly before committing resources.' },
  { icon: Shield,    title: 'Confidential & Safe',   desc: 'Your ideas are protected. Share only what you want, with full control over visibility.' },
  { icon: Sparkles,  title: 'Actionable Insights',   desc: 'Every review comes with specific, actionable recommendations — not vague opinions.' },
]

const LOGOS = ['Airbnb', 'Dropbox', 'Stripe', 'Notion', 'Figma', 'Linear']

export default function Home() {
  const heroScope        = useHeroGSAP()
  const logosScope       = useLogosGSAP()
  const statsScope       = useStatsGSAP()
  const featuresScope    = useFeaturesGSAP()
  const flipScope        = useFlipFeatures()
  const testimonialsScope = useTestimonialsGSAP()
  const journeyScope     = useSectionGSAP()
  const trendingScope    = useSectionGSAP()
  const ctaScope         = useCtaGSAP()
  const smoothRef        = useSmoothScroll(0.08)

  const { data: trendingData = [], isLoading } = useTrending()
  const { data: statsData } = useQuery({
    queryKey: ['admin-stats-public'],
    queryFn: async () => {
      try { const r = await getAdminStats(); return r.data }
      catch { return fallbackStats }
    },
  })

  const stats   = statsData || fallbackStats
  const trending = Array.isArray(trendingData?.results) ? trendingData.results : (Array.isArray(trendingData) ? trendingData : [])

  return (
    <div ref={smoothRef} className='overflow-x-hidden'>

      {/* ── HERO ── */}
      <section ref={heroScope} className='relative overflow-hidden bg-gradient-to-br from-primary via-primary to-secondary/20 px-4 py-20 md:py-28'>
        <div data-gsap='ring' className='pointer-events-none absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full border border-secondary/10' />
        <div data-gsap='ring' className='pointer-events-none absolute -right-20 -top-20 h-[360px] w-[360px] rounded-full border border-secondary/15' />
        <div className='pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-secondary/5 blur-3xl' />

        <div className='mx-auto flex max-w-6xl items-center gap-12'>
          <div className='flex-1'>
            <div data-gsap='badge' className='mb-4 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-secondary'>
              <Sparkles size={12} /> The #1 Idea Validation Platform
            </div>

            <h1
              data-gsap='hero-heading'
              className='font-display text-4xl font-black leading-[1.08] tracking-tight text-secondary md:text-6xl lg:text-7xl'
              style={{ opacity: 0 }}
            >
              Validate Your{' '}
              <span className='relative inline-block'>
                Startup Idea
                <span data-gsap='underline' className='absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-secondary/40' />
              </span>
              {' '}Before You Build
            </h1>

            <p data-gsap='hero-p' className='mt-6 max-w-lg text-base leading-relaxed text-secondary/75 md:text-lg'>
              Get structured, multi-dimensional feedback from a curated community of entrepreneurs and experts. Know if your idea is worth pursuing — before you spend a dollar.
            </p>

            <div data-gsap='hero-btns' className='mt-8 flex flex-wrap items-center gap-4'>
              <Link to='/register'>
                <Button className='group px-7 py-3.5 text-base'>
                  Start Free Today
                  <ArrowRight size={16} className='transition-transform duration-300 group-hover:translate-x-1' />
                </Button>
              </Link>
              <Link to='/explore'>
                <Button variant='ghost' className='px-7 py-3.5 text-base'>Browse Ideas</Button>
              </Link>
            </div>

            <div data-gsap='hero-trust' className='mt-8 flex flex-wrap items-center gap-5 text-sm text-secondary/60'>
              {['No credit card required', 'Free forever plan', '48h first feedback'].map((t) => (
                <span key={t} className='flex items-center gap-1.5'>
                  <CheckCircle2 size={14} className='text-secondary/50' /> {t}
                </span>
              ))}
            </div>
          </div>

          <div data-gsap='hero-img' className='hidden shrink-0 md:block md:w-[380px] lg:w-[460px]'>
            <div className='relative'>
              <div className='absolute inset-x-8 bottom-0 h-3/4 rounded-full bg-secondary/10 blur-3xl' />
              <div className='absolute inset-x-16 bottom-0 h-1/2 rounded-full bg-primary/60 blur-2xl' />
              <img src={heroImg} alt='Entrepreneur' className='relative z-10 w-full drop-shadow-2xl' />
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY ── */}
      <div ref={logosScope} className='border-y border-secondary/15 bg-primary/60 py-6'>
        <div className='mx-auto max-w-6xl px-4'>
          <p className='mb-5 text-center text-xs font-semibold uppercase tracking-widest text-secondary/40'>Trusted across the startup ecosystem</p>
          <div className='flex flex-wrap items-center justify-center gap-8'>
            {LOGOS.map((name) => (
              <span key={name} data-gsap='logo' className='font-display text-sm font-bold tracking-tight text-secondary/30 transition-all duration-300 hover:text-secondary/60'>
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div ref={statsScope} className='mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-16 md:grid-cols-4'>
        {[
          { label: 'Ideas Submitted',  value: `${stats.total_ideas}+` },
          { label: 'Active Members',   value: `${stats.total_users}+` },
          { label: 'Feedbacks Given',  value: `${stats.total_feedbacks}+` },
          { label: 'Avg SGV Score',    value: `${stats.avg_sgv}` },
        ].map(({ label, value }) => (
          <div key={label} data-gsap='stat-card' className='rounded-2xl border border-secondary/20 bg-primary p-6 text-center shadow-sm'>
            <p data-gsap='stat-num' className='font-display text-3xl font-black text-secondary'>{value}</p>
            <p className='mt-1 text-xs font-medium uppercase tracking-wider text-secondary/50'>{label}</p>
          </div>
        ))}
      </div>

      {/* ── FEATURES BENTO ── */}
      <section ref={featuresScope} className='bg-secondary px-4 py-20'>
        <div className='mx-auto max-w-6xl'>
          <div data-gsap='features-heading' className='mb-4 text-center'>
            <p className='mb-2 text-xs font-semibold uppercase tracking-widest text-primary/50'>Why IdeaLab</p>
            <h2 className='font-display text-3xl font-black tracking-tight text-primary md:text-5xl'>
              Everything you need to<br />validate with confidence
            </h2>
            <p className='mt-3 text-xs text-primary/35 tracking-wide'>Hover any card to explore</p>
          </div>
          <div data-gsap='features-grid' className='grid gap-4 md:grid-cols-3'>
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                data-gsap='feature-card'
                className='cursor-pointer rounded-2xl border border-primary/15 bg-primary/8 p-6 backdrop-blur-sm transition-[opacity,filter] duration-300'
              >
                <div className='feature-icon mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10'>
                  <Icon size={20} className='text-primary' />
                </div>
                <h3 className='font-display mb-2 font-bold tracking-tight text-primary'>{title}</h3>
                <p className='text-sm leading-relaxed text-primary/65'>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section ref={journeyScope} className='px-4 py-20'>
        <div className='mx-auto max-w-6xl'>
          <div data-gsap='section-heading' className='mb-14 text-center'>
            <p className='mb-2 text-xs font-semibold uppercase tracking-widest text-secondary/40'>The Process</p>
            <h2 className='font-display text-3xl font-black tracking-tight text-secondary md:text-5xl'>
              From idea to insight<br />in three steps
            </h2>
          </div>
          <div className='relative'>
            <div className='absolute left-1/2 top-8 hidden h-[calc(100%-4rem)] w-px -translate-x-1/2 bg-gradient-to-b from-secondary/30 via-secondary/15 to-transparent md:block' />
            <div className='space-y-6 md:space-y-0'>
              {[
                { n: '01', icon: Lightbulb,    title: 'Submit Your Idea',       desc: 'Fill in your startup concept — problem, solution, target audience, and business model. Takes under 5 minutes.', side: 'left' },
                { n: '02', icon: MessageSquare, title: 'Receive Expert Feedback', desc: 'Our community of vetted reviewers evaluates your idea across 4 key dimensions and leaves detailed, actionable comments.', side: 'right' },
                { n: '03', icon: TrendingUp,    title: 'Track Your SGV Score',   desc: 'Your Startup Global Validation score aggregates all feedback into a single benchmark. Iterate, resubmit, and watch it climb.', side: 'left' },
              ].map(({ n, icon: Icon, title, desc, side }) => (
                <div key={n} data-gsap='section-item' className={`flex items-center gap-8 md:gap-16 ${side === 'right' ? 'md:flex-row-reverse' : ''}`}>
                  <div className='flex-1' style={side === 'right' ? {} : { textAlign: 'right' }}>
                    <span className='font-display text-6xl font-black text-secondary/10'>{n}</span>
                    <h3 className='font-display -mt-3 text-xl font-bold tracking-tight text-secondary'>{title}</h3>
                    <p className='mt-2 text-sm leading-relaxed text-secondary/65'>{desc}</p>
                  </div>
                  <div className='relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-secondary bg-primary shadow-[0_8px_24px_rgba(104,26,21,0.15)]'>
                    <Icon size={24} className='text-secondary' />
                  </div>
                  <div className='hidden flex-1 md:block' />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section ref={testimonialsScope} className='bg-secondary/5 px-4 py-20'>
        <div className='mx-auto max-w-6xl'>
          <div data-gsap='test-heading' className='mb-12 text-center'>
            <p className='mb-2 text-xs font-semibold uppercase tracking-widest text-secondary/40'>Testimonials</p>
            <h2 className='font-display text-3xl font-black tracking-tight text-secondary md:text-5xl'>
              Founders who validated<br />with IdeaLab
            </h2>
          </div>
          <div className='grid gap-5 md:grid-cols-3'>
            {TESTIMONIALS.map(({ name, role, text }) => (
              <div key={name} data-gsap='test-card' className='relative rounded-2xl border border-secondary/20 bg-primary p-6 shadow-sm'>
                <Quote size={28} className='mb-4 text-secondary/20' />
                <p className='text-sm leading-relaxed text-secondary/80'>"{text}"</p>
                <div className='mt-5 flex items-center gap-3'>
                  <div className='flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary'>
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className='text-sm font-semibold text-secondary'>{name}</p>
                    <p className='text-xs text-secondary/55'>{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALIDATION JOURNEY ── */}
      <div className='bg-primary px-4 pt-20 pb-4'>
        <div data-gsap='section-heading' className='mx-auto max-w-6xl text-center'>
          <p className='mb-2 text-xs font-semibold uppercase tracking-widest text-secondary/40'>The Journey</p>
          <h2 className='font-display text-3xl font-black tracking-tight text-secondary md:text-5xl'>
            Your idea validation<br />journey, step by step
          </h2>
          <p className='mx-auto mt-4 max-w-xl text-sm leading-relaxed text-secondary/55'>
            Scroll through each phase — from raw concept to a validated, investor-ready idea.
          </p>
        </div>
      </div>
      <ValidationJourney />

      {/* ── TRENDING IDEAS ── */}
      <section ref={trendingScope} className='px-4 py-20'>
        <div className='mx-auto max-w-6xl'>
          <div data-gsap='section-heading' className='mb-10 flex items-end justify-between'>
            <div>
              <p className='mb-1 text-xs font-semibold uppercase tracking-widest text-secondary/40'>Community</p>
              <h2 className='font-display text-3xl font-black tracking-tight text-secondary md:text-4xl'>Trending This Week</h2>
            </div>
            <Link to='/explore'>
              <Button variant='secondary' className='hidden items-center gap-1 md:flex'>
                View all <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
          {isLoading ? (
            <div className='grid gap-4 md:grid-cols-3'>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className='grid gap-4 md:grid-cols-3'>
              {trending.slice(0, 6).map((idea, i) => (
                <div key={idea.id} data-gsap='section-item'>
                  <IdeaCard idea={idea} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section ref={ctaScope} className='px-4 pb-20'>
        <div className='mx-auto max-w-6xl'>
          <div data-gsap='cta-banner' className='relative overflow-hidden rounded-3xl bg-secondary px-8 py-16 text-center md:px-16'>
            <div data-gsap='cta-orb' className='pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-primary/8' />
            <div data-gsap='cta-orb' className='pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-primary/8' />
            <div className='pointer-events-none absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/20 to-transparent' />

            <p className='mb-3 text-xs font-semibold uppercase tracking-widest text-primary/50'>Get started today</p>
            <h2 className='font-display text-3xl font-black tracking-tight text-primary md:text-5xl'>
              Your next big idea<br />deserves real validation
            </h2>
            <p className='mx-auto mt-4 max-w-xl text-base text-primary/70'>
              Join thousands of entrepreneurs who stopped guessing and started building with confidence.
            </p>
            <div className='mt-8 flex flex-wrap justify-center gap-4'>
              <Link to='/register'>
                <motion.button
                  whileHover={{ backgroundColor: '#681A15', color: '#BBCAE1', borderColor: '#681A15' }}
                  transition={{ duration: 0.25 }}
                  className='group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary/60 bg-primary px-8 py-3.5 text-base font-semibold text-secondary shadow-[0_8px_24px_rgba(187,202,225,0.25)]'
                >
                  Join IdeaLab Free
                  <ArrowRight size={16} className='transition-transform duration-300 group-hover:translate-x-1' />
                </motion.button>
              </Link>
              <Link to='/explore'>
                <motion.button
                  whileHover={{ backgroundColor: '#BBCAE1', color: '#681A15', borderColor: '#BBCAE1' }}
                  transition={{ duration: 0.25 }}
                  className='inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary/60 bg-transparent px-8 py-3.5 text-base font-semibold text-primary'
                >
                  Explore Ideas
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

/* ── Validation Journey (framer-motion scroll) ── */
const STEPS = [
  { n: '01', icon: FileText,   label: 'Submit', img: step1Img, title: 'Craft Your Idea Brief',       desc: 'Fill in your startup concept in under 5 minutes — problem statement, proposed solution, target audience, and business model.', tags: ['Problem Statement', 'Solution', 'Target Market', 'Business Model'], stat: { value: '5 min', label: 'to submit' } },
  { n: '02', icon: Users,      label: 'Review', img: step2Img, title: 'Get Matched With Experts',    desc: 'Your idea is surfaced to vetted reviewers — entrepreneurs, investors, and domain experts who score across 4 dimensions.', tags: ['Market Fit', 'Innovation', 'Feasibility', 'ROI Potential'], stat: { value: '48h', label: 'first review' } },
  { n: '03', icon: BarChart2,  label: 'Score',  img: step3Img, title: 'Receive Your SGV Score',      desc: 'All feedback is aggregated into your Startup Global Validation score — a single benchmark from 0 to 100.', tags: ['SGV Score', 'Dimension Breakdown', 'Benchmark', 'Percentile Rank'], stat: { value: '81', label: 'avg SGV score' } },
  { n: '04', icon: RefreshCw,  label: 'Iterate',img: step4Img, title: 'Iterate & Revalidate',        desc: 'Use the detailed feedback to refine your idea. Update your brief, address weak dimensions, and resubmit.', tags: ['Actionable Feedback', 'Version History', 'Score Tracking', 'Community Q&A'], stat: { value: '+39pts', label: 'per iteration' } },
]

function StepRow({ step, index }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'start 20%'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 18 })

  const imgX      = useTransform(smooth, [0, 1], [index % 2 === 0 ? 80 : -80, 0])
  const imgOpacity = useTransform(smooth, [0, 0.4], [0, 1])
  const imgScale  = useTransform(smooth, [0, 1], [0.88, 1])
  const imgRotate = useTransform(smooth, [0, 1], [index % 2 === 0 ? 4 : -4, 0])
  const txtX      = useTransform(smooth, [0, 1], [index % 2 === 0 ? -60 : 60, 0])
  const txtOpacity = useTransform(smooth, [0, 0.5], [0, 1])

  const isEven = index % 2 === 0
  const Icon = step.icon

  return (
    <div ref={ref} className={`flex flex-col items-center gap-10 py-20 md:flex-row md:gap-16 ${isEven ? '' : 'md:flex-row-reverse'}`}>
      <motion.div style={{ x: imgX, opacity: imgOpacity, scale: imgScale, rotate: imgRotate }} className='relative w-full md:w-1/2'>
        <div className='absolute inset-x-8 bottom-0 h-2/3 rounded-full bg-secondary/12 blur-3xl' />
        <span className={`pointer-events-none absolute -top-10 select-none font-display text-[120px] font-black leading-none text-secondary/6 z-10 ${isEven ? '-left-4' : '-right-4'}`}>{step.n}</span>
        <div className='relative overflow-hidden rounded-3xl shadow-[0_32px_64px_rgba(104,26,21,0.18)]'>
          <img src={step.img} alt={step.title} className='h-[380px] w-full object-cover md:h-[440px]' />
          <div className='absolute inset-0 bg-gradient-to-t from-secondary/50 via-transparent to-transparent' />
          <div className='absolute bottom-5 left-5 rounded-2xl border border-primary/20 bg-secondary/80 px-4 py-2.5 backdrop-blur-sm'>
            <p className='font-display text-2xl font-black text-primary'>{step.stat.value}</p>
            <p className='text-xs text-primary/55'>{step.stat.label}</p>
          </div>
        </div>
      </motion.div>

      <motion.div style={{ x: txtX, opacity: txtOpacity }} className='w-full md:w-1/2'>
        <div className='mb-4 flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl border-2 border-secondary bg-primary shadow-[0_4px_16px_rgba(104,26,21,0.15)]'>
            <Icon size={18} className='text-secondary' />
          </div>
          <span className='text-xs font-bold uppercase tracking-widest text-secondary/45'>Step {step.n} · {step.label}</span>
        </div>
        <h3 className='font-display text-3xl font-black leading-tight tracking-tight text-secondary md:text-4xl'>{step.title}</h3>
        <p className='mt-4 text-base leading-relaxed text-secondary/60'>{step.desc}</p>
        <div className='mt-6 flex flex-wrap gap-2'>
          {step.tags.map((tag) => (
            <span key={tag} className='rounded-full border border-secondary/20 bg-secondary/6 px-3.5 py-1.5 text-xs font-semibold text-secondary/65'>{tag}</span>
          ))}
        </div>
        {index < STEPS.length - 1 && (
          <div className='mt-8 flex items-center gap-2 text-xs text-secondary/30'>
            <div className='h-px flex-1 bg-secondary/15' />
            <span className='font-semibold uppercase tracking-widest'>Next step</span>
            <div className='h-px flex-1 bg-secondary/15' />
          </div>
        )}
      </motion.div>
    </div>
  )
}

function ValidationJourney() {
  return (
    <section className='bg-primary px-4 pb-20'>
      <div className='mx-auto max-w-6xl divide-y divide-secondary/8'>
        {STEPS.map((step, i) => <StepRow key={step.n} step={step} index={i} />)}
      </div>
    </section>
  )
}
