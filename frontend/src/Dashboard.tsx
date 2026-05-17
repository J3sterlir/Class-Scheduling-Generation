import { NavLink, Outlet } from 'react-router-dom'
import React from 'react'
import './App.css'
import './style.css'
import { clearToken } from './api'
import { PiSquaresFour } from "react-icons/pi";
import { BsLightningCharge } from "react-icons/bs";
import { CiCalendar } from "react-icons/ci";
import { IoWarningOutline } from "react-icons/io5";
import { FiBookOpen } from "react-icons/fi";
import { FaRegBuilding } from 'react-icons/fa6'
import { MdOutlineVpnKeyOff } from "react-icons/md";

export default function DashboardLayout() {
  const [profileName, setProfileName] = React.useState<string>('')
  const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

  React.useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    const controller = new AbortController()

    ;(async () => {
      try {
        const res = await fetch(`${apiBase}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        })

        if (!res.ok) return
        const data = (await res.json()) as { name?: string }
        if (data?.name) setProfileName(data.name)
      } catch {
      }
    })()

    return () => controller.abort()
  }, [apiBase])

  const displayName = profileName || 'User'
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=C9A84C&color=00215E&size=128`

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `p-3 py-2 w-full text-left rounded-md hover:bg-[#FFFFFF]/13 block border-l-4 transition-all ${
      isActive
        ? 'border-l-[#C9A84C] bg-[#FFFFFF]/13 pl-2'
        : 'border-l-transparent pl-3'
    }`

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await fetch(`${apiBase}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => {
        })
      }
    } catch {
    } finally {
      clearToken()
      window.location.href = '/login'
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen">
      <nav className="hidden w-[25%] xl:w-[20%] md:flex md:flex-col text-white bg-[#00215E]">
        <div className="flex items-center gap-3 p-4">
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-12 w-12 rounded-lg"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{displayName}</div>
            <div className="text-xs opacity-80 truncate">Class Scheduling System</div>
          </div>
        </div>

        <hr />

        <div className="flex flex-col gap-2 p-4 justify-start items-start flex-1">
          <NavLink to="/" end className={navLinkClass}>
            <span className="ml-4 flex items-center gap-4"><PiSquaresFour /> Dashboard</span>
          </NavLink>

          <NavLink to="/generate" className={navLinkClass}>
            <span className="ml-4 flex items-center gap-4"><BsLightningCharge /> Generate Schedule</span>
          </NavLink>

          <NavLink to="/schedules" className={navLinkClass}>
            <span className="ml-4 flex items-center gap-4"><CiCalendar /> My Schedule</span>
          </NavLink>

          <NavLink to="/conflicts" className={navLinkClass}>
            <span className="ml-4 flex items-center gap-4"><IoWarningOutline /> Conflicts</span>
          </NavLink>

          <NavLink to="/rooms" className={navLinkClass}>
            <span className="ml-4 flex items-center gap-4"><FaRegBuilding  /> Rooms</span>
          </NavLink>

          <NavLink to="/courses" className={navLinkClass}>
            <span className="ml-4 flex items-center gap-4"><FiBookOpen /> Courses</span>
          </NavLink>
        </div>

        <div className="border-t border-white/20 p-4">
          <button
            className='border border-gray-600 p-3 py-2 w-full text-left rounded-md hover:bg-[#FFFFFF]/13 pl-3 transition-all flex justify-center'
            onClick={handleLogout}
          >
            <span className="flex flex-row items-center gap-4"><MdOutlineVpnKeyOff /> Logout</span>
          </button>
        </div>
      </nav>

      <div className="w-full overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}