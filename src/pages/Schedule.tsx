import { useState } from 'react'
import Nav from '../components/Nav/Nav'

type Show = {
  id: string
  name: string
  emoji: string
  genre: string
  platform: string
  day: string
  time: string
  episode: number
  totalEpisodes: number
  isNew: boolean
  subbed: boolean
  dubbed: boolean
  rating: number
  onMyList: boolean
}

const schedule: Show[] = [
  {
    id: '1',
    name: 'Frieren S2',
    emoji: '🌸',
    genre: 'Fantasy · Slice of life',
    platform: 'Crunchyroll',
    day: 'Monday',
    time: '9:00 AM',
    episode: 3,
    totalEpisodes: 24,
    isNew: true,
    subbed: true,
    dubbed: false,
    rating: 9.6,
    onMyList: false,
  },
  {
    id: '2',
    name: 'Vinland Saga S3',
    emoji: '⚔️',
    genre: 'Historical · Drama',
    platform: 'Netflix',
    day: 'Tuesday',
    time: '12:00 PM',
    episode: 7,
    totalEpisodes: 24,
    isNew: false,
    subbed: true,
    dubbed: true,
    rating: 9.4,
    onMyList: false,
  },
  {
    id: '3',
    name: 'Solo Leveling S3',
    emoji: '🌙',
    genre: 'Action · Fantasy',
    platform: 'Prime Video',
    day: 'Wednesday',
    time: '8:00 AM',
    episode: 6,
    totalEpisodes: 12,
    isNew: true,
    subbed: true,
    dubbed: true,
    rating: 9.2,
    onMyList: true,
  },
  {
    id: '4',
    name: 'Gundam: Requiem',
    emoji: '🤖',
    genre: 'Mecha · Sci-fi',
    platform: 'Netflix',
    day: 'Wednesday',
    time: '3:00 PM',
    episode: 2,
    totalEpisodes: 12,
    isNew: true,
    subbed: true,
    dubbed: false,
    rating: 8.1,
    onMyList: false,
  },
  {
    id: '5',
    name: 'JJK Season 3',
    emoji: '🔥',
    genre: 'Action · Dark fantasy',
    platform: 'Crunchyroll',
    day: 'Thursday',
    time: '10:00 AM',
    episode: 9,
    totalEpisodes: 12,
    isNew: false,
    subbed: true,
    dubbed: true,
    rating: 8.9,
    onMyList: true,
  },
  {
    id: '6',
    name: 'Mushishi Returns',
    emoji: '🌿',
    genre: 'Mystery · Slice of life',
    platform: 'HiDive',
    day: 'Friday',
    time: '6:00 PM',
    episode: 4,
    totalEpisodes: 20,
    isNew: true,
    subbed: true,
    dubbed: false,
    rating: 9.5,
    onMyList: false,
  },
  {
    id: '7',
    name: 'One Piece',
    emoji: '⚡',
    genre: 'Adventure · Shonen',
    platform: 'Netflix',
    day: 'Saturday',
    time: '9:00 AM',
    episode: 1122,
    totalEpisodes: 0,
    isNew: true,
    subbed: true,
    dubbed: true,
    rating: 9.0,
    onMyList: false,
  },
  {
    id: '8',
    name: 'Demon Slayer S5',
    emoji: '⛩',
    genre: 'Action · Supernatural',
    platform: 'Crunchyroll',
    day: 'Sunday',
    time: '11:00 AM',
    episode: 8,
    totalEpisodes: 12,
    isNew: false,
    subbed: true,
    dubbed: true,
    rating: 9.1,
    onMyList: true,
  },
]

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

type FilterType = 'all' | 'subbed' | 'dubbed'
type ScheduleTab = 'mySchedule' | 'fullSchedule'

const toMinutes = (t: string) => {
  const [time, period] = t.split(' ')
  const [hours, minutes] = time.split(':').map(Number)
  return (period === 'PM' && hours !== 12 ? hours + 12 : hours) * 60 + minutes
}

