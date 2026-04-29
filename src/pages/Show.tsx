import { useState } from 'react'
import Nav from '../components/Nav/Nav'

type WatchStatus = 'watching' | 'completed' | 'planToWatch' | 'dropped' | null

type Friend = {
  initials: string
  color: string
  username: string
  currentEpisode: number
}

type Episode = {
  number: number
  title: string
  airDate: string
  hasThread: boolean
}

type Discussion = {
  id: string
  threadTitle: string
  threadType: 'episode' | 'season' | 'show'
  season?: number
  episode?: number
  replies: number
  likes: number
  timeAgo: string
  hasSpoiler: boolean
}

const mockShow = {
  id: '1',
  name: 'Solo Leveling',
  currentSeason: 3,
  emoji: '🌙',
  studio: 'A-1 Pictures',
  platform: 'Prime Video',
  subbed: true,
  dubbed: true,
  totalSeasons: 3,
  episodesThisSeason: 12,
  totalEpisodes: 36,
  airing: 'Wednesdays at 8:00 AM EST',
  genre: ['Action', 'Fantasy', 'Isekai'],
  rating: 9.2,
  communityRating: 9.4,
  synopsis: 'After being the weakest hunter alive for years, Sung Jin-Woo discovers a mysterious system that allows him to level up his abilities without limit. Now in his third season, he faces threats that transcend human understanding as the world\'s most powerful hunters look to him as their last hope against an incoming catastrophe.',
  trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  nakama: [
    { initials: 'JR', color: '#c4622d', username: 'jordan_r', currentEpisode: 6 },
    { initials: 'MK', color: '#1D9E75', username: 'mia_k', currentEpisode: 4 },
    { initials: 'AL', color: '#dcb43c', username: 'alex_l', currentEpisode: 6 },
  ] as Friend[],
  episodes: [
    { number: 1, title: 'The Reawakening', airDate: 'Mar 5, 2026', hasThread: true },
    { number: 2, title: 'The New World', airDate: 'Mar 12, 2026', hasThread: true },
    { number: 3, title: 'Limits', airDate: 'Mar 19, 2026', hasThread: true },
    { number: 4, title: 'The Shadow Monarch', airDate: 'Mar 26, 2026', hasThread: true },
    { number: 5, title: 'Arise', airDate: 'Apr 2, 2026', hasThread: true },
    { number: 6, title: 'The Collapse', airDate: 'Apr 9, 2026', hasThread: true },
    { number: 7, title: 'Beyond the Gate', airDate: 'Apr 16, 2026', hasThread: false },
    { number: 8, title: 'TBA', airDate: 'Apr 23, 2026', hasThread: false },
    { number: 9, title: 'TBA', airDate: 'Apr 30, 2026', hasThread: false },
    { number: 10, title: 'TBA', airDate: 'May 7, 2026', hasThread: false },
    { number: 11, title: 'TBA', airDate: 'May 14, 2026', hasThread: false },
    { number: 12, title: 'TBA', airDate: 'May 21, 2026', hasThread: false },
  ] as Episode[],
  discussions: [
    {
      id: '1',
      threadTitle: 'Ep 6 had the best animation of the entire season',
      threadType: 'episode' as const,
      season: 3,
      episode: 6,
      replies: 1203,
      likes: 5800,
      timeAgo: '4h ago',
      hasSpoiler: true,
    },
    {
      id: '2',
      threadTitle: 'Season 3 power scaling is getting insane',
      threadType: 'season' as const,
      season: 3,
      replies: 847,
      likes: 3200,
      timeAgo: '8h ago',
      hasSpoiler: false,
    },
    {
      id: '3',
      threadTitle: 'Why Solo Leveling changed the isekai genre forever',
      threadType: 'show' as const,
      replies: 634,
      likes: 2900,
      timeAgo: '1d ago',
      hasSpoiler: false,
    },
  ] as Discussion[],
  related: [
    { name: 'Mushishi Returns', emoji: '🌿', genre: 'Mystery · Slice of life', rating: 9.5 },
    { name: 'Vinland Saga S3', emoji: '⚔️', genre: 'Historical · Drama', rating: 9.4 },
    { name: 'JJK Season 3', emoji: '🔥', genre: 'Action · Dark fantasy', rating: 8.9 },
    { name: 'Frieren S2', emoji: '🌸', genre: 'Fantasy · Slice of life', rating: 9.6 },
  ],
}

