import { useState } from 'react'
import Nav from '../components/Nav/Nav'

type WatchStatus = 'watching' | 'planToWatch' | 'completed' | 'dropped'

type Show = {
  id: string
  name: string
  emoji: string
  genre: string
  platform: string
  status: WatchStatus
  currentEpisode: number
  totalEpisodes: number
  rating: number | null
  season: string
  year: number
}

const mockShows: Show[] = [
  {
    id: '1',
    name: 'Solo Leveling S3',
    emoji: '🌙',
    genre: 'Action · Fantasy',
    platform: 'Prime Video',
    status: 'watching',
    currentEpisode: 6,
    totalEpisodes: 12,
    rating: null,
    season: 'Spring',
    year: 2026,
  },
  {
    id: '2',
    name: 'Demon Slayer S5',
    emoji: '⛩',
    genre: 'Action · Supernatural',
    platform: 'Crunchyroll',
    status: 'watching',
    currentEpisode: 8,
    totalEpisodes: 12,
    rating: null,
    season: 'Spring',
    year: 2026,
  },
  {
    id: '3',
    name: 'Frieren S2',
    emoji: '🌸',
    genre: 'Fantasy · Slice of life',
    platform: 'Crunchyroll',
    status: 'planToWatch',
    currentEpisode: 0,
    totalEpisodes: 24,
    rating: null,
    season: 'Spring',
    year: 2026,
  },
  {
    id: '4',
    name: 'Vinland Saga S1',
    emoji: '⚔️',
    genre: 'Historical · Drama',
    platform: 'Netflix',
    status: 'completed',
    currentEpisode: 24,
    totalEpisodes: 24,
    rating: 9,
    season: 'Fall',
    year: 2025,
  },
  {
    id: '5',
    name: 'JJK Season 3',
    emoji: '🔥',
    genre: 'Action · Dark fantasy',
    platform: 'Crunchyroll',
    status: 'watching',
    currentEpisode: 9,
    totalEpisodes: 12,
    rating: null,
    season: 'Spring',
    year: 2026,
  },
  {
    id: '6',
    name: 'Sword Art Online',
    emoji: '⚡',
    genre: 'Action · Isekai',
    platform: 'Netflix',
    status: 'dropped',
    currentEpisode: 7,
    totalEpisodes: 25,
    rating: 5,
    season: 'Winter',
    year: 2025,
  },
]

const tabs: { label: string; value: WatchStatus }[] = [
  { label: 'Watching', value: 'watching' },
  { label: 'Plan to Watch', value: 'planToWatch' },
  { label: 'Completed', value: 'completed' },
  { label: 'Dropped', value: 'dropped' },
]

function MyList() {
  const [activeTab, setActiveTab] = useState<WatchStatus>('watching')

  const filteredShows = mockShows.filter((show) => show.status === activeTab)

  const groupedBySeasonYear = filteredShows.reduce<Record<string, Show[]>>((acc, show) => {
    const key = `${show.season} ${show.year}`
    if (!acc[key]) acc[key] = []
    acc[key].push(show)
    return acc
  }, {})

  return (
    <div className="bg-[#0f0e0d] min-h-screen text-white">
      <Nav />

      <div className="px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-medium text-[#f0ede8] mb-1">My List</h1>
          <p className="text-[13px] text-[#9a9590]">Everything you're watching, completed, and queued up</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#1a1815] border border-white/7 rounded-xl p-1 mb-8 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-5 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                activeTab === tab.value
                  ? 'text-white'
                  : 'text-[#9a9590] hover:text-[#f0ede8]'
              }`}
              style={activeTab === tab.value ? { backgroundColor: '#D13924' } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filteredShows.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#9a9590] text-sm mb-2">Nothing here yet</p>
            <p className="text-[#5a5650] text-[12px]">Browse the schedule and add shows to your list</p>
          </div>
        )}

        {/* Shows grouped by season and year */}
        {Object.entries(groupedBySeasonYear).map(([seasonYear, shows]) => (
          <div key={seasonYear} className="mb-10">

            {/* Season label */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[13px] font-medium text-[#f0ede8]">{seasonYear}</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* Show cards */}
            <div className="grid grid-cols-3 gap-4">
              {shows.map((show) => (
                <div
                  key={show.id}
                  className="bg-[#1a1815] border border-white/7 rounded-xl overflow-hidden hover:border-[#D13924]/30 transition-all cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="h-[100px] bg-[#0f0e0d] flex items-center justify-center text-4xl">
                    {show.emoji}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="text-[13px] font-medium text-[#f0ede8] mb-1 truncate">{show.name}</div>
                    <div className="text-[11px] text-[#9a9590] mb-3">{show.genre}</div>

                    {/* Episode progress */}
                    {(show.status === 'watching' || show.status === 'completed') && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] text-[#9a9590]">Episode progress</span>
                          <span className="text-[10px] text-[#f0ede8]">{show.currentEpisode} / {show.totalEpisodes}</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(show.currentEpisode / show.totalEpisodes) * 100}%`,
                              backgroundColor: '#D13924'
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Rating — only for completed and dropped */}
                    {(show.status === 'completed' || show.status === 'dropped') && (
                      <div className="flex items-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                          <div
                            key={star}
                            className="w-4 h-1.5 rounded-full cursor-pointer transition-all"
                            style={{
                              backgroundColor: show.rating && star <= show.rating ? '#D13924' : 'rgba(255,255,255,0.1)'
                            }}
                          />
                        ))}
                        <span className="text-[10px] text-[#9a9590] ml-1">{show.rating ? `${show.rating}/10` : 'Rate it'}</span>
                      </div>
                    )}

                    {/* Platform */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#D13924] bg-[#D13924]/10 px-2 py-0.5 rounded">
                        {show.platform}
                      </span>
                      {show.status === 'watching' && (
                        <span className="text-[10px] text-[#9a9590]">
                          {show.totalEpisodes - show.currentEpisode} ep left
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}

export default MyList