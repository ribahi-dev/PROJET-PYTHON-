import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='flex min-h-screen flex-col items-center justify-center px-4 text-center'>
          <h1 className='text-3xl font-bold text-primary'>Something went wrong</h1>
          {import.meta.env.DEV && <p className='mt-2 max-w-lg text-sm text-secondary'>{String(this.state.error?.message || this.state.error)}</p>}
          <a href='/' className='mt-4 rounded-lg bg-secondary px-4 py-2 text-primary'>Go back home</a>
        </div>
      )
    }
    return this.props.children
  }
}