function Schedule() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedDay, setSelectedDay] = useState('Wednesday')
  const [activeTab, setActiveTab] = useState<ScheduleTab>('fullSchedule')

  const user = localStorage.getItem('user') || sessionStorage.getItem('user')
  const isLoggedIn = !!user

  const baseShows = activeTab === 'mySchedule'
    ? schedule.filter((s) => s.onMyList)
    : schedule

  const filteredShows = baseShows.filter((show) => {
    if (filter === 'subbed') return show.subbed
    if (filter === 'dubbed') return show.dubbed
    return true
  })

  const showsForDay = filteredShows
    .filter((show) => show.day === selectedDay)
    .sort((a, b) => toMinutes(a.time) - toMinutes(b.time))

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

          {/* Sub / Dub filter */}
          <div className="flex gap-1 bg-[#1a1815] border border-white/7 rounded-xl p-1">
            {(['all', 'subbed', 'dubbed'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm cursor-pointer transition-all capitalize ${
                  filter === f ? 'text-white' : 'text-[#9a9590] hover:text-[#f0ede8]'
                }`}
                style={filter === f ? { backgroundColor: '#D13924' } : {}}
              >
                {f === 'all' ? 'All' : f === 'subbed' ? 'Sub' : 'Dub'}
              </button>
            ))}
          </div>
        </div>

        {/* My Schedule / Full Schedule tabs */}
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

        {/* Empty state for My Schedule */}
        {activeTab === 'mySchedule' && filteredShows.length === 0 && (
          <div className="text-center py-20 bg-[#1a1815] border border-white/7 rounded-xl mb-8">
            <p className="text-[#9a9590] text-sm mb-2">Nothing on your schedule this season</p>
            <p className="text-[#5a5650] text-[12px]">Add shows to your list and they'll appear here</p>
          </div>
        )}

        {/* Day selector */}
        {filteredShows.length > 0 && (
          <>
            <div className="grid grid-cols-7 gap-2 mb-8">
              {days.map((day) => {
                const hasNew = filteredShows.some((s) => s.day === day && s.isNew)
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

            {/* Timeline for selected day */}
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
                      <div className="text-center flex-shrink-0 w-16">
                        <div className="text-[12px] font-medium text-[#f0ede8]">{show.time}</div>
                        <div className="text-[10px] text-[#5a5650]">EST</div>
                      </div>
                      <div className="w-px h-10 bg-white/10 flex-shrink-0" />
                      <div className="text-2xl flex-shrink-0">{show.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[13px] font-medium text-[#f0ede8] truncate">{show.name}</span>
                          {show.isNew && (
                            <span className="text-[9px] text-[#D13924] bg-[#D13924]/10 px-1.5 py-0.5 rounded flex-shrink-0">New</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-[#9a9590]">{show.genre}</span>
                          <span className="text-[11px] text-[#5a5650]">·</span>
                          <span className="text-[11px] text-[#9a9590]">Ep {show.episode}</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        {show.subbed && (
                          <span className="text-[9px] text-[#1D9E75] bg-[#1D9E75]/10 border border-[#1D9E75]/25 px-2 py-0.5 rounded">SUB</span>
                        )}
                        {show.dubbed && (
                          <span className="text-[9px] text-[#7F77DD] bg-[#7F77DD]/10 border border-[#7F77DD]/25 px-2 py-0.5 rounded">DUB</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-[#D13924] bg-[#D13924]/10 px-2 py-0.5 rounded">{show.platform}</span>
                        <span className="text-[10px] text-[#9a9590]">♥ {show.rating}</span>
                      </div>
                      {isLoggedIn && (
                        <button
                          className="text-[11px] font-medium px-3 py-1.5 rounded-full flex-shrink-0 cursor-pointer hover:opacity-90 transition-all"
                          style={{ backgroundColor: show.onMyList ? 'rgba(196,98,45,0.2)' : '#D13924', color: show.onMyList ? '#D13924' : '#fff' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {show.onMyList ? '✓ On list' : '+ List'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
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

              <div className="grid grid-cols-4 gap-4">
                {filteredShows.map((show) => (
                  <div
                    key={show.id}
                    className={`bg-[#1a1815] border rounded-xl overflow-hidden cursor-pointer hover:border-[#D13924]/30 transition-all ${
                      show.onMyList ? 'border-[#D13924]/25' : 'border-white/7'
                    }`}
                  >
                    <div className="h-[80px] bg-[#0f0e0d] flex items-center justify-center text-3xl">
                      {show.emoji}
                    </div>
                    <div className="p-3">
                      <div className="text-[12px] font-medium text-[#f0ede8] truncate mb-1">{show.name}</div>
                      <div className="text-[10px] text-[#9a9590] truncate mb-2">{show.genre}</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-[#D13924] bg-[#D13924]/10 px-1.5 py-0.5 rounded truncate">{show.platform}</span>
                        <span className="text-[10px] text-[#9a9590]">{show.day}</span>
                      </div>
                      <div className="flex gap-1">
                        {show.subbed && (
                          <span className="text-[8px] text-[#1D9E75] bg-[#1D9E75]/10 border border-[#1D9E75]/25 px-1.5 py-0.5 rounded">SUB</span>
                        )}
                        {show.dubbed && (
                          <span className="text-[8px] text-[#7F77DD] bg-[#7F77DD]/10 border border-[#7F77DD]/25 px-1.5 py-0.5 rounded">DUB</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

export default Schedule