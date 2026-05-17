import React from 'react'
import { apiFetch } from '../api'
import { BsLightningCharge } from "react-icons/bs";

type GeneratedItem = {
    course_code: string
    section?: string
    status?: string
    day?: string
    start_time?: string
    end_time?: string
    room_id?: string | number
    capacity?: number
}

type GeneratedResponse = {
    message: string
    total: number
    data: GeneratedItem[]
}

export default function GenerateSchedule() {
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [result, setResult] = React.useState<GeneratedResponse | null>(null)

    const sampleResult: GeneratedResponse = {
        message: 'Schedule generation complete (sample)'
        ,
        total: 5,
        data: [
            {
                course_code: 'CS101',
                section: 'A',
                day: 'Monday',
                start_time: '07:30:00',
                end_time: '09:00:00',
                room_id: 'R101',
                capacity: 40,
                status: 'scheduled'
            },
            {
                course_code: 'MATH201',
                section: 'B',
                day: 'Wednesday',
                start_time: '10:30:00',
                end_time: '12:00:00',
                room_id: 'R204',
                capacity: 30,
                status: 'scheduled'
            },
            {
                course_code: 'ENG150',
                section: 'C',
                day: 'Friday',
                start_time: '13:00:00',
                end_time: '14:30:00',
                room_id: 'R110',
                capacity: 35,
                status: 'scheduled'
            },
            {
                course_code: 'BIO120',
                section: 'A',
                day: 'Tuesday',
                start_time: '16:00:00',
                end_time: '17:30:00',
                room_id: 'LAB2',
                capacity: 24,
                status: 'scheduled'
            },
            {
                course_code: 'HIST301',
                section: 'AUTO',
                status: 'FAILED - No available slot'
            }
        ]
    }

    const displayResult = result ?? sampleResult
    const isPreview = result == null

    async function runGenerate() {
        setLoading(true)
        setError(null)
        setResult(null)

        try {
            const res = await apiFetch<GeneratedResponse>('/api/schedules/generate', {
                method: 'POST'
            })
            setResult(res)
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h2 className='text-[#00215E] font-bold font-fraunces text-[32px]'>Generate Semester Schedule</h2>
            <h3 className='text-[#6B7280] text-[14.5px] mb-5'>Automatically allocate courses, rooms, and time slots. The engine validates data and produces the finalized schedule.</h3>

            <div className='flex flex-row gap-10'>
                <div className='rounded-xl bg-white px-10 py-5 border border-gray-300 mb-5 flex flex-col gap-10 w-fit h-fit'>
                    <p className='text-[#6B7280] text-[14.5px]'>⚠️ Warning: Running the generator will create a new batch of schedule results. If you already have a schedule you want to keep, back it up before proceeding.</p>
                    <hr  className='border-gray-300'/>
                    <button onClick={runGenerate} disabled={loading} className='bg-[#00215E] text-white flex flex-row px-5 py-2 rounded-lg items-center justify-center gap-2'>
                        {loading ? 'Generating… Please wait' : <><BsLightningCharge className='mt-0.4 stroke-1' /> Generate Schedule</>}
                    </button>
                </div>

                <div className='bg-white px-10 py-5 border border-gray-300 mb-10 rounded-xl w-full h-fit flex flex-col'>
                    <h4 className='text-[#00215E] font-bold text-xl mb-1 font-fraunces'>How generation works</h4>
                    <p className='text-[#6B7280] text-[14.5px]'>A simple overview of what happens when you click “Generate”.</p>

                    <div className='text-[#6B7280] text-[14.5px] flex flex-col gap-5 mt-5'>
                        <div>
                            <div className='text-[#00215E] font-semibold'>Step 1 — Collect inputs</div>
                            <div>We gather the courses/sections that need to be scheduled and the list of available rooms.</div>
                        </div>

                        <div>
                            <div className='text-[#00215E] font-semibold'>Step 2 — Apply basic rules</div>
                            <div>The system checks simple requirements like room capacity and avoids double-booking a room at the same time.</div>
                        </div>

                        <div>
                            <div className='text-[#00215E] font-semibold'>Step 3 — Assign times and rooms</div>
                            <div>Each section is placed into an available day/time/room combination until everything is scheduled (or no valid option remains).</div>
                        </div>

                        <div>
                            <div className='text-[#00215E] font-semibold'>Step 4 — Save results</div>
                            <div>The generated schedule is saved so it can be reviewed in the Schedules and Conflicts pages.</div>
                        </div>

                        <div>
                            <div className='text-[#00215E] font-semibold'>Step 5 — Review the summary</div>
                            <div>After generation finishes, you’ll see a summary of what was successfully scheduled and what could not be placed.</div>
                        </div>
                    </div>
                </div>
            </div>


            {error && (
                <div className='mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-[14.5px]'>
                    <span className='font-semibold'>Error:</span> {error}
                </div>
            )}

            <div className='mt-4 rounded-xl border border-gray-200 bg-white'>
                <div className='flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4'>
                    <div>
                        <div className='flex items-center gap-2'>
                            <h4 className='text-[#00215E] font-bold font-fraunces text-lg'>Generation Result</h4>
                            {isPreview && (
                                <span className='rounded-full bg-slate-100 px-2 py-0.5 text-[12px] text-slate-600'>Preview</span>
                            )}
                        </div>
                        <div className='text-[#6B7280] text-[14.5px]'>{displayResult.message}</div>
                    </div>
                    <div className='text-right'>
                        <div className='text-[#6B7280] text-[12px]'>Items</div>
                        <div className='text-[#00215E] font-semibold text-[18px]'>{displayResult.total}</div>
                    </div>
                </div>

                <div className='px-5 py-4 overflow-auto'>
                    <table className='w-full text-left text-[14.5px]'>
                        <thead>
                            <tr className='text-[#6B7280] border-b border-gray-200'>
                                <th className='py-2 pr-4 font-medium'>Course</th>
                                <th className='py-2 pr-4 font-medium'>Section</th>
                                <th className='py-2 pr-4 font-medium'>Day</th>
                                <th className='py-2 pr-4 font-medium'>Time</th>
                                <th className='py-2 pr-4 font-medium'>Room</th>
                                <th className='py-2 pr-0 font-medium'>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayResult.data.map((item, idx) => {
                                const status = item.status ?? 'scheduled'
                                const isFailed = status.toLowerCase().includes('failed')
                                const timeLabel = item.start_time && item.end_time ? `${item.start_time} – ${item.end_time}` : '—'

                                return (
                                    <tr key={`${item.course_code}-${item.section ?? 'AUTO'}-${idx}`} className='border-b border-gray-100 last:border-b-0'>
                                        <td className='py-2 pr-4 text-[#00215E] font-semibold'>{item.course_code}</td>
                                        <td className='py-2 pr-4 text-[#6B7280]'>{item.section ?? 'AUTO'}</td>
                                        <td className='py-2 pr-4 text-[#6B7280]'>{item.day ?? '—'}</td>
                                        <td className='py-2 pr-4 text-[#6B7280]'>{timeLabel}</td>
                                        <td className='py-2 pr-4 text-[#6B7280]'>{item.room_id ?? '—'}</td>
                                        <td className='py-2 pr-0'>
                                            <span
                                                className={
                                                    isFailed
                                                        ? 'inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[12px] font-medium text-red-700'
                                                        : 'inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[12px] font-medium text-emerald-700'
                                                }
                                            >
                                                {status}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>

                    {isPreview && (
                        <div className='mt-3 text-[#6B7280] text-[12.5px]'>
                            This is a sample preview of the generation result format. Run the generator to see actual results based on your courses and rooms.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
