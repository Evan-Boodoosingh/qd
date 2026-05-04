import { useState, useEffect } from 'react'
import { fetchCurrentSeason, proxyImage } from '../../services/anime'
import { addToWatchlist } from '../../services/watchlist'

type Show = {
  id: number
  title: string
  image: string | null
  score: number
  genres: string[]
  synopsis: string
  studio: string
  episodes: number | null
  airing: boolean
  episodeList?: { number: number }[]
}

type Props = {
  watchedIds: number[]
  onAdded: (showId: number) => void
}

function Trending({ watchedIds, onAdded }: Props) {
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)

  const user = localStorage.getItem('user') || sessionStorage.getItem('user')
  const isLoggedIn = !!user

  useEffect(() => {
    fetchCurrentSeason()
      .then((data) => {
        const top = data
          .filter((s: Show) => s.image && s.score > 0)
          .sort((a: Show, b: Show) => b.score - a.score)
          .filter((s: Show, index: number, self: Show[]) =>
            index === self.findIndex((t) => t.id === s.id)
          )
          .slice(0, 6)
        setShows(top)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleAddToList = async (e: React.MouseEvent, show: Show) => {
    e.stopPropagation()
    try {
      const airingEpisode = show.airing
        ? (show.episodeList?.length || null)
        : show.episodes

      await addToWatchlist({
        showId: show.id,
        showName: show.title,
        image: show.image,
        totalEpisodes: show.episodes,
        airingEpisode,
        genres: show.genres,
      })
      onAdded(show.id)
    } catch (err: any) {
      if (err.message === 'Show already on your list') onAdded(show.id)
    }
  }

  if (loading) {
    return (
      <div className="px-6 py-5 border-t border-white/5">
        <div className="text-[#9a9590] text-sm animate-pulse">Loading trending...</div>
      </div>
    )
  }

  return (
    <div className="px-6 py-5 border-t border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium text-[#f0ede8]">Trending this season</h2>
          <p className="text-[11px] text-[#9a9590] mt-0.5">Most watched and loved by the community</p>
        </div>
        <span className="text-[11px] text-[#D13924] cursor-pointer">See all</span>
      </div>

      <div className="grid grid-cols-6 gap-4">
        {shows.map((show, index) => {
          const isAdded = watchedIds.includes(show.id)
          return (
            <div
              key={show.id}
              onClick={() => window.location.href = `/show/${show.id}`}
              className="bg-[#1a1815] border border-white/7 rounded-xl overflow-hidden cursor-pointer hover:border-[#D13924]/30 transition-all"
            >
              <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                <img
                  src={proxyImage(show.image)}
                  alt={show.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-[#D13924] flex items-center justify-center">
                  <span className="text-[9px] font-semibold text-white">#{index + 1}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1815] to-transparent opacity-60" />
              </div>
              <div className="p-3">
                <div className="text-[11px] font-medium text-[#f0ede8] truncate mb-1">{show.title}</div>
                <div className="text-[10px] text-[#9a9590] truncate mb-2">{show.genres.slice(0, 2).join(' · ')}</div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-[#9a9590]">{show.studio}</span>
                  <span className="text-[10px] text-[#D13924]">♥ {show.score}</span>
                </div>
                {isLoggedIn && (
                  <button
                    onClick={(e) => handleAddToList(e, show)}
                    className="w-full text-[10px] font-medium py-1.5 rounded-full cursor-pointer hover:opacity-90 transition-all"
                    style={{
                      backgroundColor: isAdded ? 'rgba(209,57,36,0.2)' : '#D13924',
                      color: isAdded ? '#D13924' : '#fff'
                    }}
                  >
                    {isAdded ? '✓ On list' : '+ List'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Trending