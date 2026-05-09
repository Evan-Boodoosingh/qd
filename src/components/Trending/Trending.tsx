import { useState, useEffect } from 'react'
import { fetchSeasonalOnly, proxyImage } from '../../services/anime'
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

function Trending({ watchedIds = [], onAdded }: Props) {
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)

  const user = localStorage.getItem('user') || sessionStorage.getItem('user')
  const isLoggedIn = !!user

  useEffect(() => {
    fetchSeasonalOnly()
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
    } catch (err) {
      if (err instanceof Error && err.message === 'Show already on your list') {
        onAdded(show.id)
      }
    }
  }

  if (loading) {
    return (
      <div className="border-t border-white/5 py-10">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-[#9a9590] text-sm animate-pulse">Loading trending...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-white/5 py-8 md:py-10">
      <div className="max-w-6xl mx-auto px-4 md:px-6">

        {/* Header Section */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-medium text-[#f0ede8]">Trending this season</h2>
            <p className="text-[11px] text-[#9a9590] mt-0.5">Most watched and loved by the community</p>
          </div>
          <span
            onClick={() => window.location.href = '/schedule'}
            className="text-[11px] text-[#D13924] cursor-pointer hover:underline font-medium"
          >
            See all
          </span>
        </div>

        {/* 
          LAYOUT LOGIC:
          - Default (Mobile/Tablet): Flexbox with horizontal scroll
          - lg (Desktop): Grid with 6 columns (untouched)
        */}
        <div className="
          flex overflow-x-auto pb-4 gap-3 snap-x snap-mandatory no-scrollbar
          lg:grid lg:grid-cols-6 lg:gap-4 lg:overflow-visible lg:pb-0 lg:snap-none
        ">
          {shows.map((show, index) => {
            const isAdded = watchedIds.includes(show.id)
            return (
              <div
                key={show.id}
                onClick={() => window.location.href = `/show/${show.id}`}
                className="
                  bg-[#1a1815] border border-white/7 rounded-xl overflow-hidden cursor-pointer 
                  hover:border-[#D13924]/30 transition-all shrink-0 w-[150px] snap-start
                  md:w-[180px]
                  lg:shrink lg:w-full
                "
              >
                {/* Poster Container */}
                <div className="relative overflow-hidden aspect-2/3">
                  <img
                    src={proxyImage(show.image)}
                    alt={show.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-[#D13924] flex items-center justify-center">
                    <span className="text-[9px] font-semibold text-white">#{index + 1}</span>
                  </div>
                  <div className="absolute inset-0 bg-linear-to-t from-[#1a1815] to-transparent opacity-60" />
                </div>

                <div className="p-2.5 md:p-3">
                  <div className="text-[12px] md:text-[11px] font-medium text-[#f0ede8] truncate mb-1">{show.title}</div>
                  <div className="text-[11px] md:text-[10px] text-[#9a9590] truncate mb-2">{show.genres.slice(0, 2).join(' · ')}</div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-[#5a5650] truncate mr-1">{show.studio}</span>
                    <span className="text-[10px] text-[#D13924] shrink-0">♥ {show.score}</span>
                  </div>

                  {isLoggedIn && (
                    <button
                      onClick={(e) => handleAddToList(e, show)}
                      className="w-full text-[11px] md:text-[10px] font-medium py-1.5 rounded-full cursor-pointer hover:opacity-90 transition-all"
                      style={{
                        backgroundColor: isAdded ? 'rgba(209,57,36,0.15)' : '#D13924',
                        color: isAdded ? '#D13924' : '#fff'
                      }}
                    >
                      {isAdded ? '✓ Added' : '+ List'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}

export default Trending