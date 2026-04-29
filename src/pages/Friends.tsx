import { useState } from 'react'
import Nav from '../components/Nav/Nav'

type Show = {
  name: string
  emoji: string
}

type Friend = {
  id: string
  username: string
  displayName: string
  avatar: string
  color: string
  compatibilityScore: number
  currentlyWatching: Show[]
  sharedShows: Show[]
  isOnline: boolean
}

type FriendRequest = {
  id: string
  username: string
  displayName: string
  avatar: string
  color: string
  mutualFriends: number
  timeAgo: string
}

type SuggestedFriend = {
  id: string
  username: string
  displayName: string
  avatar: string
  color: string
  compatibilityScore: number
  sharedShows: Show[]
}

const mockFriends: Friend[] = [
  {
    id: '1',
    username: 'jordan_r',
    displayName: 'Jordan R.',
    avatar: 'JR',
    color: '#c4622d',
    compatibilityScore: 91,
    isOnline: true,
    currentlyWatching: [
      { name: 'Solo Leveling S3', emoji: '🌙' },
      { name: 'Vinland Saga S3', emoji: '⚔️' },
      { name: 'Frieren S2', emoji: '🌸' },
    ],
    sharedShows: [
      { name: 'Solo Leveling S3', emoji: '🌙' },
      { name: 'Frieren S2', emoji: '🌸' },
    ],
  },
  {
    id: '2',
    username: 'mia_k',
    displayName: 'Mia K.',
    avatar: 'MK',
    color: '#1D9E75',
    compatibilityScore: 78,
    isOnline: true,
    currentlyWatching: [
      { name: 'Mushishi Returns', emoji: '🌿' },
      { name: 'Demon Slayer S5', emoji: '⛩' },
    ],
    sharedShows: [
      { name: 'Demon Slayer S5', emoji: '⛩' },
    ],
  },
  {
    id: '3',
    username: 'dev_t',
    displayName: 'Dev T.',
    avatar: 'DT',
    color: '#7F77DD',
    compatibilityScore: 65,
    isOnline: false,
    currentlyWatching: [
      { name: 'JJK Season 3', emoji: '🔥' },
      { name: 'Gundam: Requiem', emoji: '🤖' },
      { name: 'One Piece', emoji: '⚡' },
    ],
    sharedShows: [],
  },
  {
    id: '4',
    username: 'alex_l',
    displayName: 'Alex L.',
    avatar: 'AL',
    color: '#dcb43c',
    compatibilityScore: 84,
    isOnline: true,
    currentlyWatching: [
      { name: 'Frieren S2', emoji: '🌸' },
      { name: 'Vinland Saga S3', emoji: '⚔️' },
    ],
    sharedShows: [
      { name: 'Frieren S2', emoji: '🌸' },
    ],
  },
]

const mockRequests: FriendRequest[] = [
  {
    id: '1',
    username: 'sakura_fan',
    displayName: 'Sakura Fan',
    avatar: 'SF',
    color: '#D13924',
    mutualFriends: 3,
    timeAgo: '2h ago',
  },
  {
    id: '2',
    username: 'anime_lord',
    displayName: 'Anime Lord',
    avatar: 'AL',
    color: '#4A90D9',
    mutualFriends: 1,
    timeAgo: '1d ago',
  },
]

const mockSuggested: SuggestedFriend[] = [
  {
    id: '1',
    username: 'frieren_fan',
    displayName: 'Frieren Fan',
    avatar: 'FF',
    color: '#9B59B6',
    compatibilityScore: 88,
    sharedShows: [
      { name: 'Frieren S2', emoji: '🌸' },
      { name: 'Mushishi', emoji: '🌿' },
      { name: 'Vinland Saga', emoji: '⚔️' },
    ],
  },
  {
    id: '2',
    username: 'shonen_king',
    displayName: 'Shonen King',
    avatar: 'SK',
    color: '#E67E22',
    compatibilityScore: 72,
    sharedShows: [
      { name: 'Solo Leveling S3', emoji: '🌙' },
      { name: 'JJK Season 3', emoji: '🔥' },
    ],
  },
  {
    id: '3',
    username: 'slice_queen',
    displayName: 'Slice Queen',
    avatar: 'SQ',
    color: '#1ABC9C',
    compatibilityScore: 79,
    sharedShows: [
      { name: 'Frieren S2', emoji: '🌸' },
      { name: 'Mushishi Returns', emoji: '🌿' },
      { name: 'Vinland Saga S3', emoji: '⚔️' },
    ],
  },
]

