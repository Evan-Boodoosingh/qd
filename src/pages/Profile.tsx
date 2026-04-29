import { useState } from 'react'
import Nav from '../components/Nav/Nav'

type Show = {
  id: string
  name: string
  emoji: string
  genre: string
  platform: string
  currentEpisode: number
  totalEpisodes: number
}

type Discussion = {
  show: string
  threadTitle: string
  threadType: 'episode' | 'season' | 'show'
  replies: number
  timeAgo: string
}

type ProfileUser = {
  username: string
  displayName: string
  bio: string
  joinDate: string
  avatar: string
  stats: {
    showsWatched: number
    episodesWatched: number
    daysWatched: number
    discussionsStarted: number
    friends: number
  }
  currentlyWatching: Show[]
  favorites: Show[]
  recentDiscussions: Discussion[]
  compatibilityScore: number
}

const mockProfile: ProfileUser = {
  username: 'the_silly_king',
  displayName: 'Evan B.',
  bio: 'I cry at every Frieren episode and I am not ashamed. Action · Fantasy · Slice of life enthusiast.',
  joinDate: 'Spring 2026',
  avatar: 'EB',
  stats: {
    showsWatched: 147,
    episodesWatched: 3842,
    daysWatched: 67,
    discussionsStarted: 23,
    friends: 12,
  },
  currentlyWatching: [
    {
      id: '1',
      name: 'Solo Leveling S3',
      emoji: '🌙',
      genre: 'Action · Fantasy',
      platform: 'Prime Video',
      currentEpisode: 6,
      totalEpisodes: 12,
    },
    {
      id: '2',
      name: 'Demon Slayer S5',
      emoji: '⛩',
      genre: 'Action · Supernatural',
      platform: 'Crunchyroll',
      currentEpisode: 8,
      totalEpisodes: 12,
    },
    {
      id: '3',
      name: 'JJK Season 3',
      emoji: '🔥',
      genre: 'Action · Dark fantasy',
      platform: 'Crunchyroll',
      currentEpisode: 9,
      totalEpisodes: 12,
    },
  ],
  favorites: [
    {
      id: '4',
      name: 'Frieren',
      emoji: '🌸',
      genre: 'Fantasy · Slice of life',
      platform: 'Crunchyroll',
      currentEpisode: 28,
      totalEpisodes: 28,
    },
    {
      id: '5',
      name: 'Vinland Saga',
      emoji: '⚔️',
      genre: 'Historical · Drama',
      platform: 'Netflix',
      currentEpisode: 48,
      totalEpisodes: 48,
    },
    {
      id: '6',
      name: 'Mushishi',
      emoji: '🌿',
      genre: 'Mystery · Slice of life',
      platform: 'HiDive',
      currentEpisode: 26,
      totalEpisodes: 26,
    },
    {
      id: '7',
      name: 'Hunter x Hunter',
      emoji: '⚡',
      genre: 'Action · Adventure',
      platform: 'Netflix',
      currentEpisode: 148,
      totalEpisodes: 148,
    },
    {
      id: '8',
      name: 'Fullmetal Alchemist',
      emoji: '🔮',
      genre: 'Action · Fantasy',
      platform: 'Crunchyroll',
      currentEpisode: 64,
      totalEpisodes: 64,
    },
  ],
  recentDiscussions: [
    {
      show: 'Frieren S2',
      threadTitle: 'Why this show hits different at 2am',
      threadType: 'show',
      replies: 47,
      timeAgo: '2h ago',
    },
    {
      show: 'Solo Leveling S3',
      threadTitle: 'Ep 6 reaction thread',
      threadType: 'episode',
      replies: 23,
      timeAgo: '5h ago',
    },
    {
      show: 'Demon Slayer S5',
      threadTitle: 'Is this the best season yet?',
      threadType: 'season',
      replies: 89,
      timeAgo: '1d ago',
    },
  ],
  compatibilityScore: 84,
}

