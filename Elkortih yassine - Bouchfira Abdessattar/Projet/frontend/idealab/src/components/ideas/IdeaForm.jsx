import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, Lightbulb, Target, Layers, Eye } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { createIdea, updateIdea, getCategories } from '../../api/ideas.api'
import { SECTORS } from '../../utils/constants'
import Button from '../ui/Button'

const ease = [0.22, 1, 0.36, 1]

const STEPS = [
  { label: 'Basics',      icon: Lightbulb },
  { label: 'Description', icon: Layers },
  { label: 'Details',     icon: Target },
  { label: 'Preview',     icon: Eye },
]

export default function IdeaForm({ initialData, onSubmit }) {
  const [step, setStep] = useState(0)
  const queryClient = useQueryClient()

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm({
    defaultValues: {
      title:       initialData?.title       || '',
      sector:      initialData?.sector      || '',
      description: initialData?.description || '',
      problem:     initialData?.problem     || '',
      solution:    initialData?.solution    || '',
      target:      initialData?.target      || '',
    },
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getCategories()
      return Array.isArray(res.data?.results) ? res.data.results : (Array.isArray(res.data) ? res.data : [])
    },
  })

  const mutation = useMutation({
    mutationFn: (payload) => initialData?.id ? updateIdea(initialData.id, payload) : createIdea(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] })
      queryClient.invalidateQueries({ queryKey: ['my-ideas'] })
      queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboard'] })
    },
  })

  const values = watch()
  const descLen = (values.description || '').length

  const FIELDS_BY_STEP = [
    ['title', 'sector'],
    ['description', 'problem', 'solution'],
    ['target'],
  ]

  const next = async () => {
    const ok = await trigger(FIELDS_BY_STEP[step] || [])
    if (ok) setStep((s) => Math.min(3, s + 1))
  }

  const submitWithStatus = (status) => {
    mutation.mutate({ ...values, status }, {
      onSuccess: (res) => onSubmit?.(res?.data, status),
    })
  }

  return (
    <div className='overflow-hidden rounded-2xl border border-secondary/15 bg-primary shadow-[0_8px_40px_rgba(104,26,21,0.08)]'>
      {/* Step progress */}
      <div className='border-b border-secondary/10 px-8 py-5'>
        <div className='flex items-center gap-0'>
          {STEPS.map(({ label, icon: Icon }, idx) => {
            const done   = idx < step
            const active = idx === step
            return (
              <div key={label} className='flex flex-1 items-center'>
                <div className='flex flex-col items-center gap-1.5'>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl border-2 transition-all duration-300 ${
                    done   ? 'border-secondary bg-secondary text-primary' :
                    active ? 'border-secondary bg-secondary/10 text-secondary' :
                             'border-secondary/20 bg-primary text-secondary/30'
                  }`}>
                    {done ? <Check size={15} /> : <Icon size={15} />}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-secondary' : done ? 'text-secondary/60' : 'text-secondary/25'}`}>
                    {label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`mx-2 mb-5 h-px flex-1 transition-all duration-500 ${done ? 'bg-secondary' : 'bg-secondary/15'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step content */}
      <div className='px-8 py-7'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3, ease }}
            className='relative space-y-5'
          >
            {step === 0 && (
              <>
                <Field label='Idea Title' error={errors.title?.message}>
                  <input
                    {...register('title', { required: 'Title is required', maxLength: { value: 200, message: 'Max 200 chars' } })}
                    placeholder='e.g. AI-powered supply chain optimizer'
                    className='input-premium'
                  />
                </Field>
                <Field label='Sector' error={errors.sector?.message}>
                  <select {...register('sector', { required: 'Sector is required' })} className='input-premium'>
                    <option value=''>Select a sector</option>
                    {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </>
            )}

            {step === 1 && (
              <>
                <Field label='Short Description' error={errors.description?.message} hint={`${descLen}/300`}>
                  <textarea
                    {...register('description', { required: 'Description is required', maxLength: { value: 300, message: 'Max 300 chars' } })}
                    rows={3}
                    placeholder='Summarize your idea in 2-3 sentences…'
                    className='input-premium resize-none'
                  />
                </Field>
                <Field label='Problem Statement' error={errors.problem?.message}>
                  <textarea
                    {...register('problem', { required: 'Required', minLength: { value: 30, message: 'Min 30 chars' } })}
                    rows={4}
                    placeholder='What problem does this solve?'
                    className='input-premium resize-none'
                  />
                </Field>
                <Field label='Your Solution' error={errors.solution?.message}>
                  <textarea
                    {...register('solution', { required: 'Required', minLength: { value: 30, message: 'Min 30 chars' } })}
                    rows={4}
                    placeholder='How does your idea solve the problem?'
                    className='input-premium resize-none'
                  />
                </Field>
              </>
            )}

            {step === 2 && (
              <Field label='Target Audience'>
                <textarea
                  {...register('target')}
                  rows={5}
                  placeholder='Who is this for? Describe your ideal customer or user.'
                  className='input-premium resize-none'
                />
              </Field>
            )}

            {step === 3 && (
              <div className='space-y-3 rounded-xl border border-secondary/15 bg-secondary/4 p-5'>
                <h3 className='font-display text-sm font-bold uppercase tracking-widest text-secondary/50'>Review your idea</h3>
                {[
                  { label: 'Title',       value: values.title },
                  { label: 'Sector',      value: values.sector },
                  { label: 'Description', value: values.description },
                  { label: 'Problem',     value: values.problem },
                  { label: 'Solution',    value: values.solution },
                  { label: 'Target',      value: values.target },
                ].map(({ label, value }) => (
                  <div key={label} className='border-b border-secondary/8 pb-3 last:border-0 last:pb-0'>
                    <p className='mb-0.5 text-[10px] font-bold uppercase tracking-widest text-secondary/40'>{label}</p>
                    <p className='text-sm text-secondary'>{value || <span className='italic text-secondary/30'>Not provided</span>}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className='flex items-center justify-between border-t border-secondary/10 px-8 py-5'>
        <Button variant='ghost' disabled={step === 0} onClick={() => setStep((s) => s - 1)}>← Back</Button>
        {step < 3 ? (
          <Button onClick={next}>
            Continue <ChevronRight size={15} />
          </Button>
        ) : (
          <div className='flex gap-3'>
            <Button variant='secondary' loading={mutation.isPending} onClick={() => submitWithStatus('draft')}>
              Save Draft
            </Button>
            <Button loading={mutation.isPending} onClick={() => submitWithStatus('submitted')}>
              Submit Idea
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, error, hint, children }) {
  return (
    <div>
      <div className='mb-1.5 flex items-center justify-between'>
        <label className='text-sm font-semibold text-secondary/80'>{label}</label>
        {hint && <span className='text-xs text-secondary/35'>{hint}</span>}
      </div>
      {children}
      {error && <p className='mt-1.5 text-xs text-secondary/60'>{error}</p>}
    </div>
  )
}
