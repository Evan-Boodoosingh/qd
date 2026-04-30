import { useState, useEffect } from 'react'
import { fetchCurrentSeason, proxyImage } from '../../services/anime'

type Show = {
  id: number
  title: string
  image: string | null
  score: number
  genres: string[]
  day: string
  time: string | null
  timezone: string
  episodes: number | null
}

const normalizeDayName = (day: string): string => {
  const map: Record<string, string> = {
    Mondays: 'Mon',
    Tuesdays: 'Tue',
    Wednesdays: 'Wed',
    Thursdays: 'Thu',
    Fridays: 'Fri',
    Saturdays: 'Sat',
    Sundays: 'Sun',
  }
  return map[day] || day
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function Calendar() {
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentSeason()
      .then((data) => {
        const normalized = data
          .filter((s: any) => s.day && s.day !== 'Unknown')
          .map((s: any) => ({
            ...s,
            day: normalizeDayName(s.day),
          }))
          .filter((s: any, index: number, self: any[]) =>
            index === self.findIndex((t: any) => t.id === s.id)
          )
        setShows(normalized)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const getShowsForDay = (day: string) =>
    shows.filter((s) => s.day === day)

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).slice(0, 3)

  if (loading) {
    return (
      <div className="px-6 pt-2 pb-5 border-t border-white/5">
        <div className="text-[#9a9590] text-sm animate-pulse">Loading schedule...</div>
      </div>
    )
  }

  return (
    <div className="px-6 pt-2 pb-5 border-t border-white/5">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium text-[#f0ede8]">This week's schedule</h2>
          <p className="text-[11px] text-[#9a9590] mt-0.5">Spring 2026 · Updated daily</p>
        </div>
        <span className="text-[11px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/20 px-3 py-1 rounded-full">
          Spring 2026
        </span>
      </div>

      {/* 7 day grid */}
      <div className="grid grid-cols-7 gap-2 items-start">
        {days.map((day) => {
          const dayShows = getShowsForDay(day)
          const isToday = day === today

          return (
            <div key={day} className="flex flex-col gap-1.5">
              {/* Day label */}
              <div className={`text-[9px] text-center uppercase tracking-wider pb-1.5 border-b border-white/5 ${
                isToday ? 'text-[#D13924]' : 'text-[#9a9590]'
              }`}>
                {isToday ? `${day} · Today` : day}
              </div>

              {/* Show cards */}
              {dayShows.length === 0 ? (
                <div className="h-16 rounded-lg border border-dashed border-white/5 bg-white/[0.02]" />
              ) : (
                dayShows.map((show) => (
                  <div
                    key={show.id}
                    className="rounded-lg border border-white/7 bg-[#1a1815] cursor-pointer hover:border-[#D13924]/40 transition-all overflow-hidden"
                  >
                    {/* Poster */}
                    <div className="h-16 overflow-hidden">
                      <img
                        src={proxyImage(show.image)}
                        alt={show.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Info */}
                    <div className="p-1.5">
                      <div className="text-[8px] text-[#c8c4be] leading-tight truncate">{show.title}</div>
                      <div className="text-[7px] text-[#9a9590] mt-0.5">♥ {show.score}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 text-center">
        <span
          className="text-[11px] text-[#D13924] cursor-pointer hover:underline"
          onClick={() => window.location.href = '/schedule'}
        >
          View full season schedule ›
        </span>
      </div>

    </div>
  )
}

export default Calendar