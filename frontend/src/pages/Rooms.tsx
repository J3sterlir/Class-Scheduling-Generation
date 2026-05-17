import React from 'react'
import { apiFetch } from '../api'
import { IoWarningOutline } from 'react-icons/io5'
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi'

type Room = {
    room_id: string
    capacity: number
    type: 'Lecture' | 'Laboratory' | string
}

export default function Rooms() {
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [rooms, setRooms] = React.useState<Room[]>([])
    const [successMsg, setSuccessMsg] = React.useState<string | null>(null)

    const [createBody, setCreateBody] = React.useState<Room>({ room_id: '', capacity: 0, type: 'Lecture' })
    const [createLoading, setCreateLoading] = React.useState(false)

    const [updateRoomId, setUpdateRoomId] = React.useState('')
    const [updateCapacity, setUpdateCapacity] = React.useState<string>('')
    const [updateType, setUpdateType] = React.useState<string>('')
    const [updateLoading, setUpdateLoading] = React.useState(false)

    const [removeRoomId, setRemoveRoomId] = React.useState('')
    const [removeLoading, setRemoveLoading] = React.useState(false)

    const [availDay, setAvailDay] = React.useState('')
    const [availStart, setAvailStart] = React.useState('')
    const [availEnd, setAvailEnd] = React.useState('')
    const [available, setAvailable] = React.useState<Room[]>([])
    const [availLoading, setAvailLoading] = React.useState(false)

    const load = React.useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const res = await apiFetch<{ rooms: Room[] }>('/api/rooms')
            setRooms(res.rooms)
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e))
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        void load()
    }, [load])

    async function createRoom() {
        setError(null)
        setSuccessMsg(null)
        setCreateLoading(true)
        try {
            await apiFetch('/api/rooms', { method: 'POST', body: createBody })
            setCreateBody({ room_id: '', capacity: 0, type: 'Lecture' })
            setSuccessMsg(`Room ${createBody.room_id} added successfully!`)
            setTimeout(() => setSuccessMsg(null), 3000)
            await load()
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e))
        } finally {
            setCreateLoading(false)
        }
    }

    async function updateRoom() {
        setError(null)
        setSuccessMsg(null)
        setUpdateLoading(true)
        try {
            await apiFetch('/api/rooms/update', {
                method: 'PUT',
                body: {
                    room_id: updateRoomId,
                    capacity: updateCapacity === '' ? undefined : Number(updateCapacity),
                    type: updateType === '' ? undefined : updateType
                }
            })
            setUpdateRoomId('')
            setUpdateCapacity('')
            setUpdateType('')
            setSuccessMsg(`Room ${updateRoomId} updated successfully!`)
            setTimeout(() => setSuccessMsg(null), 3000)
            await load()
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e))
        } finally {
            setUpdateLoading(false)
        }
    }

    async function removeRoom() {
        setError(null)
        setSuccessMsg(null)
        setRemoveLoading(true)
        try {
            await apiFetch('/api/rooms/remove', {
                method: 'DELETE',
                body: { room_id: removeRoomId }
            })
            setSuccessMsg(`Room ${removeRoomId} removed successfully!`)
            setTimeout(() => setSuccessMsg(null), 3000)
            setRemoveRoomId('')
            await load()
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e))
        } finally {
            setRemoveLoading(false)
        }
    }

    async function loadAvailable() {
        setError(null)
        setAvailLoading(true)
        try {
            const params = new URLSearchParams()
            if (availDay) params.set('day', availDay)
            if (availStart) params.set('start_time', availStart)
            if (availEnd) params.set('end_time', availEnd)

            const path = params.toString() ? `/api/rooms/available?${params}` : '/api/rooms/available'
            const res = await apiFetch<{ rooms: Room[] }>(path)
            setAvailable(res.rooms)
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e))
        } finally {
            setAvailLoading(false)
        }
    }

    const lectureRooms = rooms.filter(r => r.type === 'Lecture').length
    const labRooms = rooms.filter(r => r.type === 'Laboratory').length
    const avgCapacity = rooms.length > 0 ? Math.round(rooms.reduce((sum, r) => sum + r.capacity, 0) / rooms.length) : 0

    return (
        <div className="min-h-full">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-fraunces text-[#00215E] mb-2">
                    Rooms & Capacity
                </h1>
                <p className="text-sm text-[#6B7280]">
                    Browse all available rooms, check capacities, and manage room allocations for scheduling.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-xs font-medium text-[#6B7280] mb-1">Total Rooms</div>
                    <div className="text-2xl font-bold text-[#00215E]">{rooms.length}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-xs font-medium text-[#6B7280] mb-1">Lecture Halls</div>
                    <div className="text-2xl font-bold text-blue-600">{lectureRooms}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-xs font-medium text-[#6B7280] mb-1">Labs</div>
                    <div className="text-2xl font-bold text-purple-600">{labRooms}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-xs font-medium text-[#6B7280] mb-1">Avg Capacity</div>
                    <div className="text-2xl font-bold text-emerald-600">{avgCapacity}</div>
                </div>
            </div>

            {/* All Rooms Table */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-5">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-[#00215E]">All Rooms</h2>
                    <button
                        onClick={load}
                        disabled={loading}
                        className="text-sm text-[#00215E] hover:text-[#001a47] underline"
                    >
                        {loading ? 'Refreshing…' : 'Refresh'}
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#00215E] border-r-transparent"></div>
                    </div>
                ) : rooms.length === 0 ? (
                    <div className="text-center py-8 text-[#6B7280]">
                        <p>No rooms found. Add a room to get started.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-4 py-3 text-left font-medium text-[#6B7280]">Room ID</th>
                                    <th className="px-4 py-3 text-left font-medium text-[#6B7280]">Type</th>
                                    <th className="px-4 py-3 text-left font-medium text-[#6B7280]">Capacity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.map((room, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-[#1F2937]">{room.room_id}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${room.type === 'Lecture'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-purple-100 text-purple-700'
                                                }`}>
                                                {room.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-[#6B7280]">{room.capacity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className='flex flex-row gap-3 items center w-full h-fit'>
                {/* Add Room Form */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 w-full">
                    <div className="flex items-center gap-2 mb-5">
                        <FiPlus size={20} className="text-[#00215E]" />
                        <h2 className="text-lg font-semibold text-[#00215E]">Add New Room</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-[#1F2937] mb-1">Room ID *</label>
                            <input
                                type="text"
                                value={createBody.room_id}
                                onChange={e => setCreateBody(s => ({ ...s, room_id: e.target.value }))}
                                placeholder="e.g., A101"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#00215E]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#1F2937] mb-1">Capacity *</label>
                            <input
                                type="number"
                                value={String(createBody.capacity)}
                                onChange={e => setCreateBody(s => ({ ...s, capacity: Number(e.target.value) }))}
                                placeholder="e.g., 40"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#00215E]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#1F2937] mb-1">Type *</label>
                            <select
                                value={createBody.type}
                                onChange={e => setCreateBody(s => ({ ...s, type: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#00215E]"
                            >
                                <option value="Lecture">Lecture</option>
                                <option value="Laboratory">Laboratory</option>
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={createRoom}
                        disabled={createLoading || !createBody.room_id || createBody.capacity === 0}
                        className="px-4 py-2 rounded-md text-sm font-medium bg-[#00215E] text-white hover:bg-[#001a47] disabled:opacity-50 transition-colors"
                    >
                        {createLoading ? 'Adding…' : 'Add Room'}
                    </button>
                </div>
                {/* Update Room Form */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 w-full">
                    <div className="flex items-center gap-2 mb-5">
                        <FiEdit2 size={20} className="text-[#C9A84C]" />
                        <h2 className="text-lg font-semibold text-[#00215E]">Update Room</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-[#1F2937] mb-1">Room ID *</label>
                            <input
                                type="text"
                                value={updateRoomId}
                                onChange={e => setUpdateRoomId(e.target.value)}
                                placeholder="e.g., A101"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#00215E]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#1F2937] mb-1">Capacity (optional)</label>
                            <input
                                type="number"
                                value={updateCapacity}
                                onChange={e => setUpdateCapacity(e.target.value)}
                                placeholder="Leave blank to keep"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-[10.4px] focus:outline-none focus:border-[#00215E]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#1F2937] mb-1">Type (optional)</label>
                            <select
                                value={updateType}
                                onChange={e => setUpdateType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#00215E]"
                            >
                                <option value="">(no change)</option>
                                <option value="Lecture">Lecture</option>
                                <option value="Laboratory">Laboratory</option>
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={updateRoom}
                        disabled={updateLoading || !updateRoomId || (updateCapacity === '' && updateType === '')}
                        className="px-4 py-2 rounded-md text-sm font-medium bg-[#C9A84C] text-white hover:bg-[#B89839] disabled:opacity-50 transition-colors"
                    >
                        {updateLoading ? 'Updating…' : 'Update Room'}
                    </button>
                </div>

                {/* Remove Room Form */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 w-[55%]">
                <div className="flex items-center gap-2 mb-5">
                    <FiTrash2 size={20} className="text-red-600" />
                    <h2 className="text-lg font-semibold text-[#00215E]">Remove Room</h2>
                </div>
                <div className="flex gap-4">
                    <div className="flex-1 max-w-sm">
                        <label className="block text-sm font-medium text-[#1F2937] mb-1">Room ID *</label>
                        <input
                            type="text"
                            value={removeRoomId}
                            onChange={e => setRemoveRoomId(e.target.value)}
                            placeholder="e.g., A101"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#00215E]"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={removeRoom}
                            disabled={removeLoading || !removeRoomId}
                            className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                            {removeLoading ? 'Removing…' : 'Remove'}
                        </button>
                    </div>
                </div>
            </div>
            </div>



            {/* Check Availability */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-[#00215E] mb-5">Check Availability</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-[#1F2937] mb-1">Day (optional)</label>
                        <input
                            type="text"
                            value={availDay}
                            onChange={e => setAvailDay(e.target.value)}
                            placeholder="e.g., Monday"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#00215E]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#1F2937] mb-1">Start Time (optional)</label>
                        <input
                            type="text"
                            value={availStart}
                            onChange={e => setAvailStart(e.target.value)}
                            placeholder="e.g., 07:30:00"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#00215E]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#1F2937] mb-1">End Time (optional)</label>
                        <input
                            type="text"
                            value={availEnd}
                            onChange={e => setAvailEnd(e.target.value)}
                            placeholder="e.g., 09:00:00"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#00215E]"
                        />
                    </div>
                </div>
                <button
                    onClick={loadAvailable}
                    disabled={availLoading}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-[#00215E] text-white hover:bg-[#001a47] disabled:opacity-50 transition-colors"
                >
                    {availLoading ? 'Searching…' : 'Search Available Rooms'}
                </button>

                {available.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-sm font-semibold text-[#1F2937] mb-4">
                            Found {available.length} available room{available.length !== 1 ? 's' : ''}
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="px-4 py-2 text-left font-medium text-[#6B7280]">Room ID</th>
                                        <th className="px-4 py-2 text-left font-medium text-[#6B7280]">Type</th>
                                        <th className="px-4 py-2 text-left font-medium text-[#6B7280]">Capacity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {available.map((room, idx) => (
                                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-[#1F2937]">{room.room_id}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${room.type === 'Lecture'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {room.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-[#6B7280]">{room.capacity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex gap-3">
                        <IoWarningOutline className="text-red-600 shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="font-medium text-red-900">Error</p>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Alert */}
            {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                    <p className="font-medium text-emerald-900">✓ {successMsg}</p>
                </div>
            )}

        </div>

    )
}
