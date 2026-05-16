import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Lightbulb, Sparkles } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getIdea } from '../api/ideas.api'
import IdeaForm from '../components/ideas/IdeaForm'
import { useToast } from '../components/ui/Toast'

const ease = [0.22, 1, 0.36, 1]

export default function SubmitIdea() {
  const navigate = useNavigate()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')

  const { data: editIdea, isLoading } = useQuery({
    queryKey: ['idea', editId],
    queryFn: () => getIdea(editId).then((r) => r.data),
    enabled: !!editId,
  })

  const handleSubmit = (idea, status) => {
    if (status === 'draft') {
      toast.success('Saved as draft')
      navigate('/dashboard')
    } else {
      toast.success('Idea submitted for review!')
      navigate('/dashboard')
    }
  }

  if (editId && isLoading) {
    return (
      <div className='min-h-screen bg-primary'>
        <div className='h-32 animate-pulse bg-secondary/10' />
        <div className='mx-auto max-w-3xl px-6 py-8'>
          <div className='h-96 animate-pulse rounded-2xl bg-secondary/10' />
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-primary'>
      {/* Header */}
      <div className='relative overflow-hidden border-b border-secondary/10 bg-secondary px-8 py-10'>
        <div className='pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-primary/10' />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          <div className='mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary/60'>
            <Sparkles size={11} /> {editId ? 'Edit Idea' : 'New Idea'}
          </div>
          <h1 className='font-display text-3xl font-black tracking-tight text-primary'>
            {editId ? 'Edit your idea' : 'Submit your idea'}
          </h1>
          <p className='mt-1 text-sm text-primary/55'>
            {editId ? 'Update your idea details below.' : 'Fill in the details and get expert feedback from our reviewer community.'}
          </p>
        </motion.div>
      </div>

      <div className='mx-auto max-w-3xl px-6 py-8'>
        {/* Tips card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease }}
          className='mb-6 flex items-start gap-3 rounded-2xl border border-secondary/15 bg-secondary/5 px-5 py-4'
        >
          <Lightbulb size={16} className='mt-0.5 shrink-0 text-secondary/50' />
          <p className='text-sm text-secondary/65'>
            Be specific and clear. Ideas with detailed problem statements and solutions receive <span className='font-semibold text-secondary'>3x more feedback</span> from reviewers.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease }}
        >
          <IdeaForm initialData={editIdea} onSubmit={handleSubmit} />
        </motion.div>
      </div>
    </div>
  )
}
