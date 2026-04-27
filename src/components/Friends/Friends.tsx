type Show = {
  name: string
  emoji: string
  isMatch: boolean
}

type Friend = {
  initials: string
  name: string
  color: string
  shows: Show[]
  isOnline: boolean
}

const friends: Friend[] = [
  {
    initials: 'JR',
    name: 'Jordan R.',
    color: '#c4622d',
    isOnline: true,
    shows: [
      { name: 'Solo Leveling S3', emoji: '🌙', isMatch: true },
      { name: 'Vinland Saga S3', emoji: '⚔️', isMatch: false },
      { name: 'Frieren S2', emoji: '🌸', isMatch: false },
    ]
  },
  {
    initials: 'MK',
    name: 'Mia K.',
    color: '#1D9E75',
    isOnline: true,
    shows: [
      { name: 'Mushishi Returns', emoji: '🌿', isMatch: false },
      { name: 'Demon Slayer S5', emoji: '⛩', isMatch: true },
      { name: 'Frieren S2', emoji: '🌸', isMatch: false },
    ]
  },
  {
    initials: 'DT',
    name: 'Dev T.',
    color: '#7F77DD',
    isOnline: false,
    shows: [
      { name: 'JJK Season 3', emoji: '🔥', isMatch: false },
      { name: 'Gundam: Requiem', emoji: '🤖', isMatch: false },
      { name: 'One Piece', emoji: '⚡', isMatch: false },
    ]
  },
  {
    initials: 'AL',
    name: 'Alex L.',
    color: '#dcb43c',
    isOnline: true,
    shows: [
      { name: 'Frieren S2', emoji: '🌸', isMatch: true },
      { name: 'Vinland Saga S3', emoji: '⚔️', isMatch: false },
      { name: 'One Piece', emoji: '⚡', isMatch: false },
    ]
  },
]

function Friends() {
  return (
    <div className="px-6 py-5 border-t border-white/5">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium text-[#f0ede8]">Your nakama are watching</h2>
          <p className="text-[11px] text-[#9a9590] mt-0.5">Orange border means you both watch it</p>
        </div>
        <span className="text-[11px] text-[#D13924] cursor-pointer">See all friends</span>
      </div>

      {/* Grid — 4 equal columns */}
      <div className="grid grid-cols-4 gap-4">
        {friends.map((friend) => {

          const hasMatch = friend.shows.some((s) => s.isMatch)

          return (
            <div
              key={friend.name}
              className={`rounded-xl p-5 border flex flex-col gap-5 ${
                hasMatch
                  ? 'border-[#D13924]/35 bg-[#D13924]/04'
                  : 'border-white/7 bg-[#1a1815]'
              }`}
            >
              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold"
                    style={{ backgroundColor: `${friend.color}35`, color: friend.color }}
                  >
                    {friend.initials}
                  </div>
                  {friend.isOnline && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#1D9E75] border-2 border-[#0f0e0d]" />
                  )}
                </div>
                <span className="text-sm font-medium text-[#f0ede8]">{friend.name}</span>
              </div>

              {/* Show cards */}
              <div className="flex gap-2 w-full">
                {friend.shows.map((show) => (
                  <div
                    key={show.name}
                   className={`flex-1 min-w-0 rounded-xl p-1 border text-center cursor-pointer transition-all flex flex-col items-center justify-center h-[80px] ${
                      show.isMatch
                        ? 'border-[#D13924] bg-[#D13924]/09'
                        : 'border-white/7 bg-[#0f0e0d]'
                    }`}
                  >
                    <div className="text-2xl mb-2">{show.emoji}</div>
                    <div className="text-[9px] text-[#c8c4be] leading-tight line-clamp-2">{show.name}</div>
                  </div>
                ))}
              </div>

              {/* Action button */}
              {hasMatch ? (
                <button className="w-full bg-[#D13924]/12 border border-[#D13924]/28 rounded-lg text-[#D13924] text-xs font-medium py-2.5 cursor-pointer hover:bg-[#D13924]/20">
                  Start a thread ›
                </button>
              ) : (
                <button className="w-full bg-white/4 border border-white/8 rounded-lg text-[#9a9590] text-xs py-2.5 cursor-pointer hover:bg-white/8">
                  + Add a show to your list
                </button>
              )}

            </div>
          )
        })}
      </div>

    </div>
  )
}

export default Friends