function Show() {
  const [watchStatus, setWatchStatus] = useState<WatchStatus>('watching')
  const [currentEpisode, setCurrentEpisode] = useState(6)
  const [showTrailer, setShowTrailer] = useState(false)

  const user = localStorage.getItem('user') || sessionStorage.getItem('user')
  const isLoggedIn = !!user

  return (
    <div className="bg-[#0f0e0d] min-h-screen text-white">
      <Nav />

      {/* Hero */}
      <div className="relative h-[240px] overflow-hidden bg-[#1a1815]">
        <div className="absolute inset-0 flex items-center justify-center text-[160px] opacity-[0.07] select-none">
          {mockShow.emoji}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e0d] via-[#0f0e0d]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0e0d] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-6xl mx-auto px-8 pb-6">
          <div className="flex items-center gap-2 mb-2">
            {mockShow.genre.map((g) => (
              <span key={g} className="text-[10px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/25 px-2 py-0.5 rounded-full">
                {g}
              </span>
            ))}
          </div>
          <h1 className="text-3xl font-medium text-[#f0ede8] mb-1">{mockShow.name}</h1>
          <p className="text-[12px] text-[#9a9590]">Season {mockShow.currentSeason} · {mockShow.studio} · {mockShow.airing}</p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="flex gap-6 items-start">

          {/* Left column */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* Action bar */}
            <div className="bg-[#1a1815] border border-white/7 rounded-xl p-4 flex items-center gap-3 flex-wrap">
              {isLoggedIn ? (
                <>
                  <div className="flex gap-1 bg-[#0f0e0d] border border-white/7 rounded-lg p-1">
                    {(['watching', 'planToWatch', 'completed', 'dropped'] as WatchStatus[]).map((s) => (
                      <button
                        key={s!}
                        onClick={() => setWatchStatus(s)}
                        className={`px-3 py-1.5 rounded-md text-[11px] cursor-pointer transition-all whitespace-nowrap ${
                          watchStatus === s ? 'text-white' : 'text-[#9a9590] hover:text-[#f0ede8]'
                        }`}
                        style={watchStatus === s ? { backgroundColor: '#D13924' } : {}}
                      >
                        {s === 'watching' ? 'Watching' : s === 'planToWatch' ? 'Plan to Watch' : s === 'completed' ? 'Completed' : 'Dropped'}
                      </button>
                    ))}
                  </div>

                  {watchStatus === 'watching' && (
                    <div className="flex items-center gap-2 bg-[#0f0e0d] border border-white/7 rounded-lg px-3 py-2">
                      <button
                        onClick={() => setCurrentEpisode(Math.max(1, currentEpisode - 1))}
                        className="text-[#9a9590] hover:text-[#f0ede8] cursor-pointer w-4 text-center"
                      >−</button>
                      <span className="text-[12px] text-[#f0ede8] w-20 text-center">
                        Ep {currentEpisode} / {mockShow.episodesThisSeason}
                      </span>
                      <button
                        onClick={() => setCurrentEpisode(Math.min(mockShow.episodesThisSeason, currentEpisode + 1))}
                        className="text-[#9a9590] hover:text-[#f0ede8] cursor-pointer w-4 text-center"
                      >+</button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => window.location.href = '/register'}
                  className="text-white text-sm font-medium px-5 py-2 rounded-full cursor-pointer hover:opacity-90 transition-all"
                  style={{ backgroundColor: '#D13924' }}
                >
                  Sign up to track this show
                </button>
              )}

              <button
                onClick={() => setShowTrailer(!showTrailer)}
                className="text-[12px] text-[#f0ede8] border border-white/10 px-4 py-2 rounded-full cursor-pointer hover:bg-white/5 transition-all ml-auto"
              >
                {showTrailer ? 'Hide trailer' : '▶ Watch trailer'}
              </button>
            </div>

            {/* Trailer */}
            {showTrailer && (
              <div className="rounded-xl overflow-hidden border border-white/7 aspect-video w-full">
                <iframe
                  src={mockShow.trailerUrl}
                  className="w-full h-full"
                  allowFullScreen
                  title={`${mockShow.name} trailer`}
                />
              </div>
            )}

            {/* Synopsis */}
            <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
              <h2 className="text-[13px] font-medium text-[#f0ede8] mb-3">Synopsis</h2>
              <p className="text-[13px] text-[#c8c4be] leading-relaxed">{mockShow.synopsis}</p>
            </div>

            {/* Episodes */}
            <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
              <h2 className="text-[13px] font-medium text-[#f0ede8] mb-4">Season {mockShow.currentSeason} — Episodes</h2>
              <div className="flex flex-col gap-2">
                {mockShow.episodes.map((ep) => {
                  const watched = watchStatus === 'watching' && currentEpisode >= ep.number
                  return (
                    <div
                      key={ep.number}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        watched ? 'border-[#D13924]/20 bg-[#D13924]/05' : 'border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0"
                        style={{
                          backgroundColor: watched ? '#D13924' : 'rgba(255,255,255,0.08)',
                          color: watched ? '#fff' : '#9a9590',
                        }}
                      >
                        {ep.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] text-[#f0ede8] truncate">{ep.title}</div>
                        <div className="text-[10px] text-[#5a5650] mt-0.5">{ep.airDate}</div>
                      </div>
                      {ep.hasThread && (
                        <span className="text-[9px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/25 px-2 py-1 rounded cursor-pointer hover:bg-[#D13924]/20 flex-shrink-0">
                          View thread
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Discussions */}
            <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
              <h2 className="text-[13px] font-medium text-[#f0ede8] mb-4">Community discussions</h2>
              <div className="flex flex-col gap-3">
                {mockShow.discussions.map((disc) => (
                  <div
                    key={disc.id}
                    className="border border-white/5 rounded-xl p-4 cursor-pointer hover:border-[#D13924]/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-[#9a9590] mb-1">
                          {disc.threadType === 'episode' && `S${disc.season} Ep ${disc.episode}`}
                          {disc.threadType === 'season' && `Season ${disc.season}`}
                          {disc.threadType === 'show' && 'General discussion'}
                        </div>
                        <div className="text-[13px] font-medium text-[#f0ede8]">{disc.threadTitle}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {disc.hasSpoiler && (
                          <span className="text-[9px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/25 px-2 py-0.5 rounded-full">⚠ Spoiler</span>
                        )}
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-[11px] text-[#9a9590]"><span className="text-[#D13924]">{disc.replies.toLocaleString()}</span> replies</span>
                        <span className="text-[11px] text-[#9a9590]"><span className="text-[#D13924]">{disc.likes.toLocaleString()}</span> likes</span>
                      </div>
                      {isLoggedIn ? (
                        <button className="text-[11px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/25 rounded-md px-3 py-1.5 hover:bg-[#D13924]/20 cursor-pointer">
                          Join thread ›
                        </button>
                      ) : (
                        <button
                          onClick={() => window.location.href = '/register'}
                          className="text-[11px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/25 rounded-md px-3 py-1.5 hover:bg-[#D13924]/20 cursor-pointer"
                        >
                          Sign up to reply ›
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right sidebar */}
          <div className="w-[260px] flex-shrink-0 flex flex-col gap-4">

            {/* Details */}
            <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
              <h2 className="text-[13px] font-medium text-[#f0ede8] mb-4">Details</h2>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Studio', value: mockShow.studio, orange: false },
                  { label: 'Platform', value: mockShow.platform, orange: true },
                  { label: 'Seasons', value: String(mockShow.totalSeasons), orange: false },
                  { label: 'Episodes', value: `${mockShow.totalEpisodes} total`, orange: false },
                  { label: 'Airs', value: 'Wednesdays', orange: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-[11px] text-[#9a9590]">{item.label}</span>
                    <span className={`text-[11px] ${item.orange ? 'text-[#D13924]' : 'text-[#f0ede8]'}`}>{item.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#9a9590]">Available</span>
                  <div className="flex gap-1">
                    {mockShow.subbed && <span className="text-[9px] text-[#1D9E75] bg-[#1D9E75]/10 border border-[#1D9E75]/25 px-2 py-0.5 rounded">SUB</span>}
                    {mockShow.dubbed && <span className="text-[9px] text-[#7F77DD] bg-[#7F77DD]/10 border border-[#7F77DD]/25 px-2 py-0.5 rounded">DUB</span>}
                  </div>
                </div>
                <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#9a9590]">MAL rating</span>
                    <span className="text-[11px] text-[#f0ede8]">♥ {mockShow.rating}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#9a9590]">Queued rating</span>
                    <span className="text-[11px] text-[#D13924]">♥ {mockShow.communityRating}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Nakama — logged in only */}
            {isLoggedIn && mockShow.nakama.length > 0 && (
              <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
                <h2 className="text-[13px] font-medium text-[#f0ede8] mb-4">Your nakama watching this</h2>
                <div className="flex flex-col gap-3">
                  {mockShow.nakama.map((friend) => (
                    <div
                      key={friend.username}
                      className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-all"
                      onClick={() => window.location.href = `/profile/${friend.username}`}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                        style={{ backgroundColor: `${friend.color}35`, color: friend.color }}
                      >
                        {friend.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] text-[#f0ede8] truncate">@{friend.username}</div>
                        <div className="text-[10px] text-[#9a9590]">On episode {friend.currentEpisode}</div>
                      </div>
                      {friend.currentEpisode === currentEpisode && (
                        <span className="text-[9px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/25 px-2 py-0.5 rounded-full flex-shrink-0">
                          Same ep
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  className="w-full mt-4 text-[11px] font-medium py-2 rounded-full cursor-pointer hover:opacity-90 transition-all"
                  style={{ backgroundColor: '#D13924', color: '#fff' }}
                >
                  Start a thread with nakama
                </button>
              </div>
            )}

            {/* You might also like */}
            <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
              <h2 className="text-[13px] font-medium text-[#f0ede8] mb-4">You might also like</h2>
              <div className="flex flex-col gap-3">
                {mockShow.related.map((show) => (
                  <div
                    key={show.name}
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-all"
                  >
                    <div className="w-9 h-9 bg-[#0f0e0d] rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                      {show.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-[#f0ede8] truncate">{show.name}</div>
                      <div className="text-[10px] text-[#9a9590] truncate">{show.genre}</div>
                    </div>
                    <span className="text-[10px] text-[#9a9590] flex-shrink-0">♥ {show.rating}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Show