import { useState, useEffect } from 'react'
import { fetchCurrentSeason, proxyImage } from '../../services/anime'
import { addToWatchlist, fetchWatchlist } from '../../services/watchlist'
import { getLocalDay, getLocalTime, getLocalMinutes } from '../../utils/scheduleTime'

type Show = {
  id: number
  title: string
  image: string | null
  score: number
  genres: string[]
  day: string
  time: string | null
  timezone: string
  isoDate?: string | null
  episodes: number | null
  studio: string
  isOngoing: boolean
}

type Filter = 'all' | 'myList'

const normalizeDayName = (day: string): string => {
  const map: Record<string, string> = {
    Mondays: 'Monday', Tuesdays: 'Tuesday', Wednesdays: 'Wednesday',
    Thursdays: 'Thursday', Fridays: 'Friday', Saturdays: 'Saturday', Sundays: 'Sunday',
  }
  return map[day] || day
}

function AiringToday() {
  const [shows, setShows] = useState<Show[]>([])
  const [watchedIds, setWatchedIds] = useState<number[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)

  const user = localStorage.getItem('user') || sessionStorage.getItem('user')
  const isLoggedIn = !!user
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })

  useEffect(() => {
    const load = async () => {
      try {
        const [seasonData, watchlistData] = await Promise.all([
          fetchCurrentSeason(),
          isLoggedIn ? fetchWatchlist().catch(() => []) : Promise.resolve([]),
        ])

        const todayShows = seasonData
          .filter((s: Show) => {
            const localDay = normalizeDayName(getLocalDay(s))
            return localDay === today && s.image
          })
          .map((s: Show) => ({ ...s, day: normalizeDayName(getLocalDay(s)) }))
          .sort((a: Show, b: Show) => getLocalMinutes(a) - getLocalMinutes(b))

        setShows(todayShows)
        setWatchedIds(watchlistData.map((e: { showId: number }) => e.showId))
      } catch (err) {
        console.error('Failed to load today schedule:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddToList = async (e: React.MouseEvent, show: Show) => {
    e.stopPropagation()
    try {
      await addToWatchlist({
        showId: show.id,
        showName: show.title,
        image: show.image,
        totalEpisodes: show.episodes,
        airingEpisode: null,
        genres: show.genres,
      })
      setWatchedIds(prev => [...prev, show.id])
    } catch (err) {
      if (err instanceof Error && err.message === 'Show already on your list') {
        setWatchedIds(prev => [...prev, show.id])
      }
    }
  }

  const filteredShows = filter === 'myList'
    ? shows.filter(s => watchedIds.includes(s.id))
    : shows

  if (loading) {
    return (
      <div className="lg:hidden px-4 py-6">
        <div className="text-[#9a9590] text-sm animate-pulse">Loading today's schedule...</div>
      </div>
    )
  }

  return (
    <div className="lg:hidden border-b border-white/5">
      <div className="px-4 pt-6 pb-2">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[15px] font-medium text-[#f0ede8]">Airing Today</h2>
            <p className="text-[11px] text-[#9a9590] mt-0.5">{today} · {filteredShows.length} shows</p>
          </div>
          <button
            onClick={() => window.location.href = '/schedule'}
            className="text-[11px] text-[#D13924] cursor-pointer hover:underline shrink-0"
          >
            Full schedule ›
          </button>
        </div>

        {/* Filter toggle */}
        {isLoggedIn && (
          <div className="flex gap-1 bg-[#1a1815] border border-white/7 rounded-xl p-1 w-fit mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer transition-all ${
                filter === 'all' ? 'text-white' : 'text-[#9a9590]'
              }`}
              style={filter === 'all' ? { backgroundColor: '#D13924' } : {}}
            >
              All
            </button>
            <button
              onClick={() => setFilter('myList')}
              className={`px-4 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer transition-all ${
                filter === 'myList' ? 'text-white' : 'text-[#9a9590]'
              }`}
              style={filter === 'myList' ? { backgroundColor: '#D13924' } : {}}
            >
              My List
            </button>
          </div>
        )}

        {/* Empty state */}
        {filteredShows.length === 0 && (
          <div className="text-center py-10 bg-[#1a1815] border border-white/7 rounded-xl mb-4">
            <p className="text-[#9a9590] text-sm">
              {filter === 'myList' ? 'None of your shows air today' : 'Nothing airing today'}
            </p>
          </div>
        )}

        {/* Timeline list */}
        <div className="flex flex-col gap-3 pb-4">
          {filteredShows.map((show) => {
            const isAdded = watchedIds.includes(show.id)
            return (
              <div
                key={show.id}
                onClick={() => window.location.href = `/show/${show.id}`}
                className="bg-[#1a1815] border border-white/7 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-[#D13924]/30 transition-all"
              >
                {/* Time */}
                <div className="text-center shrink-0 w-16">
                  <div className="text-[12px] font-medium text-[#f0ede8]">
                    {getLocalTime(show) ?? 'TBA'}
                  </div>
                  <div className="text-[9px] text-[#5a5650]">Local</div>
                </div>

                <div className="w-px h-8 bg-white/10 shrink-0" />

                {/* Poster */}
                <div className="w-9 h-12 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={proxyImage(show.image)}
                    alt={show.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium text-[#f0ede8] truncate">{show.title}</div>
                  <div className="text-[10px] text-[#9a9590] truncate">
                    {show.genres.slice(0, 2).join(' · ')}
                  </div>
                </div>

                {/* Add button */}
                {isLoggedIn && (
                  <button
                    onClick={(e) => handleAddToList(e, show)}
                    className="text-[10px] font-medium px-3 py-1.5 rounded-full shrink-0 cursor-pointer hover:opacity-90 transition-all"
                    style={{
                      backgroundColor: isAdded ? 'rgba(209,57,36,0.2)' : '#D13924',
                      color: isAdded ? '#D13924' : '#fff',
                    }}
                  >
                    {isAdded ? '✓' : '+'}
                  </button>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}

export default AiringToday