function Profile() {
  const [activeTab, setActiveTab] = useState<'watching' | 'favorites' | 'discussions'>('watching')

  const user = localStorage.getItem('user') || sessionStorage.getItem('user')
  const loggedInUser = user ? JSON.parse(user) : null
  const isOwnProfile = loggedInUser?.username === mockProfile.username

  return (
    <div className="bg-[#0f0e0d] min-h-screen text-white">
      <Nav />

      <div className="px-6 py-8 max-w-5xl mx-auto">

        {/* Profile Header */}
        <div className="bg-[#1a1815] border border-white/7 rounded-2xl p-8 mb-6">
          <div className="flex items-start gap-6">

            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-semibold flex-shrink-0"
              style={{ backgroundColor: '#D13924', color: '#fff' }}
            >
              {mockProfile.avatar}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-medium text-[#f0ede8]">{mockProfile.displayName}</h1>
                <span className="text-[13px] text-[#9a9590]">@{mockProfile.username}</span>
              </div>
              <p className="text-[13px] text-[#c8c4be] mb-3 leading-relaxed">{mockProfile.bio}</p>
              <span className="text-[11px] text-[#5a5650]">Member since {mockProfile.joinDate}</span>
            </div>

            {/* Action button or compatibility */}
            <div className="flex-shrink-0">
              {isOwnProfile ? (
                <button
                  className="text-[13px] text-[#f0ede8] border border-white/10 px-4 py-2 rounded-full hover:bg-white/5 cursor-pointer transition-all"
                >
                  Edit profile
                </button>
              ) : (
                <div className="text-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold mb-1 mx-auto"
                    style={{ backgroundColor: '#D13924', color: '#fff' }}
                  >
                    {mockProfile.compatibilityScore}%
                  </div>
                  <span className="text-[10px] text-[#9a9590]">compatible</span>
                  <div className="mt-2">
                    <button
                      className="text-[12px] text-white px-4 py-1.5 rounded-full cursor-pointer hover:opacity-90 transition-all"
                      style={{ backgroundColor: '#D13924' }}
                    >
                      + Add friend
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-5 gap-4 mt-6 pt-6 border-t border-white/5">
            <div className="text-center">
              <div className="text-lg font-medium text-[#f0ede8]">{mockProfile.stats.showsWatched}</div>
              <div className="text-[10px] text-[#9a9590] mt-0.5">Shows watched</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-[#f0ede8]">{mockProfile.stats.episodesWatched.toLocaleString()}</div>
              <div className="text-[10px] text-[#9a9590] mt-0.5">Episodes watched</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-[#f0ede8]">{mockProfile.stats.daysWatched}</div>
              <div className="text-[10px] text-[#9a9590] mt-0.5">Days watched</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-[#f0ede8]">{mockProfile.stats.discussionsStarted}</div>
              <div className="text-[10px] text-[#9a9590] mt-0.5">Discussions</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium text-[#f0ede8]">{mockProfile.stats.friends}</div>
              <div className="text-[10px] text-[#9a9590] mt-0.5">Friends</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#1a1815] border border-white/7 rounded-xl p-1 mb-6 w-fit">
          {[
            { label: 'Watching', value: 'watching' },
            { label: 'Favorites', value: 'favorites' },
            { label: 'Discussions', value: 'discussions' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as 'watching' | 'favorites' | 'discussions')}
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

        {/* Watching tab */}
        {activeTab === 'watching' && (
          <div className="grid grid-cols-3 gap-4">
            {mockProfile.currentlyWatching.map((show) => (
              <div
                key={show.id}
                className="bg-[#1a1815] border border-white/7 rounded-xl overflow-hidden hover:border-[#D13924]/30 transition-all cursor-pointer"
              >
                <div className="h-[90px] bg-[#0f0e0d] flex items-center justify-center text-4xl">
                  {show.emoji}
                </div>
                <div className="p-4">
                  <div className="text-[13px] font-medium text-[#f0ede8] mb-1 truncate">{show.name}</div>
                  <div className="text-[11px] text-[#9a9590] mb-3">{show.genre}</div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-[#9a9590]">Episode progress</span>
                    <span className="text-[10px] text-[#f0ede8]">{show.currentEpisode} / {show.totalEpisodes}</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(show.currentEpisode / show.totalEpisodes) * 100}%`,
                        backgroundColor: '#D13924'
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-[#D13924] bg-[#D13924]/10 px-2 py-0.5 rounded">
                    {show.platform}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Favorites tab */}
        {activeTab === 'favorites' && (
          <div className="grid grid-cols-5 gap-4">
            {mockProfile.favorites.map((show, index) => (
              <div
                key={show.id}
                className="bg-[#1a1815] border border-white/7 rounded-xl overflow-hidden hover:border-[#D13924]/30 transition-all cursor-pointer"
              >
                <div className="relative h-[90px] bg-[#0f0e0d] flex items-center justify-center text-3xl">
                  {show.emoji}
                  <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[#D13924] flex items-center justify-center">
                    <span className="text-[9px] font-semibold text-white">#{index + 1}</span>
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-[11px] font-medium text-[#f0ede8] truncate mb-1">{show.name}</div>
                  <div className="text-[9px] text-[#9a9590] truncate">{show.genre}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Discussions tab */}
        {activeTab === 'discussions' && (
          <div className="flex flex-col gap-3">
            {mockProfile.recentDiscussions.map((disc, i) => (
              <div
                key={i}
                className="bg-[#1a1815] border border-white/7 rounded-xl p-4 cursor-pointer hover:border-[#D13924]/30 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-[11px] text-[#9a9590]">Thread about</div>
                    <div className="text-[13px] text-[#D13924] font-medium">{disc.show} — {disc.threadTitle}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
                      disc.threadType === 'episode'
                        ? 'bg-[#D13924]/10 text-[#D13924] border-[#D13924]/25'
                        : disc.threadType === 'season'
                        ? 'bg-[#7F77DD]/10 text-[#7F77DD] border-[#7F77DD]/25'
                        : 'bg-white/5 text-[#9a9590] border-white/10'
                    }`}>
                      {disc.threadType === 'episode' ? 'Episode' : disc.threadType === 'season' ? 'Season' : 'Show'}
                    </span>
                    <span className="text-[10px] text-[#5a5650]">{disc.timeAgo}</span>
                  </div>
                </div>
                <div className="text-[11px] text-[#9a9590]">
                  <span className="text-[#D13924]">{disc.replies}</span> replies
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default Profile