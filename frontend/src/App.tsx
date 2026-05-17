import React from 'react'
import { Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import './style.css'
import DashboardLayout from './Dashboard'
import { FcGoogle } from "react-icons/fc";
import DashboardHome from './pages/DashboardHome'
import GenerateSchedule from './pages/GenerateSchedule'
import Schedules from './pages/Schedules'
import Conflicts from './pages/Conflicts'
import Rooms from './pages/Rooms'
import Courses from './pages/Courses'
import { GrSchedules } from "react-icons/gr";


function ModuleLayout({ className }: { className: string }) {
  return (
    <div className={className}>
      <Outlet />
    </div>
  )
}


function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function LoginPage() {
  const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4 bg-linear-to-br from-[#00215E] via-[#0A2E7F] to-[#051A3F]">
      <div className="w-full max-w-md">
        <div className="rounded-2xl shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C9A84C]/20 mb-4">
              <GrSchedules className='text-[2rem] text-[#C9A84C]'/>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">IAE Scheduler</h1>
            <p className="text-gray-300 text-sm md:text-base">Intelligent class scheduling made simple</p>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-300 text-sm">Sign in with your Google account to continue.</p>
            </div>

            {/* Google Button */}
            <a
              href={`${apiBase}/api/auth/google`}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg font-semibold transition-all duration-200 bg-white/95 text-[#00215E] hover:bg-[#C9A84C] hover:text-white shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FcGoogle className="w-6 h-6" />
              <span>Sign in with Google</span>
            </a>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-center text-xs text-gray-400">
              Protected by Google OAuth 2.0 • All schedules encrypted
            </p>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="mt-8 text-center">
          <p className="text-white/60 text-xs">
            © 2026 IAE Scheduler. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

function AuthCallbackPage() {
  const location = useLocation()
  const navigate = useNavigate()

  React.useEffect(() => {
    const token = new URLSearchParams(location.search).get('token')
    if (token) {
      localStorage.setItem('token', token)
      navigate('/', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [location.search, navigate])

  return <div>Signing you in…</div>
}


export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}>
        {/* Each module gets its own layout wrapper for background/padding */}
        <Route element={<ModuleLayout className="min-h-full w-full bg-white p-6 md:p-10 md:pt-20 md:pl-20 md:pr-45" />}>
          <Route index element={<DashboardHome />} />
        </Route>

        <Route path="generate" element={<ModuleLayout className="min-h-full w-full bg-[#F7F8FC] p-6 md:p-10 md:pt-20 md:pl-20 md:pr-45" />}>
          <Route index element={<GenerateSchedule />} />
        </Route>

        <Route path="schedules" element={<ModuleLayout className="min-h-full w-full bg-[#F7F8FC] p-6 md:p-10 md:pt-20 md:pl-20 md:pr-45" />}>
          <Route index element={<Schedules />} />
        </Route>

        <Route path="conflicts" element={<ModuleLayout className="min-h-full w-full bg-[#F7F8FC] p-6 md:p-10 md:pt-20 md:pl-20 md:pr-45" />}>
          <Route index element={<Conflicts />} />
        </Route>

        <Route path="rooms" element={<ModuleLayout className="min-h-full w-full bg-[#F7F8FC] p-6 md:p-10 md:pt-20 md:pl-20 md:pr-45" />}>
          <Route index element={<Rooms />} />
        </Route>

        <Route path="courses" element={<ModuleLayout className="min-h-full w-full bg-[#F7F8FC] p-6 md:p-10 md:pt-20 md:pl-20 md:pr-45" />}>
          <Route index element={<Courses />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}