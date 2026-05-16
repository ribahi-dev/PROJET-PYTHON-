import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className='flex min-h-[70vh] flex-col items-center justify-center px-4 text-center'>
      <p className='text-7xl font-bold text-primary'>404</p>
      <h1 className='mt-2 text-2xl font-semibold text-primary'>Page not found</h1>
      <p className='mt-1 text-slate-500'>The page you're looking for doesn't exist</p>
      <Link to='/' className='mt-4'><Button>Go Home</Button></Link>
    </div>
  )
}
