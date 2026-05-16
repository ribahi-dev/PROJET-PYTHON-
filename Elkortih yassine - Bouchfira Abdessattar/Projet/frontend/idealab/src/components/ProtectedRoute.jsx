import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../store/authStore'
export default function ProtectedRoute({ allowedRoles }){ const user=useAuthStore((s)=>s.user); if(!user) return <Navigate to='/login' replace/>; if(allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to='/' replace/>; return <Outlet/> }
