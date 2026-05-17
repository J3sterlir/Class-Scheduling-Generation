import React from 'react'
import { apiFetch } from '../api'
import { IoWarningOutline } from 'react-icons/io5'
import { FiRefreshCw } from 'react-icons/fi'

type CourseOffering = {
  course_code: string
  units: number
  section_capacity: number
  semester: string
}

export default function Courses() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [courses, setCourses] = React.useState<CourseOffering[]>([])
  const [lastSyncTime, setLastSyncTime] = React.useState<Date | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await apiFetch<{ courses: CourseOffering[] }>('/api/courses/offerings')
      setCourses(res.courses)
      setLastSyncTime(new Date())
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void load()
  }, [load])

  // Calculate stats
  const totalCourses = courses.length
  const totalUnits = courses.reduce((sum, c) => sum + c.units, 0)
  const totalCapacity = courses.reduce((sum, c) => sum + c.section_capacity, 0)
  const avgCapacity = totalCourses > 0 ? Math.round(totalCapacity / totalCourses) : 0
  const semesterSet = new Set(courses.map(c => c.semester))
  const uniqueSemesters = semesterSet.size

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-fraunces text-[#00215E] mb-2">
          Course Offerings
        </h1>
        <p className="text-sm text-[#6B7280]">
          All course sections being offered this semester. Data is synced from the Course Management Subsystem.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs font-medium text-[#6B7280] mb-1">Total Courses</div>
          <div className="text-2xl font-bold text-[#00215E]">{totalCourses}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs font-medium text-[#6B7280] mb-1">Total Units</div>
          <div className="text-2xl font-bold text-blue-600">{totalUnits}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs font-medium text-[#6B7280] mb-1">Total Capacity</div>
          <div className="text-2xl font-bold text-purple-600">{totalCapacity}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs font-medium text-[#6B7280] mb-1">Active Semesters</div>
          <div className="text-2xl font-bold text-emerald-600">{uniqueSemesters}</div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <IoWarningOutline className="text-red-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-red-900">Sync Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={load}
                className="mt-3 text-sm font-medium text-red-600 hover:text-red-700 underline"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sync Status */}
      {lastSyncTime && !error && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            ✓ Last synced: {lastSyncTime.toLocaleTimeString()} on {lastSyncTime.toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#00215E]">All Course Offerings</h2>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-[#00215E] text-white hover:bg-[#001a47] disabled:opacity-50 transition-colors"
          >
            <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Syncing…' : 'Sync'}
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#00215E] border-r-transparent"></div>
          </div>
        )}

        {!loading && courses.length === 0 ? (
          <div className="text-center py-12 text-[#6B7280]">
            <p>No course offerings found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-[#6B7280]">Course Code</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6B7280]">Units</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6B7280]">Section Capacity</th>
                  <th className="px-4 py-3 text-left font-medium text-[#6B7280]">Semester</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, idx) => (
                  <tr
                    key={`${course.course_code}-${idx}`}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-[#1F2937]">{course.course_code}</td>
                    <td className="px-4 py-3 text-[#6B7280]">
                      <span className="inline-block px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium">
                        {course.units} {course.units === 1 ? 'unit' : 'units'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280]">
                      <span className="inline-block px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs font-medium">
                        {course.section_capacity} students
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-xs font-medium">
                        {course.semester}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Data Summary */}
      {courses.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="text-xs font-semibold text-blue-900 mb-1">AVERAGE CAPACITY</div>
            <div className="text-2xl font-bold text-blue-700">{avgCapacity}</div>
            <p className="text-xs text-blue-600 mt-2">students per section</p>
          </div>
          <div className="bg-linear-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
            <div className="text-xs font-semibold text-purple-900 mb-1">TOTAL ENROLLMENT</div>
            <div className="text-2xl font-bold text-purple-700">{totalCapacity}</div>
            <p className="text-xs text-purple-600 mt-2">students across all sections</p>
          </div>
          <div className="bg-linear-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-4">
            <div className="text-xs font-semibold text-emerald-900 mb-1">CREDIT HOURS</div>
            <div className="text-2xl font-bold text-emerald-700">{totalUnits}</div>
            <p className="text-xs text-emerald-600 mt-2">total units offered</p>
          </div>
        </div>
      )}
    </div>
  )
}
