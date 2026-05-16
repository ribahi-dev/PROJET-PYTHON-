import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { globalSearch } from '../api/search.api'
import IdeaCard from '../components/ideas/IdeaCard'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'

export default function SearchResults() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''

  const { data, isLoading } = useQuery({
    queryKey: ['search-page', q],
    queryFn: () => globalSearch(q).then((r) => r.data),
    enabled: q.length > 0,
  })

  const ideas = Array.isArray(data?.ideas) ? data.ideas : (Array.isArray(data?.results) ? data.results.filter((x) => x.title) : [])
  const users = Array.isArray(data?.users) ? data.users : (Array.isArray(data?.results) ? data.results.filter((x) => x.username) : [])

  return (
    <div className='mx-auto max-w-7xl space-y-6 px-4 py-8'>
      <h1 className='text-2xl font-bold text-secondary'>Results for '{q}'</h1>

      {isLoading ? (
        <div className='space-y-4'>{Array.from({ length: 5 }).map((_, i) => <div key={i} className='h-20 animate-pulse rounded-xl bg-secondary/15' />)}</div>
      ) : (
        <>
          <section>
            <h2 className='mb-3 text-lg font-semibold text-secondary'>Ideas ({ideas.length})</h2>
            {ideas.length ? <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>{ideas.map((idea) => <IdeaCard key={idea.id} idea={idea} />)}</div> : <p className='text-sm text-secondary/60'>No ideas match your search</p>}
          </section>

          <section>
            <h2 className='mb-3 text-lg font-semibold text-secondary'>People ({users.length})</h2>
            {users.length ? (
              <div className='space-y-2'>
                {users.map((u) => (
                  <a key={u.username} href={`/profile/${u.username}`} className='flex items-center justify-between rounded-xl border border-secondary/25 bg-primary px-3 py-2'>
                    <div className='flex items-center gap-3'>
                      <Avatar src={u.avatar} username={u.username} />
                      <div>
                        <p className='font-medium text-secondary'>{u.full_name || u.username}</p>
                        <p className='text-xs text-secondary/60'>@{u.username}</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge>{u.role || 'user'}</Badge>
                      <span className='text-xs text-secondary/60'>{u.reputation_points || 0} pts</span>
                    </div>
                  </a>
                ))}
              </div>
            ) : <p className='text-sm text-secondary/60'>No users match your search</p>}
          </section>

          {!ideas.length && !users.length && <EmptyState icon={Search} title={`No results found for '${q}'`} description='Try different keywords' />}
        </>
      )}
    </div>
  )
}
