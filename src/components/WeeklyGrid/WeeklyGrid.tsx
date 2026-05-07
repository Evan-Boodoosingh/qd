import { proxyImage } from '../../services/anime'

type Show = {
  id: number
  title: string
  image: string | null
  score: number
  day: string
  time: string | null
  timezone: string
  isOngoing?: boolean
}

type Props = {
  shows: Show[]
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const normalizeDayToShort = (day: string): string => {
  const map: Record<string, string> = {
    Monday: 'Mon',
    Tuesday: 'Tue',
    Wednesday: 'Wed',
    Thursday: 'Thu',
    Friday: 'Fri',
    Saturday: 'Sat',
    Sunday: 'Sun',
  }
  return map[day] || day
}

const convertToLocalTime = (time: string, timezone: string): string => {
  try {
    const [hours, minutes] = time.split(':').map(Number)
    const now = new Date()
    const dateStr = `${now.toLocaleDateString('en-CA')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`

    const sourceTzFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false
    })

    const tempDate = new Date(dateStr + 'Z')
    const parts = sourceTzFormatter.formatToParts(tempDate)
    const tzHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0')
    const tzMin = parseInt(parts.find(p => p.type === 'minute')?.value || '0')
    const diffMs = ((hours - tzHour) * 60 + (minutes - tzMin)) * 60 * 1000
    const correctedDate = new Date(tempDate.getTime() + diffMs)

    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(correctedDate)
  } catch {
    return time
  }
}

function WeeklyGrid({ shows }: Props) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).slice(0, 3)

 const toUtcMinutes = (time: string, timezone: string): number => {
  try {
    const [hours, minutes] = time.split(':').map(Number)
    const now = new Date()
    const dateStr = `${now.toLocaleDateString('en-CA')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
    const utcDate = new Date(dateStr + 'Z')
    const localString = utcDate.toLocaleString('en-US', { timeZone: timezone })
    const tzDate = new Date(localString)
    const offsetMs = utcDate.getTime() - tzDate.getTime()
    const corrected = new Date(utcDate.getTime() + offsetMs)
    return corrected.getUTCHours() * 60 + corrected.getUTCMinutes()
  } catch {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
  }
}

const getShowsForDay = (day: string) =>
  shows
    .filter((s) => normalizeDayToShort(s.day) === day)
    .sort((a, b) => {
      if (!a.time || !b.time) return 0
      return toUtcMinutes(a.time, a.timezone) - toUtcMinutes(b.time, b.timezone)
    })

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
                    {show.time && (
                      <div className="text-[10px] text-[#D13924] font-medium">
                        {convertToLocalTime(show.time, show.timezone)}
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