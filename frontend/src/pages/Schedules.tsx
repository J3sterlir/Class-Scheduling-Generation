import React from 'react'
import { apiFetch } from '../api'
import { IoMdWarning } from "react-icons/io";

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const TIME_SLOTS = [
    '07:30', '09:00', '10:30', '13:00', '14:30', '16:00', '18:00', '19:30'
]

type Schedule = {
    schedule_id: number
    course_code: string
    section: string | null
    room_id: string
    day: string
    start_time: string
    end_time: string
    capacity: number | null
    status: string | null
}

type CreateScheduleBody = {
    course_code: string
    section?: string
    room_id: string
    day: string
    start_time: string
    end_time: string
    capacity?: number
}

type UpdateScheduleBody = {
    room_id: string
    time_start: string
    time_end: string
}

export default function Schedules() {
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [items, setItems] = React.useState<Schedule[]>([])

    const [calendarView, setCalendarView] = React.useState<'week' | 'month'>('week')
    const [selectedSchedule, setSelectedSchedule] = React.useState<Schedule | null>(null)

    const [createBody, setCreateBody] = React.useState<CreateScheduleBody>({
        course_code: '',
        section: '',
        room_id: '',
        day: 'Monday',
        start_time: '07:30:00',
        end_time: '09:00:00',
        capacity: undefined
    })

    const [updateId, setUpdateId] = React.useState<string>('')
    const [updateBody, setUpdateBody] = React.useState<UpdateScheduleBody>({
        room_id: '',
        time_start: '07:30:00',
        time_end: '09:00:00'
    })

    const [resetConfirm, setResetConfirm] = React.useState('')
    const [resetDropdownOpen, setResetDropdownOpen] = React.useState(false)

    const load = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await apiFetch<Schedule[]>('/api/schedules')
            setItems(res)
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e))
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        void load()
    }, [load])

    async function createSchedule() {
        setError(null)

        try {
            const body: CreateScheduleBody = {
                course_code: createBody.course_code,
                room_id: createBody.room_id,
                day: createBody.day,
                start_time: createBody.start_time,
                end_time: createBody.end_time
            }

            if (createBody.section) body.section = createBody.section
            if (typeof createBody.capacity === 'number') body.capacity = createBody.capacity

            await apiFetch<Schedule>('/api/schedules', { method: 'POST', body })
            await load()
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e))
        }
    }

    async function updateSchedule() {
        setError(null)
        try {
            if (!updateId) throw new Error('scheduleId is required')
            await apiFetch(`/api/schedules/${encodeURIComponent(updateId)}`, {
                method: 'PUT',
                body: updateBody
            })
            await load()
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e))
        }
    }

    async function resetSchedules() {
        setError(null)
        try {
            await apiFetch('/api/schedules/reset', {
                method: 'DELETE',
                body: { confirm: resetConfirm }
            })
            setResetConfirm('')
            await load()
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e))
        }
    }

    // Calendar view helpers
    function getSchedulesForTimeSlot(day: string, timeStr: string): Schedule[] {
        return items.filter(s => {
            if (s.day !== day) return false
            const slotStart = timeStr
            const slotEnd = TIME_SLOTS[TIME_SLOTS.indexOf(timeStr) + 1] ?? '21:00'
            return (
                s.start_time.slice(0, 5) <= slotEnd &&
                s.end_time.slice(0, 5) > slotStart
            )
        })
    }

    function getDaysInMonth(date: Date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    function getFirstDayOfMonth(date: Date) {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }

    function countSchedulesOnDay(day: number) {
        const today = new Date()
        const dateStr = new Date(today.getFullYear(), today.getMonth(), day)
            .toLocaleDateString('en-US', { weekday: 'long' })
        return items.filter(s => s.day === dateStr).length
    }

    return (
        <div>
            {/* Page Header */}
            <div className='mb-6'>
                <h2 className='text-[#00215E] font-bold font-fraunces text-[32px]'>My Class Schedule</h2>
                <h3 className='text-[#6B7280] text-[14.5px] mb-5'>Your finalized class schedule for the current semester. All times are in Manila time (GMT+8).</h3>
            </div>

            {/* Calendar Header */}
            <div className='mb-6 rounded-xl border border-gray-200 bg-white p-6'>
                <div className='mb-4 flex items-center justify-between'>
                    <h2 className='text-[#00215E] font-bold font-fraunces text-[28px]'>Schedules</h2>
                    <div className='flex items-center gap-2'>
                        <button
                            onClick={() => setCalendarView('week')}
                            className={`rounded-lg px-3 py-2 text-[14px] font-medium transition-colors ${calendarView === 'week'
                                ? 'bg-[#00215E] text-white'
                                : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
                                }`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => setCalendarView('month')}
                            className={`rounded-lg px-3 py-2 text-[14px] font-medium transition-colors ${calendarView === 'month'
                                ? 'bg-[#00215E] text-white'
                                : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'
                                }`}
                        >
                            Month
                        </button>
                        <button onClick={load} disabled={loading} className='ml-4 rounded-lg bg-gray-100 px-3 py-2 text-[14px] font-medium text-[#6B7280] hover:bg-gray-200'>
                            {loading ? 'Loading…' : 'Refresh'}
                        </button>
                    </div>
                </div>

                {/* Week View */}
                {calendarView === 'week' && (
                    <div className='overflow-x-auto'>
                        <table className='w-full text-left text-[13px]'>
                            <thead>
                                <tr className='border-b border-gray-200 bg-gray-50'>
                                    <th className='px-3 py-2 font-semibold text-[#6B7280]'>Time</th>
                                    {DAYS.map(day => (
                                        <th key={day} className='px-3 py-2 text-center font-semibold text-[#00215E]'>
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {TIME_SLOTS.map(time => (
                                    <tr key={time} className='border-b border-gray-100'>
                                        <td className='px-3 py-2 font-medium text-[#6B7280]'>{time}</td>
                                        {DAYS.map(day => {
                                            const slotSchedules = getSchedulesForTimeSlot(day, time)
                                            return (
                                                <td
                                                    key={`${day}-${time}`}
                                                    className='border-l border-gray-100 px-2 py-2 align-top'
                                                >
                                                    <div className='flex flex-col gap-1'>
                                                        {slotSchedules.map(s => (
                                                            <div
                                                                key={s.schedule_id}
                                                                onClick={() => setSelectedSchedule(s)}
                                                                className='cursor-pointer rounded bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-900 hover:bg-blue-200 transition-colors'
                                                            >
                                                                {s.course_code}
                                                                <br />
                                                                <span className='text-[10px] font-normal'>{s.room_id}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Month View */}
                {calendarView === 'month' && (
                    <div>
                        <div className='grid grid-cols-7 gap-1'>
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className='py-2 text-center font-semibold text-[#6B7280]'>
                                    {d}
                                </div>
                            ))}
                            {Array.from({ length: getFirstDayOfMonth(new Date()) }).map((_, i) => (
                                <div key={`empty-${i}`} className='aspect-square' />
                            ))}
                            {Array.from({ length: getDaysInMonth(new Date()) }).map((_, i) => {
                                const day = i + 1
                                const scheduleCount = countSchedulesOnDay(day)
                                return (
                                    <div
                                        key={day}
                                        className='aspect-square rounded border border-gray-200 p-1 text-[13px] hover:bg-gray-50 cursor-pointer transition-colors'
                                    >
                                        <div className='font-semibold text-[#00215E]'>{day}</div>
                                        {scheduleCount > 0 && (
                                            <div className='mt-0.5 flex gap-0.5'>
                                                {Array.from({ length: Math.min(scheduleCount, 3) }).map((_, i) => (
                                                    <div key={i} className='h-1.5 w-1.5 rounded-full bg-blue-500' />
                                                ))}
                                                {scheduleCount > 3 && <div className='text-[10px] text-[#6B7280]'>+{scheduleCount - 3}</div>}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Schedule Details Modal */}
            {selectedSchedule && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs bg-opacity-40 p-4' onClick={() => setSelectedSchedule(null)}>
                    <div className='rounded-xl border border-gray-200 bg-white p-6 max-w-md w-full shadow-lg' onClick={e => e.stopPropagation()}>
                        <div className='mb-4 flex items-start justify-between'>
                            <div>
                                <h3 className='text-[#00215E] font-bold font-fraunces text-[20px]'>{selectedSchedule.course_code}</h3>
                                <div className='text-[#6B7280] text-[14px]'>Section: {selectedSchedule.section || 'N/A'}</div>
                            </div>
                            <button onClick={() => setSelectedSchedule(null)} className='text-[#6B7280] hover:text-[#00215E]'>
                                ✕
                            </button>
                        </div>
                        <div className='border-t border-gray-200 pt-4 space-y-2 text-[14px]'>
                            <div className='flex justify-between'>
                                <span className='text-[#6B7280]'>Room</span>
                                <span className='font-semibold text-[#00215E]'>{selectedSchedule.room_id}</span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='text-[#6B7280]'>Day</span>
                                <span className='font-semibold text-[#00215E]'>{selectedSchedule.day}</span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='text-[#6B7280]'>Time</span>
                                <span className='font-semibold text-[#00215E]'>{selectedSchedule.start_time} – {selectedSchedule.end_time}</span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='text-[#6B7280]'>Capacity</span>
                                <span className='font-semibold text-[#00215E]'>{selectedSchedule.capacity || 'N/A'}</span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='text-[#6B7280]'>Status</span>
                                <span className={`font-semibold ${selectedSchedule.status === 'scheduled'
                                    ? 'text-emerald-600'
                                    : 'text-orange-600'
                                    }`}>
                                    {selectedSchedule.status || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className='flex flex-row gap-3 justify-center w-full'>
                <div className='mt-6 rounded-xl border border-gray-200 bg-white p-6 w-full'>
                    <h3 className='text-[#00215E] font-bold font-fraunces text-[20px] mb-4'>Create Schedule</h3>
                    <div className='grid grid-cols-2 gap-4'>
                        <label className='flex flex-col'>
                            <span className='text-[#6B7280] text-[14px] font-medium mb-1'>Course code</span>
                            <input
                                value={createBody.course_code}
                                onChange={e => setCreateBody(s => ({ ...s, course_code: e.target.value }))}
                                className='rounded-lg border border-gray-300 px-3 py-2'
                            />
                        </label>
                        <label className='flex flex-col'>
                            <span className='text-[#6B7280] text-[14px] font-medium mb-1'>Section</span>
                            <input
                                value={createBody.section ?? ''}
                                onChange={e => setCreateBody(s => ({ ...s, section: e.target.value }))}
                                className='rounded-lg border border-gray-300 px-3 py-2'
                            />
                        </label>
                        <label className='flex flex-col'>
                            <span className='text-[#6B7280] text-[14px] font-medium mb-1'>Room ID</span>
                            <input value={createBody.room_id} onChange={e => setCreateBody(s => ({ ...s, room_id: e.target.value }))} className='rounded-lg border border-gray-300 px-3 py-2' />
                        </label>
                        <label className='flex flex-col'>
                            <span className='text-[#6B7280] text-[14px] font-medium mb-1'>Day</span>
                            <select value={createBody.day} onChange={e => setCreateBody(s => ({ ...s, day: e.target.value }))} className='rounded-lg border border-gray-300 px-3 py-2'>
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                    <option key={d} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className='flex flex-col'>
                            <span className='text-[#6B7280] text-[14px] font-medium mb-1'>Start time</span>
                            <input
                                value={createBody.start_time}
                                onChange={e => setCreateBody(s => ({ ...s, start_time: e.target.value }))}
                                placeholder="07:30:00"
                                className='rounded-lg border border-gray-300 px-3 py-2'
                            />
                        </label>
                        <label className='flex flex-col'>
                            <span className='text-[#6B7280] text-[14px] font-medium mb-1'>End time</span>
                            <input
                                value={createBody.end_time}
                                onChange={e => setCreateBody(s => ({ ...s, end_time: e.target.value }))}
                                placeholder="09:00:00"
                                className='rounded-lg border border-gray-300 px-3 py-2'
                            />
                        </label>
                        <label className='flex flex-col'>
                            <span className='text-[#6B7280] text-[14px] font-medium mb-1'>Capacity</span>
                            <input
                                value={createBody.capacity ?? ''}
                                onChange={e =>
                                    setCreateBody(s => ({
                                        ...s,
                                        capacity: e.target.value === '' ? undefined : Number(e.target.value)
                                    }))
                                }
                                className='rounded-lg border border-gray-300 px-3 py-2'
                            />
                        </label>
                    </div>

                    <button onClick={createSchedule} className='mt-4 rounded-lg bg-[#00215E] px-5 py-2 text-white font-medium hover:bg-[#001845]'>
                        Create
                    </button>
                </div>
                <div className='mt-6 rounded-xl border border-gray-200 bg-white p-6 w-full'>
                    <h3 className='text-[#00215E] font-bold font-fraunces text-[20px] mb-4'>Update Schedule</h3>
                    <div className='grid grid-cols-2 gap-4'>
                        <label className='flex flex-col'>
                            <span className='text-[#6B7280] text-[14px] font-medium mb-1'>Schedule ID</span>
                            <input value={updateId} onChange={e => setUpdateId(e.target.value)} className='rounded-lg border border-gray-300 px-3 py-2' />
                        </label>
                        <label className='flex flex-col'>
                            <span className='text-[#6B7280] text-[14px] font-medium mb-1'>Room ID</span>
                            <input value={updateBody.room_id} onChange={e => setUpdateBody(s => ({ ...s, room_id: e.target.value }))} className='rounded-lg border border-gray-300 px-3 py-2' />
                        </label>
                        <label className='flex flex-col'>
                            <span className='text-[#6B7280] text-[14px] font-medium mb-1'>Start time</span>
                            <input
                                value={updateBody.time_start}
                                onChange={e => setUpdateBody(s => ({ ...s, time_start: e.target.value }))}
                                className='rounded-lg border border-gray-300 px-3 py-2'
                            />
                        </label>
                        <label className='flex flex-col'>
                            <span className='text-[#6B7280] text-[14px] font-medium mb-1'>End time</span>
                            <input
                                value={updateBody.time_end}
                                onChange={e => setUpdateBody(s => ({ ...s, time_end: e.target.value }))}
                                className='rounded-lg border border-gray-300 px-3 py-2'
                            />
                        </label>
                    </div>

                    <button onClick={updateSchedule} className='mt-4 rounded-lg bg-[#00215E] px-5 py-2 text-white font-medium hover:bg-[#001845]'>
                        Update
                    </button>
                </div>

            </div>

            <div className='mt-6 rounded-xl border border-gray-200 bg-white p-6'>
                <h3 className='text-[#00215E] font-bold font-fraunces text-[20px] mb-4'>All Schedules</h3>
                <div className='overflow-auto'>
                    <table className='w-full text-left text-[14px]'>
                        <thead>
                            <tr className='text-[#6B7280] border-b border-gray-200'>
                                {['id', 'course', 'section', 'room', 'day', 'start', 'end', 'capacity', 'status'].map(h => (
                                    <th key={h} className='py-2 pr-4 font-medium'>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(s => (
                                <tr key={s.schedule_id} className='border-b border-gray-100 last:border-b-0'>
                                    <td className='py-2 pr-4 text-[#00215E] font-semibold'>{s.schedule_id}</td>
                                    <td className='py-2 pr-4 text-[#00215E] font-semibold'>{s.course_code}</td>
                                    <td className='py-2 pr-4 text-[#6B7280]'>{s.section}</td>
                                    <td className='py-2 pr-4 text-[#6B7280]'>{s.room_id}</td>
                                    <td className='py-2 pr-4 text-[#6B7280]'>{s.day}</td>
                                    <td className='py-2 pr-4 text-[#6B7280]'>{s.start_time}</td>
                                    <td className='py-2 pr-4 text-[#6B7280]'>{s.end_time}</td>
                                    <td className='py-2 pr-4 text-[#6B7280]'>{s.capacity}</td>
                                    <td className='py-2 pr-4'>
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[12px] font-medium ${s.status === 'scheduled'
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-orange-50 text-orange-700'
                                            }`}>
                                            {s.status || 'scheduled'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='mt-6 rounded-xl border border-gray-200 bg-white p-6'>
                <button
                    onClick={() => setResetDropdownOpen(!resetDropdownOpen)}
                    className='w-full flex items-center justify-between hover:bg-gray-50 -m-6 p-6 rounded-xl transition-colors'
                >
                    <h3 className='text-[#00215E] font-bold font-fraunces text-[20px]'>Reset Schedules</h3>
                    <span className={`text-[#00215E] text-[20px] transition-transform ${resetDropdownOpen ? 'rotate-180' : ''}`}>
                        ▼
                    </span>
                </button>

                {resetDropdownOpen && (
                    <div className='border-t border-gray-200 pt-4 mt-4'>
                        <p className='text-[#6B7280] text-[14px] mb-3'>Type "YES" to confirm the reset action.</p>
                        <div className='flex gap-2'>
                            <input value={resetConfirm} onChange={e => setResetConfirm(e.target.value)} placeholder="YES" className='flex-1 rounded-lg border border-gray-300 px-3 py-2' />
                            <button onClick={resetSchedules} className='rounded-lg bg-red-600 px-5 py-2 text-white font-medium hover:bg-red-700 flex flex-row gap-2 items-center'>
                                <IoMdWarning /> Reset
                            </button>
                        </div>
                        {error && (
                            <div className='mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-[14.5px]'>
                                <span className='font-semibold'>Error:</span> {error}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
