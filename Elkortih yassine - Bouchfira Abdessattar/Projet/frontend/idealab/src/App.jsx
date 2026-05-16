import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { ToastViewport } from './components/ui/Toast'
import { getNotifs } from './api/notifications.api'
import useAuthStore from './store/authStore'
import useNotifStore from './store/notifStore'

const Home = lazy(() => import('./pages/Home'))
const Explore = lazy(() => import('./pages/Explore'))
const IdeaDetail = lazy(() => import('./pages/IdeaDetail'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Bookmarks = lazy(() => import('./pages/Bookmarks'))
const Notifications = lazy(() => import('./pages/Notifications'))
const Profile = lazy(() => import('./pages/Profile'))
const SubmitIdea = lazy(() => import('./pages/SubmitIdea'))
const EntrepreneurDashboard = lazy(() => import('./pages/EntrepreneurDashboard'))
const ReviewerDashboard = lazy(() => import('./pages/ReviewerDashboard'))
const AdminPanel = lazy(() => import('./pages/AdminPanel'))
const SearchResults = lazy(() => import('./pages/SearchResults'))
const NotFound = lazy(() => import('./pages/NotFound'))

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } } })

export default function App() {
  const user = useAuthStore((s) => s.user)
  const setUnreadCount = useNotifStore((s) => s.setUnreadCount)

  useEffect(() => {
    if (!user) return
    getNotifs({ unread: true })
      .then((r) => {
        const items = Array.isArray(r.data?.results) ? r.data.results : (Array.isArray(r.data) ? r.data : [])
        setUnreadCount(items.length)
      })
      .catch(() => {}) 
  }, [user?.id])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<div className='p-8'>Loading...</div>}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path='/' element={<Home />} />
              <Route path='/explore' element={<Explore />} />
              <Route path='/ideas/:id' element={<IdeaDetail />} />
              <Route path='/login' element={user ? <Navigate to={user.role === 'reviewer' ? '/reviewer' : user.role === 'admin' ? '/admin' : '/dashboard'} replace /> : <Login />} />
              <Route path='/register' element={user ? <Navigate to={user.role === 'reviewer' ? '/reviewer' : user.role === 'admin' ? '/admin' : '/dashboard'} replace /> : <Register />} />
              <Route path='/search' element={<SearchResults />} />
              <Route path='/profile/:username' element={<Profile />} />

              <Route element={<ProtectedRoute />}>
                <Route path='/bookmarks' element={<Bookmarks />} />
                <Route path='/notifications' element={<Notifications />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['entrepreneur']} />}>
                <Route path='/submit' element={<SubmitIdea />} />
                <Route path='/dashboard' element={<EntrepreneurDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['reviewer']} />}>
                <Route path='/reviewer' element={<ReviewerDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path='/admin' element={<AdminPanel />} />
              </Route>

              <Route path='*' element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
        <ToastViewport />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
