import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createIdea, deleteIdea, getIdea, getIdeas, getRecommended, getTrending, updateIdea } from '../api/ideas.api'

export const useIdeas = (params, options = {}) => useQuery({
  queryKey: ['ideas', params],
  queryFn: options.queryFn || (() => getIdeas(params).then((r) => r.data)),
  ...options,
})
export const useIdea = (id) => useQuery({ queryKey: ['idea', id], queryFn: () => getIdea(id).then((r) => r.data), enabled: !!id })
export const useTrending = () => useQuery({ queryKey: ['trending'], queryFn: () => getTrending().then((r) => r.data) })
export const useRecommended = () => useQuery({ queryKey: ['recommended'], queryFn: () => getRecommended().then((r) => r.data) })

export const useCreateIdea = () => {
  const qc = useQueryClient()
  return useMutation({ mutationFn: createIdea, onSuccess: () => qc.invalidateQueries({ queryKey: ['ideas'] }) })
}
export const useUpdateIdea = () => {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ id, data }) => updateIdea(id, data), onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['idea', vars.id] }) })
}
export const useDeleteIdea = () => {
  const qc = useQueryClient()
  return useMutation({ mutationFn: deleteIdea, onSuccess: () => qc.invalidateQueries({ queryKey: ['ideas'] }) })
}
