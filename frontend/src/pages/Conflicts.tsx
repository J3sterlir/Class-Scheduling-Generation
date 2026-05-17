import React from 'react'
import { apiFetch } from '../api'
import { IoWarningOutline } from 'react-icons/io5'
import { MdExpandMore } from 'react-icons/md'
import { FaCheckSquare } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";

type ConflictItem = {
  type: string
  reason: string
  suggestion: string
  schedule_1: {
    id: number
    course: string
    section: string
    room: string
    day: string
    time: string
  }
  schedule_2: {
    id: number
    course: string
    section: string
    room: string
    day: string
    time: string
  }
}

type ConflictReport = {
  total_schedules: number
  total_conflicts: number
  conflicts: ConflictItem[]
}

export default function Conflicts() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [report, setReport] = React.useState<ConflictReport | null>(null)
  const [expandedIdx, setExpandedIdx] = React.useState<number | null>(null)
  const [ignoredPairs, setIgnoredPairs] = React.useState<Set<string>>(new Set())

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await apiFetch<ConflictReport>('/api/schedules/conflicts')
      setReport(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void load()
  }, [load])

  const handleIgnoreConflict = async (conflict: ConflictItem) => {
    try {
      const pairKey = `${conflict.schedule_1.id}-${conflict.schedule_2.id}`
      await apiFetch('/api/schedules/conflicts/ignore', {
        method: 'POST',
        body: {
          schedule_1_id: conflict.schedule_1.id,
          schedule_2_id: conflict.schedule_2.id
        }
      })
      setIgnoredPairs(prev => new Set([...prev, pairKey]))
    } catch (e) {
      alert('Failed to ignore conflict: ' + (e instanceof Error ? e.message : String(e)))
    }
  }

  const activeConflicts = report?.conflicts.filter(c => {
    const pairKey = `${c.schedule_1.id}-${c.schedule_2.id}`
    return !ignoredPairs.has(pairKey)
  }) ?? []

  const ignoredCount = (report?.total_conflicts ?? 0) - activeConflicts.length

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-fraunces text-[#00215E] mb-2">
          Scheduling Conflicts
        </h1>
        <p className="text-sm text-[#6B7280]">
          Review and resolve overlaps, capacity issues, and incomplete data flagged by the scheduling engine.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs font-medium text-[#6B7280] mb-1">Total Schedules</div>
          <div className="text-2xl font-bold text-[#00215E]">{report?.total_schedules ?? 0}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs font-medium text-[#6B7280] mb-1">Active Conflicts</div>
          <div className="text-2xl font-bold text-red-600">{activeConflicts.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs font-medium text-[#6B7280] mb-1">Resolved/Ignored</div>
          <div className="text-2xl font-bold text-emerald-600">{ignoredCount}</div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#00215E] border-r-transparent"></div>
            <p className="text-[#6B7280] mt-2">Loading conflicts…</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <IoWarningOutline className="text-red-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-red-900">Error loading conflicts</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={load}
                className="mt-3 text-sm font-medium text-red-600 hover:text-red-700 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {report && activeConflicts.length === 0 && ignoredCount === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-8 text-center mb-3">
          <div className="text-emerald-700 text-lg font-medium flex flex-col items-center"><FaCheckSquare /> No conflicts detected!</div>
          <p className="text-emerald-600 text-sm mt-2">Your schedule is perfectly optimized.</p>
        </div>
      )}

      {/* All Conflicts Resolved State */}
      {report && activeConflicts.length === 0 && ignoredCount > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-6">
          <div className="flex gap-3">
            <div className="text-emerald-600 text-xl"><FaCheck /></div>
            <div>
              <p className="font-medium text-emerald-900">All conflicts resolved</p>
              <p className="text-sm text-emerald-700 mt-1">You've resolved or ignored {ignoredCount} conflict{ignoredCount !== 1 ? 's' : ''}.</p>
            </div>
          </div>
        </div>
      )}

      {/* Conflicts List */}
      {report && activeConflicts.length > 0 && (
        <div className="space-y-4">
          {activeConflicts.map((conflict, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Conflict Header */}
              <div
                onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                className="p-5 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        conflict.type === 'room'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {conflict.type === 'room' ? '🚪 Room Conflict' : '👥 Section Conflict'}
                      </div>
                      <div className="text-xs text-[#6B7280] font-medium">
                        {conflict.schedule_1.day}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-[#1F2937] mb-2">
                      {conflict.schedule_1.course} (Sec. {conflict.schedule_1.section}) vs{' '}
                      {conflict.schedule_2.course} (Sec. {conflict.schedule_2.section})
                    </p>
                    <p className="text-sm text-[#6B7280]">{conflict.reason}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpandedIdx(expandedIdx === idx ? null : idx)
                    }}
                    className="shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <MdExpandMore
                      size={24}
                      className={`text-[#6B7280] transition-transform ${
                        expandedIdx === idx ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedIdx === idx && (
                <div className="bg-gray-50 p-5 border-t border-gray-100">
                  {/* Schedule Details */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white border border-gray-200 rounded p-4">
                      <div className="text-xs font-semibold text-[#00215E] mb-3 uppercase tracking-wide">
                        Schedule 1
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-[#6B7280]">Course:</span>
                          <span className="font-medium text-[#1F2937] ml-2">
                            {conflict.schedule_1.course}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#6B7280]">Section:</span>
                          <span className="font-medium text-[#1F2937] ml-2">
                            {conflict.schedule_1.section}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#6B7280]">Room:</span>
                          <span className="font-medium text-[#1F2937] ml-2">
                            {conflict.schedule_1.room}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#6B7280]">Time:</span>
                          <span className="font-medium text-[#1F2937] ml-2">
                            {conflict.schedule_1.time}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded p-4">
                      <div className="text-xs font-semibold text-[#00215E] mb-3 uppercase tracking-wide">
                        Schedule 2
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-[#6B7280]">Course:</span>
                          <span className="font-medium text-[#1F2937] ml-2">
                            {conflict.schedule_2.course}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#6B7280]">Section:</span>
                          <span className="font-medium text-[#1F2937] ml-2">
                            {conflict.schedule_2.section}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#6B7280]">Room:</span>
                          <span className="font-medium text-[#1F2937] ml-2">
                            {conflict.schedule_2.room}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#6B7280]">Time:</span>
                          <span className="font-medium text-[#1F2937] ml-2">
                            {conflict.schedule_2.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Suggestion */}
                  <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
                    <div className="text-xs font-semibold text-blue-900 mb-2">💡 SUGGESTION</div>
                    <p className="text-sm text-blue-900">{conflict.suggestion}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleIgnoreConflict(conflict)}
                      className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      Ignore for Now
                    </button>

                    <button
                      disabled
                      className="px-4 py-2 rounded-md text-sm font-medium bg-[#C9A84C] text-white hover:bg-[#B89839] transition-colors opacity-50 cursor-not-allowed"
                      title="Manual override requires admin approval"
                    >
                      Manual Override (Admin Only)
                    </button>

                    <a
                      href="/schedules"
                      className="px-4 py-2 rounded-md text-sm font-medium bg-[#00215E] text-white hover:bg-[#001a47] transition-colors"
                    >
                      Go to Schedule Editor
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      {report && (
        <button
          onClick={load}
          disabled={loading}
          className="mt-8 px-6 py-2 rounded-md text-sm font-medium bg-[#00215E] text-white hover:bg-[#001a47] disabled:opacity-50 transition-colors"
        >
          {loading ? 'Refreshing…' : 'Refresh Conflicts'}
        </button>
      )}
    </div>
  )
}
