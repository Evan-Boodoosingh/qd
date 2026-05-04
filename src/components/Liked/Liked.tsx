type LikedShow = {
  name: string
  emoji: string
  rating: number
  friendNames: string[]
  gradient: string
}

const likedShows: LikedShow[] = [
  {
    name: 'Solo Leveling S3',
    emoji: '🌙',
    rating: 9.2,
    friendNames: ['Jordan'],
    gradient: 'from-[#12081e] to-[#0f0e0d]',
  },
  {
    name: 'Frieren S2',
    emoji: '🌸',
    rating: 9.6,
    friendNames: ['Alex'],
    gradient: 'from-[#181008] to-[#0f0e0d]',
  },
  {
    name: 'Demon Slayer S5',
    emoji: '⛩',
    rating: 9.1,
    friendNames: ['Mia', 'Dev'],
    gradient: 'from-[#1e0e08] to-[#0f0e0d]',
  },
  {
    name: 'Vinland Saga S3',
    emoji: '⚔️',
    rating: 9.4,
    friendNames: ['Jordan', 'Alex'],
    gradient: 'from-[#081018] to-[#0f0e0d]',
  },
  {
    name: 'JJK Season 3',
    emoji: '🔥',
    rating: 8.9,
    friendNames: ['Dev'],
    gradient: 'from-[#1e1208] to-[#0f0e0d]',
  },
]

function Liked() {
  return (
    <div className="border-t border-white/5 py-10">
      <div className="max-w-6xl mx-auto px-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-medium text-[#f0ede8]">What your nakama are loving</h2>
            <p className="text-[11px] text-[#9a9590] mt-0.5">Rated and hearted by your friends this season</p>
          </div>
          <span className="text-[11px] text-[#D13924] cursor-pointer">See more</span>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {likedShows.map((show) => (
            <div
              key={show.name}
              className="rounded-xl border border-white/7 overflow-hidden cursor-pointer hover:border-[#D13924]/30 transition-all"
            >
              <div className={`h-[100px] bg-gradient-to-b ${show.gradient} flex items-center justify-center text-4xl`}>
                {show.emoji}
              </div>
              <div className="p-3 bg-[#1a1815]">
                <div className="text-[11px] font-medium text-[#f0ede8] truncate mb-1">{show.name}</div>
                <div className="text-[10px] text-[#9a9590] mb-1 truncate">
                  Loved by <span className="text-[#D13924]">{show.friendNames.join(', ')}</span>
                </div>
                <div className="text-[10px] text-[#9a9590]">
                  ♥ {show.rating} · {show.friendNames.length} {show.friendNames.length === 1 ? 'friend' : 'friends'}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default Liked