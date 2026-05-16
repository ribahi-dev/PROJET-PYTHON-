import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { ArrowRight, CheckCircle2, Eye, EyeOff, Lightbulb, Sparkles } from 'lucide-react'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useLogin } from '../hooks/useAuth'
import loginChar from '../assets/login-char.png'

gsap.registerPlugin(SplitText)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const PERKS = [
  'Get feedback from vetted experts',
  'Track your SGV score over time',
  'Join 450+ active founders',
]

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError]         = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm()
  const loginMutation = useLogin()

  const leftRef   = useRef(null)
  const rightRef  = useRef(null)
  const btnRef    = useRef(null)

  /* ── Left panel entrance ── */
  useGSAP(() => {
    const el = leftRef.current
    if (!el) return

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

    // floating rings
    gsap.to(el.querySelectorAll('[data-ring]'), {
      scale: 1.08, opacity: 0.7, duration: 3.5,
      repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: 1,
    })

    // logo
    tl.from('[data-l="logo"]', { opacity: 0, x: -24, duration: 0.7 })

    // headline split
    const h = el.querySelector('[data-l="headline"]')
    if (h) {
      SplitText.create(h, {
        type: 'words',
        onSplit: (self) => {
          tl.from(self.words, { opacity: 0, y: 30, stagger: 0.08, duration: 0.7, ease: 'power3.out' }, '-=0.3')
        },
      })
    }

    tl.from('[data-l="sub"]',   { opacity: 0, y: 16, duration: 0.6 }, '-=0.3')
    tl.from('[data-l="perks"] li', { opacity: 0, x: -20, stagger: 0.1, duration: 0.5 }, '-=0.3')
    tl.from('[data-l="quote"]', { opacity: 0, y: 20, duration: 0.6 }, '-=0.2')

    // ambient glow pulse
    gsap.to('[data-l="glow"]', {
      opacity: 0.12, scale: 1.15, duration: 4,
      repeat: -1, yoyo: true, ease: 'sine.inOut',
    })
  }, { scope: leftRef })

  /* ── Right panel entrance ── */
  useGSAP(() => {
    const el = rightRef.current
    if (!el) return

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: 0.15 })

    tl.from('[data-r="badge"]',    { opacity: 0, y: -12, scale: 0.9, duration: 0.5 })
    tl.from('[data-r="title"]',    { opacity: 0, x: -30, duration: 0.7 }, '-=0.2')
    tl.from('[data-r="char"]',     { opacity: 0, x: 40, rotate: 6, duration: 0.8, ease: 'back.out(1.4)' }, '-=0.5')
    tl.from('[data-r="sub"]',      { opacity: 0, y: 10, duration: 0.5 }, '-=0.3')
    tl.from('[data-r="field"]',    { opacity: 0, y: 24, stagger: 0.12, duration: 0.55 }, '-=0.2')
    tl.from('[data-r="footer"]',   { opacity: 0, duration: 0.5 }, '-=0.1')

    // character float
    gsap.to('[data-r="char"]', {
      y: -8, duration: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut',
    })
  }, { scope: rightRef })

  /* ── Magnetic submit button ── */
  useGSAP(() => {
    const btn = btnRef.current
    if (!btn) return
    const onMove = (e) => {
      const r  = btn.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width  / 2)
      const dy = e.clientY - (r.top  + r.height / 2)
      gsap.to(btn, { x: dx * 0.25, y: dy * 0.25, duration: 0.3, ease: 'power2.out' })
    }
    const onLeave = () => gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.4)' })
    btn.addEventListener('mousemove', onMove)
    btn.addEventListener('mouseleave', onLeave)
    return () => { btn.removeEventListener('mousemove', onMove); btn.removeEventListener('mouseleave', onLeave) }
  }, { scope: btnRef })

  const onSubmit = (values) => {
    setApiError('')
    loginMutation.mutate(values, {
      onError: (err) => setApiError(err?.response?.data?.detail || 'Invalid credentials'),
    })
  }

  return (
    <div className='flex h-[calc(100vh-64px)]'>

      {/* ── LEFT BRAND PANEL ── */}
      <div ref={leftRef} className='relative hidden flex-col justify-between overflow-hidden bg-secondary px-12 py-16 lg:flex lg:w-[45%] h-full'>
        <div data-ring className='pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full border border-primary/10' />
        <div data-ring className='pointer-events-none absolute -left-12 -top-12 h-64 w-64 rounded-full border border-primary/15' />
        <div data-ring className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full border border-primary/10' />
        <div data-l='glow' className='pointer-events-none absolute bottom-32 right-0 h-48 w-48 rounded-full bg-primary/5 blur-3xl' />

        <div data-l='logo' className='flex items-center gap-2'>
          <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15'>
            <Lightbulb size={18} className='text-primary' />
          </div>
          <span className='font-display text-xl font-black tracking-tight text-primary'>IdeaLab</span>
        </div>

        <div>
          <p className='mb-3 text-xs font-semibold uppercase tracking-widest text-primary/40'>Welcome back</p>
          <h2 data-l='headline' className='font-display text-4xl font-black leading-tight tracking-tight text-primary'>
            Your next big<br />idea is waiting.
          </h2>
          <p data-l='sub' className='mt-4 text-sm leading-relaxed text-primary/60'>
            Sign in to access your dashboard, track your validation scores, and connect with the community.
          </p>
          <ul data-l='perks' className='mt-8 space-y-3'>
            {PERKS.map((p) => (
              <li key={p} className='flex items-center gap-3 text-sm text-primary/70'>
                <CheckCircle2 size={15} className='shrink-0 text-primary/50' />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div data-l='quote' className='rounded-2xl border border-primary/15 bg-primary/8 p-5'>
          <p className='text-sm italic leading-relaxed text-primary/65'>
            "IdeaLab helped me validate my SaaS idea in 3 days. The feedback was sharper than any accelerator I've been to."
          </p>
          <div className='mt-3 flex items-center gap-2'>
            <div className='flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary'>JM</div>
            <div>
              <p className='text-xs font-semibold text-primary/80'>James M.</p>
              <p className='text-xs text-primary/45'>Founder, Stackly</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div ref={rightRef} className='flex flex-1 h-full items-center justify-center overflow-y-auto bg-primary px-6 py-16'>
        <div className='w-full max-w-md'>

          <div className='mb-8 flex items-center gap-2 lg:hidden'>
            <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/15'>
              <Lightbulb size={16} className='text-secondary' />
            </div>
            <span className='font-display text-lg font-black tracking-tight text-secondary'>IdeaLab</span>
          </div>

          <div data-r='badge' className='mb-1 inline-flex items-center gap-1.5 rounded-full border border-secondary/20 bg-secondary/8 px-3 py-1 text-xs font-semibold text-secondary/60'>
            <Sparkles size={11} /> Sign in to your account
          </div>

          <div className='mt-3 flex items-center justify-between gap-3'>
            <h1 data-r='title' className='font-display text-6xl font-black leading-tight tracking-tight text-secondary'>WELCOME!</h1>
            <img data-r='char' src={loginChar} alt='' style={{ height: '160px', width: '160px' }} className='shrink-0 object-contain drop-shadow-xl' />
          </div>

          <p data-r='sub' className='mt-2 text-sm text-secondary/55'>
            Don't have an account?{' '}
            <Link to='/register' className='font-semibold text-secondary underline-offset-2 hover:underline'>Create one free</Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className='mt-8 space-y-5'>
            <div data-r='field'>
              <Field label='Username' error={errors.username?.message}>
                <input
                  {...register('username', { required: 'Username is required' })}
                  placeholder='your username'
                  className='input-premium'
                />
              </Field>
            </div>

            <div data-r='field'>
              <Field label='Password' error={errors.password?.message}>
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Minimum 8 characters' },
                    })}
                    placeholder='••••••••'
                    className='input-premium pr-11'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword((v) => !v)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-secondary/40 hover:text-secondary/70'
                    aria-label='Toggle password'
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </Field>
            </div>

            {apiError && (
              <p className='rounded-lg border border-secondary/20 bg-secondary/8 px-4 py-2.5 text-sm text-secondary'>
                {apiError}
              </p>
            )}

            <div ref={btnRef} data-r='field'>
              <Button type='submit' loading={loginMutation.isPending} className='group w-full py-3 text-base'>
                Sign in
                <ArrowRight size={16} className='transition-transform duration-300 group-hover:translate-x-1' />
              </Button>
            </div>
          </form>

          <p data-r='footer' className='mt-8 text-center text-xs text-secondary/35'>
            By signing in you agree to our{' '}
            <span className='cursor-pointer underline-offset-2 hover:underline'>Terms</span> &amp;{' '}
            <span className='cursor-pointer underline-offset-2 hover:underline'>Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className='mb-1.5 block text-sm font-semibold text-secondary/80'>{label}</label>
      {children}
      {error && <p className='mt-1.5 text-xs text-secondary/70'>{error}</p>}
    </div>
  )
}
