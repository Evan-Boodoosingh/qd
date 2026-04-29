type TrendingShow = {
  name: string
  emoji: string
  rating: number
  likes: number
  genre: string
  platform: string
  synopsis: string
}

const trendingShows: TrendingShow[] = [
  {
    name: 'Solo Leveling S3',
    emoji: '🌙',
    rating: 9.2,
    likes: 14200,
    genre: 'Action · Fantasy',
    platform: 'Prime Video',
    synopsis: 'Sung Jin-Woo continues his ascent as the world\'s most powerful hunter, facing threats that transcend human understanding.',
  },
  {
    name: 'Frieren S2',
    emoji: '🌸',
    rating: 9.6,
    likes: 18900,
    genre: 'Fantasy · Slice of life',
    platform: 'Crunchyroll',
    synopsis: 'The elven mage Frieren continues her journey, reflecting on the passage of time and the bonds she forms along the way.',
  },
  {
    name: 'Demon Slayer S5',
    emoji: '⛩',
    rating: 9.1,
    likes: 21300,
    genre: 'Action · Supernatural',
    platform: 'Crunchyroll',
    synopsis: 'Tanjiro and his allies face their most powerful demons yet in breathtaking battles animated by Ufotable.',
  },
  {
    name: 'Vinland Saga S3',
    emoji: '⚔️',
    rating: 9.4,
    likes: 11800,
    genre: 'Historical · Drama',
    platform: 'Netflix',
    synopsis: 'Thorfinn\'s journey toward a land of peace continues as he grapples with his violent past and searches for redemption.',
  },
  {
    name: 'JJK Season 3',
    emoji: '🔥',
    rating: 8.9,
    likes: 19400,
    genre: 'Action · Dark fantasy',
    platform: 'Crunchyroll',
    synopsis: 'Yuji Itadori and his allies face the consequences of the Culling Game in the most intense season yet.',
  },
  {
    name: 'Mushishi Returns',
    emoji: '🌿',
    rating: 9.5,
    likes: 8700,
    genre: 'Mystery · Slice of life',
    platform: 'HiDive',
    synopsis: 'Ginko travels through a mystical Japan encountering mushi — ancient life forms that blur the line between the natural and supernatural.',
  },
]

function Trending() {
  return (
    <div className="px-6 py-5 border-t border-white/5">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium text-[#f0ede8]">Trending this season</h2>
          <p className="text-[11px] text-[#9a9590] mt-0.5">Most watched and loved by the community</p>
        </div>
        <span className="text-[11px] text-[#D13924] cursor-pointer">See all</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-6 gap-4">
        {trendingShows.map((show, index) => (
          <div
            key={show.name}
            className="bg-[#1a1815] border border-white/7 rounded-xl overflow-hidden cursor-pointer hover:border-[#D13924]/30 transition-all"
          >
            {/* Rank + Thumbnail */}
            <div className="relative h-[90px] bg-[#0f0e0d] flex items-center justify-center">
              <span className="text-3xl">{show.emoji}</span>
              <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[#D13924] flex items-center justify-center">
                <span className="text-[9px] font-semibold text-white">#{index + 1}</span>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <div className="text-[11px] font-medium text-[#f0ede8] truncate mb-1">{show.name}</div>
              <div className="text-[9px] text-[#9a9590] truncate mb-1">{show.genre}</div>
              <div className="text-[9px] text-[#9a9590] line-clamp-2 mb-2 leading-relaxed">{show.synopsis}</div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-[#D13924] bg-[#D13924]/10 px-1.5 py-0.5 rounded truncate">
                  {show.platform}
                </span>
                <span className="text-[9px] text-[#9a9590]">♥ {show.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Trending