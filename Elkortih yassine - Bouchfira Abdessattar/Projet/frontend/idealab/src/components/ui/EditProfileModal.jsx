import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { updateMyProfile } from '../../api/users.api'
import useAuthStore from '../../store/authStore'
import Avatar from './Avatar'
import Button from './Button'
import Modal from './Modal'
import { useToast } from './Toast'

export default function EditProfileModal({ isOpen, onClose, currentUser, onSuccess }) {
  const [preview, setPreview] = useState('')
  const toast = useToast()
  const queryClient = useQueryClient()
  const updateUser = useAuthStore((s) => s.updateUser)

  const { register, handleSubmit, watch, setError, formState: { errors } } = useForm({
    defaultValues: {
      full_name: currentUser?.full_name || '',
      username: currentUser?.username || '',
      bio: currentUser?.bio || '',
      speciality: currentUser?.speciality || '',
      twitter: currentUser?.twitter || '',
      linkedin: currentUser?.linkedin || '',
      github: currentUser?.github || '',
    },
  })

  const bioLen = (watch('bio') || '').length

  const mutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: ({ data }) => {
      updateUser(data)
      toast.success('Profile updated!')
      queryClient.invalidateQueries({ queryKey: ['user', currentUser?.username] })
      onSuccess?.(data)
      onClose()
    },
    onError: (error) => {
      const msg = error?.response?.data?.detail || 'Could not update profile'
      if (String(msg).toLowerCase().includes('username')) setError('username', { message: msg })
      else toast.error(msg)
    },
  })

  const avatarSrc = useMemo(() => preview || currentUser?.avatar, [preview, currentUser])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Edit Profile'>
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className='space-y-3'>
        <div className='flex items-center gap-3'>
          <Avatar src={avatarSrc} username={currentUser?.username} size='lg' />
          <label className='text-sm text-secondary'>
            Upload avatar
            <input
              type='file'
              accept='image/*'
              className='hidden'
              {...register('avatar_file')}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                if (file.size > 2 * 1024 * 1024) return
                setPreview(URL.createObjectURL(file))
              }}
            />
          </label>
        </div>

        <Field label='Full name' error={errors.full_name?.message}><input {...register('full_name')} className='w-full rounded border border-secondary/30 bg-primary px-3 py-2 text-sm text-secondary' /></Field>
        <Field label='Username' error={errors.username?.message}><input {...register('username', { required: 'Username is required' })} className='w-full rounded border border-secondary/30 bg-primary px-3 py-2 text-sm text-secondary' /></Field>
        <Field label='Bio' error={errors.bio?.message}>
          <textarea {...register('bio', { maxLength: { value: 500, message: 'Max 500 chars' } })} rows={4} className='w-full rounded border border-secondary/30 bg-primary px-3 py-2 text-sm text-secondary' />
          <p className='text-xs text-secondary/60'>{bioLen}/500</p>
        </Field>
        <Field label='Speciality'><input {...register('speciality')} className='w-full rounded border border-secondary/30 bg-primary px-3 py-2 text-sm text-secondary' /></Field>
        <Field label='Twitter'><input {...register('twitter')} className='w-full rounded border border-secondary/30 bg-primary px-3 py-2 text-sm text-secondary' /></Field>
        <Field label='LinkedIn'><input {...register('linkedin')} className='w-full rounded border border-secondary/30 bg-primary px-3 py-2 text-sm text-secondary' /></Field>
        <Field label='GitHub'><input {...register('github')} className='w-full rounded border border-secondary/30 bg-primary px-3 py-2 text-sm text-secondary' /></Field>

        <div className='flex justify-end gap-2'>
          <Button variant='ghost' onClick={onClose} type='button'>Cancel</Button>
          <Button type='submit' loading={mutation.isPending}>Save</Button>
        </div>
      </form>
    </Modal>
  )
}

function Field({ label, error, children }) {
  return <div><label className='mb-1 block text-sm font-medium'>{label}</label>{children}{error && <p className='mt-1 text-xs text-secondary'>{error}</p>}</div>
}
