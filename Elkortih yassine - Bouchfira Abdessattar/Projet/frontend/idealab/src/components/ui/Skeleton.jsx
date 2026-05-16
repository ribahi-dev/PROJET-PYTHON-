export default function Skeleton({ width = 'w-full', height = 'h-4', rounded = 'rounded', className = '' }) {
  return <div className={`animate-pulse bg-secondary/15 ${width} ${height} ${rounded} ${className}`} />
}

export function SkeletonCard() {
  return <div className='rounded-xl border border-secondary/25 bg-primary p-4'><Skeleton height='h-40' rounded='rounded-lg' /><Skeleton className='mt-3' /><Skeleton className='mt-2 w-2/3' /></div>
}

export function SkeletonTable({ rows = 5 }) {
  return <div className='space-y-2'>{Array.from({ length: rows }).map((_, i) => <Skeleton key={i} height='h-10' rounded='rounded-md' />)}</div>
}

export function SkeletonText({ lines = 3 }) {
  return <div className='space-y-2'>{Array.from({ length: lines }).map((_, i) => <Skeleton key={i} className={i === lines - 1 ? 'w-2/3' : ''} />)}</div>
}
