import { proxyImage } from '../../services/anime'
import { getLocalDay, getLocalTime, getLocalMinutes } from '../../utils/scheduleTime'
import type { ScheduleShow } from '../../utils/scheduleTime'

type Show = ScheduleShow & {
  id: number
  title: string
  image: string | null
  score: number
  isOngoing?: boolean
}

type Props = {
  shows: Show[]
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const fullDayToShort: Record<string, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed',
  Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
}

function WeeklyGrid({ shows }: Props) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).slice(0, 3)

  const getShowsForDay = (shortDay: string) =>
    shows
      .filter((s) => {
        const localDay = getLocalDay(s)
        return fullDayToShort[localDay] === shortDay
      })
      .sort((a, b) => getLocalMinutes(a) - getLocalMinutes(b))

  return (
    <div className="grid grid-cols-7 gap-2 items-start">
      {days.map((day) => {
        const dayShows = getShowsForDay(day)
        const isToday = day === today

        return (
          <div key={day} className="flex flex-col gap-2">
            <div className={`text-[10px] text-center uppercase tracking-wider pb-1.5 border-b border-white/5 ${
              isToday ? 'text-[#D13924]' : 'text-[#9a9590]'
            }`}>
              {isToday ? `${day} · Today` : day}
            </div>

            {dayShows.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/5 bg-white/[0.02]" style={{ aspectRatio: '1/1' }} />
            ) : (
              dayShows.map((show) => (
                <div
                  key={show.id}
                  onClick={() => window.location.href = `/show/${show.id}`}
                  className="rounded-lg border border-white/7 bg-[#1a1815] cursor-pointer hover:border-[#D13924]/40 transition-all overflow-hidden"
                >
                  <div className="relative overflow-hidden" style={{ aspectRatio: '1/1' }}>
                    <img
                      src={proxyImage(show.image)}
                      alt={show.title}
                      className="w-full h-full object-cover"
                    />
                    {show.isOngoing && (
                      <div className="absolute top-1 right-1">
                        <span className="text-[7px] text-[#7F77DD] bg-[#0f0e0d]/80 border border-[#7F77DD]/40 px-1.5 py-0.5 rounded-full">
                          Ongoing
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <div className="text-[11px] text-[#f0ede8] leading-tight truncate mb-1 font-medium">{show.title}</div>
                    {(show.time || show.isoDate) && (
                      <div className="text-[10px] text-[#D13924] font-medium">
                        {getLocalTime(show)}
                      </div>
                    )}
                    <div className="text-[10px] text-[#9a9590] mt-0.5">♥ {show.score}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )
      })}
    </div>
  )
}

export default WeeklyGrid