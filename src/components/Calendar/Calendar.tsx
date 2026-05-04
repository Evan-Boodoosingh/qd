import { useState, useEffect } from 'react'
import { fetchCurrentSeason } from '../../services/anime'
import WeeklyGrid from '../WeeklyGrid/WeeklyGrid'

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
  isOngoing: boolean
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

function Calendar() {
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)
  const [showOngoing, setShowOngoing] = useState(true)

  useEffect(() => {
    fetchCurrentSeason()
      .then((data) => {
        const normalized = data
          .filter((s: any) => s.day && s.day !== 'Unknown')
          .map((s: any) => ({
            ...s,
            day: normalizeDayName(s.day),
            isOngoing: s.isOngoing || false,
          }))
          .filter((s: any, index: number, self: any[]) =>
            index === self.findIndex((t: any) => t.id === s.id)
          )
        setShows(normalized)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredShows = showOngoing ? shows : shows.filter(s => !s.isOngoing)

  if (loading) {
    return (
      <div className="px-6 pt-2 pb-5 border-t border-white/5">
        <div className="text-[#9a9590] text-sm animate-pulse">Loading schedule...</div>
      </div>
    )
  }

  return (
    <div className="px-6 pt-2 pb-5 border-t border-white/5">

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium text-[#f0ede8]">This week's schedule</h2>
          <p className="text-[11px] text-[#9a9590] mt-0.5">Spring 2026 · Updated daily</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOngoing(!showOngoing)}
            className={`text-[11px] px-3 py-1 rounded-full cursor-pointer transition-all border ${
              !showOngoing
                ? 'border-[#7F77DD] text-[#7F77DD] bg-[#7F77DD]/10'
                : 'border-white/7 text-[#9a9590] hover:text-[#f0ede8]'
            }`}
          >
            {showOngoing ? 'Seasonal only' : 'All shows'}
          </button>
          <span className="text-[11px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/20 px-3 py-1 rounded-full">
            Spring 2026
          </span>
        </div>
      </div>

      <WeeklyGrid shows={filteredShows} />

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