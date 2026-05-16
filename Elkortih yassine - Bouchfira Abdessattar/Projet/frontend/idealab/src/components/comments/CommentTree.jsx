import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Pencil, Trash2, ThumbsUp, ThumbsDown, Reply } from 'lucide-react'
import { useState } from 'react'
import { deleteComment, editComment, getComments } from '../../api/comments.api'
import { castVote, getVoteStats } from '../../api/votes.api'
import useAuthStore from '../../store/authStore'
import { timeAgo } from '../../utils/helpers'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'
import { useToast } from '../ui/Toast'
import CommentForm from './CommentForm'

const ease = [0.22, 1, 0.36, 1]

export default function CommentTree({ ideaId }) {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const toast = useToast()
  const [replyTo, setReplyTo] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', String(ideaId)],
    queryFn: async () => {
      const res = await getComments(ideaId)
      return Array.isArray(res.data?.results) ? res.data.results : (Array.isArray(res.data) ? res.data : [])
    },
    enabled: !!ideaId,
  })

  const editMutation = useMutation({
    mutationFn: ({ id, content }) => editComment(id, { content }),
    onSuccess: () => {
      setEditingId(null)
      queryClient.invalidateQueries({ queryKey: ['comments', String(ideaId)] })
    },
    onError: (err) => toast.error(err?.response?.data?.detail || 'Could not edit comment'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', String(ideaId)] }),
    onError: (err) => toast.error(err?.response?.data?.detail || 'Could not delete comment'),
  })

  if (isLoading) return (
    <div className='space-y-3'>
      {Array.from({ length: 3 }).map((_, i) => <div key={i} className='h-20 animate-pulse rounded-2xl bg-secondary/8' />)}
    </div>
  )

  return (
    <div className='space-y-4'>
      {comments.length ? (
        <AnimatePresence>
          {comments.map((comment, i) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04, ease }}
            >
              <CommentNode
                comment={comment}
                user={user}
                ideaId={ideaId}
                isEditing={editingId === comment.id}
                editText={editText}
                setEditText={setEditText}
                onEdit={() => { setEditingId(comment.id); setEditText(comment.content) }}
                onSaveEdit={() => editMutation.mutate({ id: comment.id, content: editText })}
                onCancelEdit={() => setEditingId(null)}
                onDelete={() => deleteMutation.mutate(comment.id)}
                onReply={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                isReplying={replyTo === comment.id}
              />

              {/* Reply form */}
              <AnimatePresence>
                {replyTo === comment.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease }}
                    className='ml-10 mt-2'
                  >
                    <CommentForm
                      ideaId={ideaId}
                      parentId={comment.id}
                      onSuccess={() => setReplyTo(null)}
                      onCancel={() => setReplyTo(null)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Nested replies */}
              {comment.replies?.length > 0 && (
                <div className='ml-10 mt-2 space-y-2 border-l-2 border-secondary/8 pl-4'>
                  {comment.replies.map((reply) => (
                    <CommentNode
                      key={reply.id}
                      comment={reply}
                      user={user}
                      ideaId={ideaId}
                      isEditing={editingId === reply.id}
                      editText={editText}
                      setEditText={setEditText}
                      onEdit={() => { setEditingId(reply.id); setEditText(reply.content) }}
                      onSaveEdit={() => editMutation.mutate({ id: reply.id, content: editText })}
                      onCancelEdit={() => setEditingId(null)}
                      onDelete={() => deleteMutation.mutate(reply.id)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      ) : (
        <EmptyState icon={MessageSquare} title='No comments yet' description='Be the first to share your thoughts.' />
      )}

      {/* New comment form */}
      <div className='pt-2'>
        <CommentForm ideaId={ideaId} />
      </div>
    </div>
  )
}

function CommentNode({ comment, user, ideaId, isEditing, editText, setEditText, onEdit, onSaveEdit, onCancelEdit, onDelete, onReply, isReplying }) {
  const queryClient = useQueryClient()
  const isOwn = user && String(user.id) === String(comment.author)
  const canEdit = comment.can_edit && isOwn

  const voteMutation = useMutation({
    mutationFn: (value) => castVote({ target_type: 'comment', target_id: comment.id, value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', String(ideaId)] }),
  })

  const { data: voteStats } = useQuery({
    queryKey: ['votes', 'comment', comment.id],
    queryFn: () => getVoteStats('comment', comment.id).then((r) => r.data),
    enabled: !!user,
  })

  return (
    <div className='rounded-2xl border border-secondary/12 bg-primary p-4'>
      <div className='flex items-start gap-3'>
        <Avatar src={comment.author_avatar} username={comment.author_name || 'U'} size='sm' />
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2'>
            <p className='text-sm font-bold text-secondary'>{comment.author_name}</p>
            <p className='text-xs text-secondary/35'>{timeAgo(comment.created_at)}</p>
            {comment.updated_at !== comment.created_at && (
              <p className='text-xs text-secondary/25 italic'>edited</p>
            )}
          </div>

          {isEditing ? (
            <div className='mt-2'>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                className='input-premium resize-none'
              />
              <div className='mt-2 flex gap-2'>
                <Button size='sm' onClick={onSaveEdit}>Save</Button>
                <Button size='sm' variant='ghost' onClick={onCancelEdit}>Cancel</Button>
              </div>
            </div>
          ) : (
            <p className='mt-1 text-sm leading-relaxed text-secondary/65'>{comment.content}</p>
          )}

          {/* Actions */}
          {user && !isEditing && (
            <div className='mt-2 flex flex-wrap items-center gap-3'>
              {/* Vote */}
              <button
                onClick={() => voteMutation.mutate(1)}
                className={`flex items-center gap-1 text-xs font-semibold transition-colors ${voteStats?.user_vote === 1 ? 'text-secondary' : 'text-secondary/35 hover:text-secondary'}`}
              >
                <ThumbsUp size={12} /> {voteStats?.upvotes || 0}
              </button>
              <button
                onClick={() => voteMutation.mutate(-1)}
                className={`flex items-center gap-1 text-xs font-semibold transition-colors ${voteStats?.user_vote === -1 ? 'text-secondary' : 'text-secondary/35 hover:text-secondary'}`}
              >
                <ThumbsDown size={12} /> {voteStats?.downvotes || 0}
              </button>

              {/* Reply */}
              {onReply && (
                <button
                  onClick={onReply}
                  className={`flex items-center gap-1 text-xs font-semibold transition-colors ${isReplying ? 'text-secondary' : 'text-secondary/35 hover:text-secondary'}`}
                >
                  <Reply size={12} /> Reply
                </button>
              )}

              {/* Edit / Delete — own comments only */}
              {canEdit && (
                <button onClick={onEdit} className='flex items-center gap-1 text-xs font-semibold text-secondary/35 hover:text-secondary transition-colors'>
                  <Pencil size={12} /> Edit
                </button>
              )}
              {isOwn && (
                <button onClick={onDelete} className='flex items-center gap-1 text-xs font-semibold text-secondary/35 hover:text-secondary transition-colors'>
                  <Trash2 size={12} /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
