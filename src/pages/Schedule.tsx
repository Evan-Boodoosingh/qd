import { useState, useEffect } from 'react'
import Nav from '../components/Nav/Nav'
import { fetchCurrentSeason, proxyImage } from '../services/anime'
import WeeklyGrid from '../components/WeeklyGrid/WeeklyGrid'

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
  studio: string
  subbed: boolean
  dubbed: boolean
  onMyList: boolean
}

type FilterType = 'all' | 'subbed' | 'dubbed'
type ScheduleTab = 'mySchedule' | 'fullSchedule'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const convertToLocalTime = (time: string, timezone: string): string => {
  try {
    const [hours, minutes] = time.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone,
      hour12: true,
    }).format(date)
  } catch {
    return time
  }
}

const normalizeDayName = (day: string): string => {
  const map: Record<string, string> = {
    Mondays: 'Monday',
    Tuesdays: 'Tuesday',
    Wednesdays: 'Wednesday',
    Thursdays: 'Thursday',
    Fridays: 'Friday',
    Saturdays: 'Saturday',
    Sundays: 'Sunday',
  }
  return map[day] || day
}

function Schedule() {
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedDay, setSelectedDay] = useState('Wednesday')
  const [activeTab, setActiveTab] = useState<ScheduleTab>('fullSchedule')

  const user = localStorage.getItem('user') || sessionStorage.getItem('user')
  const isLoggedIn = !!user

  useEffect(() => {
    fetchCurrentSeason()
      .then((data) => {
        const normalized = data
          .filter((s: any) => s.day && s.day !== 'Unknown')
          .map((s: any) => ({
            ...s,
            day: normalizeDayName(s.day),
            onMyList: false,
            subbed: true,
            dubbed: false,
          }))
          .filter((s: any, index: number, self: any[]) =>
            index === self.findIndex((t: any) => t.id === s.id)
          )
        setShows(normalized)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const baseShows = activeTab === 'mySchedule'
    ? shows.filter((s) => s.onMyList)
    : shows

  const filteredShows = baseShows.filter((show) => {
    if (filter === 'subbed') return show.subbed
    if (filter === 'dubbed') return show.dubbed
    return true
  })

  const showsForDay = filteredShows
    .filter((show) => show.day === selectedDay)
    .sort((a, b) => {
      if (!a.time || !b.time) return 0
      return a.time.localeCompare(b.time)
    })

  if (loading) {
    return (
      <div className="bg-[#0f0e0d] min-h-screen text-white">
        <Nav />
        <div className="flex items-center justify-center h-96">
          <p className="text-[#9a9590] text-sm animate-pulse">Loading schedule...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0f0e0d] min-h-screen text-white">
      <Nav />

      <div className="px-6 py-8 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium text-[#f0ede8] mb-1">Schedule</h1>
            <p className="text-[13px] text-[#9a9590]">Spring 2026 · Updated daily from all major platforms</p>
          </div>
          <div className="flex gap-1 bg-[#1a1815] border border-white/7 rounded-xl p-1">
            {(['all', 'subbed', 'dubbed'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm cursor-pointer transition-all ${
                  filter === f ? 'text-white' : 'text-[#9a9590] hover:text-[#f0ede8]'
                }`}
                style={filter === f ? { backgroundColor: '#D13924' } : {}}
              >
                {f === 'all' ? 'All' : f === 'subbed' ? 'Sub' : 'Dub'}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#1a1815] border border-white/7 rounded-xl p-1 w-fit mb-6">
          {isLoggedIn && (
            <button
              onClick={() => setActiveTab('mySchedule')}
              className={`px-5 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                activeTab === 'mySchedule' ? 'text-white' : 'text-[#9a9590] hover:text-[#f0ede8]'
              }`}
              style={activeTab === 'mySchedule' ? { backgroundColor: '#D13924' } : {}}
            >
              My Schedule
            </button>
          )}
          <button
            onClick={() => setActiveTab('fullSchedule')}
            className={`px-5 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
              activeTab === 'fullSchedule' ? 'text-white' : 'text-[#9a9590] hover:text-[#f0ede8]'
            }`}
            style={activeTab === 'fullSchedule' ? { backgroundColor: '#D13924' } : {}}
          >
            Full Schedule
          </button>
        </div>

        {/* Day selector */}
        <div className="grid grid-cols-7 gap-2 mb-8">
          {days.map((day) => {
            const hasNew = filteredShows.some((s) => s.day === day)
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`rounded-xl p-3 text-center cursor-pointer transition-all border ${
                  selectedDay === day
                    ? 'border-[#D13924] bg-[#D13924]/10'
                    : 'border-white/7 bg-[#1a1815] hover:border-[#D13924]/30'
                }`}
              >
                <div className={`text-[11px] font-medium mb-1 ${
                  selectedDay === day ? 'text-[#D13924]' : 'text-[#9a9590]'
                }`}>
                  {day.slice(0, 3)}
                </div>
                {isLoggedIn && activeTab === 'mySchedule' && hasNew && (
                  <div className="flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D13924]" />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Timeline */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-medium text-[#f0ede8]">{selectedDay}</h2>
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[11px] text-[#9a9590]">{showsForDay.length} airing</span>
          </div>

          {showsForDay.length === 0 ? (
            <div className="text-center py-12 bg-[#1a1815] border border-white/7 rounded-xl">
              <p className="text-[#9a9590] text-sm">Nothing airing on {selectedDay}</p>
              <p className="text-[#5a5650] text-[12px] mt-1">Try a different day or filter</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {showsForDay.map((show) => (
                <div
                  key={show.id}
                  className="bg-[#1a1815] border border-white/7 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-[#D13924]/30 transition-all"
                >
                  <div className="text-center flex-shrink-0 w-20">
                    <div className="text-[12px] font-medium text-[#f0ede8]">
                      {show.time ? convertToLocalTime(show.time, show.timezone) : 'TBA'}
                    </div>
                    <div className="text-[10px] text-[#5a5650]">Local time</div>
                  </div>

                  <div className="w-px h-10 bg-white/10 flex-shrink-0" />

                  <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={proxyImage(show.image)}
                      alt={show.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[#f0ede8] truncate mb-1">{show.title}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#9a9590]">{show.genres.slice(0, 2).join(' · ')}</span>
                      <span className="text-[11px] text-[#5a5650]">·</span>
                      <span className="text-[11px] text-[#9a9590]">{show.studio}</span>
                    </div>
                  </div>

                  <div className="flex gap-1.5 flex-shrink-0">
                    <span className="text-[9px] text-[#1D9E75] bg-[#1D9E75]/10 border border-[#1D9E75]/25 px-2 py-0.5 rounded">SUB</span>
                  </div>

                  <div className="flex-shrink-0">
                    <span className="text-[10px] text-[#9a9590]">♥ {show.score}</span>
                  </div>

                  {isLoggedIn && (
                    <button
                      className="text-[11px] font-medium px-3 py-1.5 rounded-full flex-shrink-0 cursor-pointer hover:opacity-90 transition-all"
                      style={{ backgroundColor: '#D13924', color: '#fff' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      + List
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weekly grid */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-medium text-[#f0ede8]">This week at a glance</h2>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <WeeklyGrid shows={filteredShows} />
        </div>

        {/* Full season grid */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-medium text-[#f0ede8]">
              {activeTab === 'mySchedule' ? 'All shows on my list' : 'Full season — Spring 2026'}
            </h2>
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[11px] text-[#9a9590]">{filteredShows.length} shows</span>
          </div>

          <div className="grid grid-cols-6 gap-4">
            {filteredShows.map((show) => (
              <div
                key={show.id}
                className="bg-[#1a1815] border border-white/7 rounded-xl overflow-hidden cursor-pointer hover:border-[#D13924]/30 transition-all"
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                  <img
                    src={proxyImage(show.image)}
                    alt={show.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1815] to-transparent opacity-60" />
                </div>
                <div className="p-3">
                  <div className="text-[11px] font-medium text-[#f0ede8] truncate mb-1">{show.title}</div>
                  <div className="text-[10px] text-[#9a9590] truncate mb-2">{show.genres.slice(0, 2).join(' · ')}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#9a9590]">{show.day}</span>
                    <span className="text-[10px] text-[#D13924]">♥ {show.score}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Schedule