export default function Avatar({ src, username = 'User', size = 'md' }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-20 w-20 text-xl',
  }
  const cls = `rounded-full object-cover ${sizes[size] || sizes.md}`
  const initials = (username || 'U').slice(0, 2).toUpperCase()

  if (src) {
    return (
      <img
        src={src}
        alt={username}
        loading='lazy'
        className={cls}
        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
      />
    )
  }
  return (
    <div className={`flex items-center justify-center rounded-full bg-secondary font-semibold text-primary ${sizes[size] || sizes.md}`}>
      {initials}
    </div>
  )
}
