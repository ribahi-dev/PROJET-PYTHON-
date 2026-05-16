import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { postComment } from '../../api/comments.api'
import useAuthStore from '../../store/authStore'
import Button from '../ui/Button'
import { useToast } from '../ui/Toast'

export default function CommentForm({ ideaId, parentId = null, onSuccess, onCancel }) {
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({ defaultValues: { content: '' } })

  const mutation = useMutation({
    mutationFn: (data) => postComment(data),
    onSuccess: () => {
      toast.success('Comment posted')
      reset()
      queryClient.invalidateQueries({ queryKey: ['comments', String(ideaId)] })
      onSuccess?.()
    },
    onError: (err) => toast.error(err?.response?.data?.detail || 'Could not post comment'),
  })

  if (!user) return null

  const charCount = (watch('content') || '').length

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate({
        idea: ideaId,
        parent: parentId || null,
        content: values.content,
      }))}
      className='rounded-2xl border border-secondary/15 bg-primary p-4'
    >
      <textarea
        {...register('content', {
          required: 'Comment is required',
          minLength: { value: 3, message: 'At least 3 characters' },
          maxLength: { value: 1000, message: 'Max 1000 characters' },
        })}
        rows={3}
        className='input-premium resize-none'
        placeholder={parentId ? 'Write your reply…' : 'Share your thoughts on this idea…'}
      />
      <div className='mt-2 flex items-center justify-between'>
        <span className='text-xs text-secondary/40'>
          {errors.content?.message || `${charCount}/1000`}
        </span>
        <div className='flex gap-2'>
          {onCancel && (
            <Button type='button' size='sm' variant='ghost' onClick={onCancel}>Cancel</Button>
          )}
          <Button type='submit' loading={mutation.isPending} size='sm'>
            {parentId ? 'Reply' : 'Post Comment'}
          </Button>
        </div>
      </div>
    </form>
  )
}