function Friends() {
  const [requests, setRequests] = useState(mockRequests)
  const [suggested, setSuggested] = useState(mockSuggested)

  const watchingTogether = mockFriends.filter((f) => f.sharedShows.length > 0)

  return (
    <div className="bg-[#0f0e0d] min-h-screen text-white">
      <Nav />

      <div className="px-6 py-8 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-medium text-[#f0ede8] mb-1">Friends</h1>
          <p className="text-[13px] text-[#9a9590]">Your nakama — the people you watch with</p>
        </div>

        {/* Watching Together */}
        {watchingTogether.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-medium text-[#f0ede8]">Watching together this season</h2>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {watchingTogether.map((friend) => (
                <div
                  key={friend.id}
                  className="bg-[#1a1815] border border-[#D13924]/25 rounded-xl p-4 cursor-pointer hover:border-[#D13924]/50 transition-all"
                  onClick={() => window.location.href = `/profile/${friend.username}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                        style={{ backgroundColor: `${friend.color}35`, color: friend.color }}
                      >
                        {friend.avatar}
                      </div>
                      {friend.isOnline && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#1D9E75] border-2 border-[#1a1815]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-medium text-[#f0ede8]">{friend.displayName}</div>
                      <div className="text-[11px] text-[#9a9590]">@{friend.username}</div>
                    </div>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold"
                      style={{ backgroundColor: '#D13924', color: '#fff' }}
                    >
                      {friend.compatibilityScore}%
                    </div>
                  </div>

                  {/* Shared shows */}
                  <div className="flex gap-2 mb-3">
                    {friend.sharedShows.map((show) => (
                      <div
                        key={show.name}
                        className="flex-1 bg-[#D13924]/09 border border-[#D13924]/25 rounded-lg p-2 text-center"
                      >
                        <div className="text-lg mb-1">{show.emoji}</div>
                        <div className="text-[8px] text-[#c8c4be] line-clamp-2">{show.name}</div>
                      </div>
                    ))}
                  </div>

                  <button
                    className="w-full text-[11px] font-medium py-2 rounded-lg cursor-pointer hover:opacity-90 transition-all"
                    style={{ backgroundColor: '#D13924', color: '#fff' }}
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    Start a thread ›
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friend Requests */}
        {requests.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-medium text-[#f0ede8]">Friend requests</h2>
              <span className="text-[10px] text-[#D13924] bg-[#D13924]/10 px-2 py-0.5 rounded-full border border-[#D13924]/25">
                {requests.length}
              </span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="flex flex-col gap-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-[#1a1815] border border-white/7 rounded-xl p-4 flex items-center gap-4"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                    style={{ backgroundColor: `${req.color}35`, color: req.color }}
                  >
                    {req.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-[#f0ede8]">{req.displayName}</div>
                    <div className="text-[11px] text-[#9a9590]">@{req.username} · {req.mutualFriends} mutual friends · {req.timeAgo}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRequests(requests.filter((r) => r.id !== req.id))}
                      className="text-[12px] text-white px-4 py-1.5 rounded-full cursor-pointer hover:opacity-90 transition-all"
                      style={{ backgroundColor: '#D13924' }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => setRequests(requests.filter((r) => r.id !== req.id))}
                      className="text-[12px] text-[#9a9590] px-4 py-1.5 rounded-full cursor-pointer border border-white/10 hover:bg-white/5 transition-all"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Friends */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-medium text-[#f0ede8]">Your friends</h2>
            <span className="text-[11px] text-[#9a9590]">{mockFriends.length} total</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="flex flex-col gap-3">
            {mockFriends.map((friend) => (
              <div
                key={friend.id}
                className="bg-[#1a1815] border border-white/7 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-[#D13924]/30 transition-all"
                onClick={() => window.location.href = `/profile/${friend.username}`}
              >
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                    style={{ backgroundColor: `${friend.color}35`, color: friend.color }}
                  >
                    {friend.avatar}
                  </div>
                  {friend.isOnline && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#1D9E75] border-2 border-[#1a1815]" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-medium text-[#f0ede8]">{friend.displayName}</div>
                  <div className="text-[11px] text-[#9a9590] mt-0.5">
                    {friend.currentlyWatching.map(s => s.emoji).join(' ')} watching {friend.currentlyWatching.length} shows
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{ backgroundColor: '#D13924', color: '#fff' }}
                  >
                    {friend.compatibilityScore}%
                  </div>
                  <span className="text-[11px] text-[#D13924]">View profile ›</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Friends */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-medium text-[#f0ede8]">People you might know</h2>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {suggested.map((person) => (
              <div
                key={person.id}
                className="bg-[#1a1815] border border-white/7 rounded-xl p-4 hover:border-[#D13924]/30 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                    style={{ backgroundColor: `${person.color}35`, color: person.color }}
                  >
                    {person.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[#f0ede8] truncate">{person.displayName}</div>
                    <div className="text-[11px] text-[#9a9590]">@{person.username}</div>
                  </div>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{ backgroundColor: '#D13924', color: '#fff' }}
                  >
                    {person.compatibilityScore}%
                  </div>
                </div>

                <div className="flex gap-1.5 mb-3">
                  {person.sharedShows.map((show) => (
                    <div
                      key={show.name}
                      className="flex-1 bg-[#0f0e0d] border border-white/7 rounded-lg p-1.5 text-center"
                    >
                      <div className="text-base">{show.emoji}</div>
                      <div className="text-[7px] text-[#9a9590] truncate mt-0.5">{show.name}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setSuggested(suggested.filter((s) => s.id !== person.id))}
                  className="w-full text-[11px] font-medium py-2 rounded-full cursor-pointer hover:opacity-90 transition-all"
                  style={{ backgroundColor: '#D13924', color: '#fff' }}
                >
                  + Add friend
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Friends