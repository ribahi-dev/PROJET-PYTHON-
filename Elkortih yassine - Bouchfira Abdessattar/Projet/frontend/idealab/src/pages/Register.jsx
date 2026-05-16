import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, Eye, EyeOff, Info, Lightbulb, Sparkles, Target, Users } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useToast } from '../components/ui/Toast'
import { useRegister } from '../hooks/useAuth'
import heroImg from '../assets/reg.png'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_RE = /^\S+$/
const ease = [0.22, 1, 0.36, 1]

const ROLE_OPTIONS = [
  {
    value: 'entrepreneur',
    icon: Lightbulb,
    label: 'Entrepreneur',
    desc: 'Submit & validate your startup ideas',
  },
  {
    value: 'reviewer',
    icon: BarChart3,
    label: 'Reviewer',
    desc: 'Review ideas and earn reputation points',
  },
]

const HIGHLIGHTS = [
  { icon: Target, text: 'Multi-dimensional idea scoring' },
  { icon: Users, text: 'Community of 450+ founders' },
  { icon: BarChart3, text: 'Real-time SGV analytics' },
]

export default function Register() {
  const [apiError, setApiError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const toast = useToast()
  const registerMutation = useRegister()
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({ defaultValues: { role: 'entrepreneur' } })

  const password = watch('password')
  const selectedRole = watch('role')
  const passwordConfirm = watch('password_confirm')

  const onSubmit = (values) => {
    setApiError('')
    const [first_name = '', ...rest] = (values.full_name || '').trim().split(' ')
    const last_name = rest.join(' ')
    const payload = { ...values, first_name, last_name }
    delete payload.full_name
    registerMutation.mutate(payload, {
      onSuccess: () => {},
      onError: (err) => {
        const d = err?.response?.data
        const msg = d?.detail || d?.email?.[0] || d?.username?.[0] || d?.password?.[0] || d?.non_field_errors?.[0] || 'Registration failed. Please try again.'
        setApiError(msg)
      },
    })
  }

  return (
    <div className='flex h-[calc(100vh-64px)]'>

      {/* ── LEFT BRAND PANEL ── */}
      <div className='relative hidden flex-col justify-between overflow-hidden bg-secondary px-12 py-16 lg:flex lg:w-[42%] h-full'>
        <div className='pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full border border-primary/10' />
        <div className='pointer-events-none absolute -left-12 -top-12 h-64 w-64 rounded-full border border-primary/15' />
        <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full border border-primary/10' />
        <div className='pointer-events-none absolute bottom-32 right-0 h-48 w-48 rounded-full bg-primary/5 blur-3xl' />

        {/* logo */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className='flex items-center gap-2'
        >
          <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15'>
            <Lightbulb size={18} className='text-primary' />
          </div>
          <span className='font-display text-xl font-black tracking-tight text-primary'>IdeaLab</span>
        </motion.div>

        {/* welcome image block */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease }}
          className='relative flex flex-col items-center'
        >
          {/* glow backdrop */}
          <div className='absolute inset-x-4 bottom-0 h-3/4 rounded-full bg-primary/10 blur-3xl' />
          <div className='absolute inset-x-12 bottom-0 h-1/2 rounded-full bg-primary/15 blur-2xl' />

          {/* welcome badge */}
          <div className='relative z-10 mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary/70'>
            <Sparkles size={11} /> Welcome to IdeaLab
          </div>

          {/* image */}
          <img
            src={heroImg}
            alt='Welcome'
            className='relative z-10 w-64 drop-shadow-2xl xl:w-72'
            style={{ filter: 'drop-shadow(0 32px 48px rgba(187,202,225,0.25))' }}
          />

          {/* floating stat card — top right */}
          <motion.div
            initial={{ opacity: 0, x: 24, y: -8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease }}
            className='absolute -right-4 top-8 z-20 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 backdrop-blur-sm xl:-right-8'
          >
            <p className='font-display text-2xl font-black text-primary'>450+</p>
            <p className='text-xs text-primary/55'>Active founders</p>
          </motion.div>

          {/* floating stat card — bottom left */}
          <motion.div
            initial={{ opacity: 0, x: -24, y: 8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65, ease }}
            className='absolute -left-4 bottom-12 z-20 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 backdrop-blur-sm xl:-left-8'
          >
            <p className='font-display text-2xl font-black text-primary'>48h</p>
            <p className='text-xs text-primary/55'>First feedback</p>
          </motion.div>
        </motion.div>

        {/* headline + highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.25, ease }}
        >
          <h2 className='font-display text-3xl font-black leading-tight tracking-tight text-primary'>
            Stop guessing.<br />Start validating.
          </h2>
          <ul className='mt-5 space-y-3'>
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className='flex items-center gap-3'>
                <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10'>
                  <Icon size={13} className='text-primary/70' />
                </div>
                <span className='text-sm text-primary/65'>{text}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className='flex flex-1 items-start justify-center overflow-y-auto bg-primary px-6 py-12 h-full'>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease }}
          className='w-full max-w-lg'
        >
          {/* mobile logo */}
          <div className='mb-8 flex items-center gap-2 lg:hidden'>
            <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/15'>
              <Lightbulb size={16} className='text-secondary' />
            </div>
            <span className='font-display text-lg font-black tracking-tight text-secondary'>IdeaLab</span>
          </div>

          <div className='mb-1 inline-flex items-center gap-1.5 rounded-full border border-secondary/20 bg-secondary/8 px-3 py-1 text-xs font-semibold text-secondary/60'>
            <Sparkles size={11} /> Free forever — no credit card
          </div>
          <h1 className='font-display mt-3 text-3xl font-black tracking-tight text-secondary'>Create your account</h1>
          <p className='mt-1.5 text-sm text-secondary/55'>Already have one? <Link to='/login' className='font-semibold text-secondary underline-offset-2 hover:underline'>Sign in</Link></p>

          <form onSubmit={handleSubmit(onSubmit)} className='mt-8 space-y-5'>

            {/* role selector */}
            <div>
              <label className='mb-2 flex items-center gap-1.5 text-sm font-semibold text-secondary/80'>
                I am a…
                <span title='Entrepreneur: submit ideas. Reviewer: review and score ideas.'>
                  <Info size={13} className='text-secondary/35' />
                </span>
              </label>
              <div className='grid grid-cols-2 gap-3'>
                {ROLE_OPTIONS.map(({ value, icon: Icon, label, desc }) => (
                  <button
                    key={value}
                    type='button'
                    onClick={() => setValue('role', value)}
                    className={`flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                      selectedRole === value
                        ? 'border-secondary bg-secondary/8 shadow-[0_4px_16px_rgba(104,26,21,0.12)]'
                        : 'border-secondary/20 bg-primary hover:border-secondary/40'
                    }`}
                  >
                    <Icon size={18} className={selectedRole === value ? 'text-secondary' : 'text-secondary/40'} />
                    <p className={`text-sm font-bold ${selectedRole === value ? 'text-secondary' : 'text-secondary/60'}`}>{label}</p>
                    <p className='text-xs leading-snug text-secondary/45'>{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* two-col row */}
            <div className='grid grid-cols-2 gap-4'>
              <Field label='Full name' error={errors.full_name?.message}>
                <input
                  {...register('full_name', { required: 'Required', minLength: { value: 2, message: 'Min 2 chars' } })}
                  placeholder='John Doe'
                  className='input-premium'
                />
              </Field>
              <Field label='Username' error={errors.username?.message}>
                <input
                  {...register('username', {
                    required: 'Required',
                    minLength: { value: 3, message: 'Min 3 chars' },
                    pattern: { value: USERNAME_RE, message: 'No spaces allowed' },
                  })}
                  placeholder='johndoe'
                  className='input-premium'
                />
              </Field>
            </div>

            <Field label='Email address' error={errors.email?.message}>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: EMAIL_RE, message: 'Enter a valid email' },
                })}
                placeholder='you@example.com'
                className='input-premium'
              />
            </Field>

            <div className='grid grid-cols-2 gap-4'>
              <Field label='Password' error={errors.password?.message}>
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })}
                    placeholder='••••••••'
                    className='input-premium pr-11'
                  />
                  <button type='button' onClick={() => setShowPassword((v) => !v)} className='absolute right-3 top-1/2 -translate-y-1/2 text-secondary/40 hover:text-secondary/70'>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
              <Field label='Confirm password' error={errors.password_confirm?.message}>
                <div className='relative'>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    {...register('password_confirm', {
                      required: 'Required',
                      validate: (v) => v === password || 'Passwords do not match',
                    })}
                    placeholder='••••••••'
                    className='input-premium pr-11'
                  />
                  <button type='button' onClick={() => setShowConfirm((v) => !v)} className='absolute right-3 top-1/2 -translate-y-1/2 text-secondary/40 hover:text-secondary/70'>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
            </div>

            {apiError && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className='rounded-lg border border-secondary/20 bg-secondary/8 px-4 py-2.5 text-sm text-secondary'
              >
                {apiError}
              </motion.p>
            )}

            <Button type='submit' loading={registerMutation.isPending} className='group w-full py-3 text-base'>
              Create account
              <ArrowRight size={16} className='transition-transform duration-300 group-hover:translate-x-1' />
            </Button>
          </form>

          <p className='mt-6 text-center text-xs text-secondary/35'>
            By creating an account you agree to our{' '}
            <span className='cursor-pointer underline-offset-2 hover:underline'>Terms</span> &amp;{' '}
            <span className='cursor-pointer underline-offset-2 hover:underline'>Privacy Policy</span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className='mb-1.5 block text-sm font-semibold text-secondary/80'>{label}</label>
      {children}
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className='mt-1.5 text-xs text-secondary/70'>
          {error}
        </motion.p>
      )}
    </div>
  )
}
