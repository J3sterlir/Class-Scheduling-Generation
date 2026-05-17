import React from 'react'
import { apiFetch } from '../api'
import { Link } from 'react-router-dom'
import { IoMdRefresh } from "react-icons/io";
import { CiCalendar } from "react-icons/ci";
import { FiBookOpen } from "react-icons/fi";
import { BsLightningCharge } from "react-icons/bs";
import { IoWarningOutline } from "react-icons/io5";
import { FaBuilding } from "react-icons/fa";
import { IoWarning } from "react-icons/io5";

type Schedule = {
  schedule_id: number
  course_code: string
  section?: string
  room_id?: string
  day?: string
  start_time?: string
  end_time?: string
  status?: string
}

type ConflictReport = {
  total_schedules: number
  total_conflicts: number
}

export default function DashboardHome() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [totalSchedules, setTotalSchedules] = React.useState<number>(0)
  const [scheduledCount, setScheduledCount] = React.useState<number>(0)
  const [pendingCount, setPendingCount] = React.useState<number>(0)
  const [conflictCount, setConflictCount] = React.useState<number>(0)
  const [recentSchedules, setRecentSchedules] = React.useState<Schedule[]>([])

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const schedules = await apiFetch<Schedule[]>('/api/schedules')
      setTotalSchedules(schedules.length)
      setScheduledCount(schedules.filter(s => (s.status ?? 'scheduled') === 'scheduled').length)
      setPendingCount(schedules.filter(s => (s.status ?? 'scheduled') !== 'scheduled').length)
      
      // Get last 5 schedules for recent display
      setRecentSchedules(schedules.slice(-5).reverse())

      const conflicts = await apiFetch<ConflictReport>('/api/schedules/conflicts')
      setConflictCount(conflicts.total_conflicts ?? 0)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void load()
  }, [load])

  return (
    <div>
      <div className='flex flex-row'>
        <div className='flex flex-col gap-2'>
        <h1 className='text-[#00215E] font-bold font-fraunces text-[32px]'>Class Scheduling Dashboard</h1>
        <h3 className='text-[#6B7280] text-[14.5px] mb-5'>Generate, monitor, and resolve class schedules across the semester.</h3>

        <button onClick={load} disabled={loading} className='flex items-center justify-center text-center gap-1 w-fit px-4 py-2 bg-[#00215E] text-[13px] text-white rounded hover:bg-[#00215E]/70 disabled:bg-gray-400 mb-10'>
          {loading ? 'Loading…' : <IoMdRefresh />} Refresh
        </button>
        </div>

        
      </div>

      {error && <div className="text-red-600 mb-3">Error: {error}</div>}

      <div className="grid grid-cols-4 gap-3">

        <div className="flex flex-row border border-gray-300 p-5 rounded-2xl bg-[#00215E] text-white h-35.5">
          <div className='flex flex-col gap-3'>
            <div className='font-inter text-[15px] font-semibold'>Total schedules</div>
            <div className="text-[28px] font-fraunces font-bold">{totalSchedules}</div>
          </div>
          <div className='ml-auto bg-white/12 rounded p-2 h-fit'>
            <CiCalendar className="text-[#C9A84C] w-5 h-5.5 stroke-1" />
          </div>
        </div>
        
        <div className="flex flex-row border border-[#E4E7F0] p-5 rounded-2xl bg-white text-[#00215E] h-35.5 hover:shadow-lg">
          <div className='flex flex-col gap-3'>
            <div className='font-inter text-[15px] font-semibold'>Scheduled</div>
            <div className="text-[28px] font-fraunces font-bold">{scheduledCount}</div>
            <div className='-mt-1.5 text-[12px] text-[#6B7280]'>Confirmed & finalized</div>
          </div>
          <div className='ml-auto bg-white/12 rounded p-2 h-fit'>
            <FiBookOpen className="text-[#00215E] w-5 h-5.5 stroke-2" />
          </div>
        </div>

        <div className="flex flex-row border border-[#E4E7F0] p-5 rounded-2xl bg-white text-[#00215E] h-35.5 hover:shadow-lg">
          <div className='flex flex-col gap-3'>
            <div className='font-inter text-[15px] font-semibold'>Pending</div>
            <div className="text-[28px] font-fraunces font-bold">{pendingCount}</div>
            <div className='-mt-1.5 text-[12px] text-[#6B7280]'>Awaiting assignment</div>
          </div>
          <div className='ml-auto bg-white/12 rounded p-2 h-fit'>
            <BsLightningCharge  className="text-[#00215E] w-5 h-5.5 stroke" />
          </div>
        </div>

        <div className="flex flex-row border border-[#E4E7F0] p-5 rounded-2xl bg-white text-[#00215E] h-35.5 hover:shadow-lg">
          <div className='flex flex-col gap-3'>
            <div className='font-inter text-[15px] font-semibold'>Open conflicts</div>
            <div className="text-[28px] font-fraunces font-bold">{conflictCount}</div>
            <div className='-mt-1.5 text-[12px] text-[#6B7280]'>Needs Resolution</div>
          </div>
          <div className='ml-auto bg-white/12 rounded p-2 h-fit'>
            <IoWarningOutline  className="text-[#00215E] w-5 h-5.5" />
          </div>
        </div>

      </div>
      <div className='flex flex-col'>
        <div className='mt-10'>
            <h1 className='text-[#00215E] font-bold font-fraunces text-[22px]'>Recent Schedules</h1>
            <h3 className='text-[#6B7280] text-[14.5px] mb-5'>Latest generated class allocations</h3>
        </div>
        <div>
          {recentSchedules.length === 0 ? (
            <div className='text-center py-8 text-[#6B7280]'>
              <p>No schedules generated yet.</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4'>
              {recentSchedules.map((s) => (
                <div key={s.schedule_id} className='bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow'>
                  <div className='flex flex-col gap-3'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='text-sm font-medium text-[#6B7280]'>Course</div>
                        <div className='text-lg font-bold font-fraunces text-[#00215E]'>{s.course_code}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium shrink-0 ${
                        (s.status ?? 'scheduled') === 'scheduled'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-orange-50 text-orange-700'
                      }`}>
                        {s.status ?? 'scheduled'}
                      </span>
                    </div>
                    
                    {s.section && (
                      <div>
                        <div className='text-xs text-[#6B7280]'>Section</div>
                        <div className='text-sm font-medium text-[#1F2937]'>{s.section}</div>
                      </div>
                    )}
                    
                    {s.room_id && (
                      <div>
                        <div className='text-xs text-[#6B7280]'>Room</div>
                        <div className='text-sm font-medium text-[#1F2937]'>{s.room_id}</div>
                      </div>
                    )}
                    
                    {s.day && (
                      <div>
                        <div className='text-xs text-[#6B7280]'>Day</div>
                        <div className='text-sm font-medium text-[#1F2937]'>{s.day}</div>
                      </div>
                    )}
                    
                    {s.start_time && s.end_time && (
                      <div>
                        <div className='text-xs text-[#6B7280]'>Time</div>
                        <div className='text-sm font-medium text-[#1F2937]'>{s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      

      <div className='flex flex-row gap-5'>
        <Link to="/rooms" className='bg-[#00215E] flex flex-col gap-3 p-5 rounded-lg text-white mt-10 w-full hover:shadow-lg transition-shadow'>
            <h1 className='text-sm'>Quick Action</h1>
            <h1 className='text-lg font-bold font-fraunces'>Rooms & Capacity</h1>
            <h2>Manage rooms, update capacities, and ensure accurate scheduling.</h2>
            <button className='bg-white text-[#00215E] font-bold w-fit px-4 py-2 rounded-xl hover:bg-[#bfd7ff] mt-3 flex items-center gap-2'>
                <FaBuilding /> View Rooms
            </button>
        </Link>

        <Link to="/conflicts" className='bg-white flex flex-col gap-3 p-5 rounded-lg mt-10 w-full border border-gray-300 hover:shadow-lg transition-shadow'>
            <h1 className='text-sm'>Quick Action</h1>
            <h1 className='text-lg font-bold font-fraunces'>Resolve Conflicts</h1>
            <h2>{conflictCount} unresolved scheduling conflict{conflictCount !== 1 ? 's' : ''} require{conflictCount === 1 ? 's' : ''} your attention.</h2>
            <button className='bg-white text-[#00215E] border border-gray-300 font-bold w-fit px-4 py-2 rounded-xl hover:bg-[#C9A84C] hover:border-[#C9A84C] hover:text-white mt-3 flex items-center gap-2'>
               <IoWarning /> View Conflicts
            </button>
        </Link>
      </div>
    </div>
  )
}
