import { useState, useEffect } from 'react'
import Nav from '../components/Nav/Nav'
import { fetchCurrentSeason, fetchTopAnime, fetchPopularAnime, proxyImage } from '../services/anime'
import { addToWatchlist } from '../services/watchlist'

type Show = {
  id: number
  title: string
  image: string | null
  score: number
  rank?: number | null
  genres: string[]
  episodes: number | null
  year?: number | null
  studio?: string
  members?: number
  airing?: boolean
  isOngoing?: boolean
}

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
]

type ShelfRowProps = {
  title: string
  subtitle?: string
  shows: Show[]
  watchedIds: number[]
  isLoggedIn: boolean
  onAdd: (e: React.MouseEvent, show: Show) => void
}

function ShelfRow({ title, subtitle, shows, watchedIds, isLoggedIn, onAdd }: ShelfRowProps) {
  return (
    <div className="mb-10">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-[15px] font-medium text-[#f0ede8]">{title}</h2>
          {subtitle && <p className="text-[11px] text-[#9a9590] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {shows.map((show, index) => {
          const isAdded = watchedIds.includes(show.id)
          return (
            <div
              key={show.id}
              onClick={() => window.location.href = `/show/${show.id}`}
              className="shrink-0 w-36 cursor-pointer group"
            >
              <div className="relative w-36 h-52 rounded-xl overflow-hidden mb-2">
                <img
                  src={proxyImage(show.image)}
                  alt={show.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                {show.rank && (
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-[#D13924] flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white">#{index + 1}</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2">
                  <span className="text-[10px] text-white font-medium">♥ {show.score}</span>
                </div>
                {isLoggedIn && (
                  <button
                    onClick={(e) => onAdd(e, show)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all opacity-0 group-hover:opacity-100"
                    style={{
                      backgroundColor: isAdded ? 'rgba(209,57,36,0.9)' : 'rgba(0,0,0,0.7)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    {isAdded ? '✓' : '+'}
                  </button>
                )}
              </div>
              <div className="text-[12px] font-medium text-[#f0ede8] truncate group-hover:text-[#D13924] transition-all">
                {show.title}
              </div>
              <div className="text-[10px] text-[#5a5650] truncate mt-0.5">
                {show.genres.slice(0, 2).join(' · ')}
              </div>
              {show.episodes && (
                <div className="text-[10px] text-[#5a5650] mt-0.5">
                  {show.episodes} eps{show.year && ` · ${show.year}`}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

type Props = {
  watchedIds?: number[]
  onAdded?: (showId: number) => void
}

function Browse({ watchedIds = [], onAdded }: Props) {
  const [seasonal, setSeasonal] = useState<Show[]>([])
  const [topRated, setTopRated] = useState<Show[]>([])
  const [popular, setPopular] = useState<Show[]>([])
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const user = localStorage.getItem('user') || sessionStorage.getItem('user')
  const isLoggedIn = !!user

  useEffect(() => {
    const load = async () => {
      try {
        const [seasonalData, topData, popularData] = await Promise.all([
          fetchCurrentSeason(),
          fetchTopAnime(),
          fetchPopularAnime(),
        ])
        setSeasonal(seasonalData.filter((s: Show) => s.image && s.score > 0).slice(0, 20))
        setTopRated(topData.filter((s: Show) => s.image).slice(0, 20))
        setPopular(popularData.filter((s: Show) => s.image).slice(0, 20))
      } catch (err) {
        console.error('Failed to load browse data:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleAdd = async (e: React.MouseEvent, show: Show) => {
    e.stopPropagation()
    try {
      await addToWatchlist({
        showId: show.id,
        showName: show.title,
        image: show.image,
        totalEpisodes: show.episodes || null,
        airingEpisode: null,
        genres: show.genres,
      })
      onAdded?.(show.id)
    } catch (err) {
      if (err instanceof Error && err.message === 'Show already on your list') onAdded?.(show.id)
    }
  }

  const genreFiltered = selectedGenre
    ? seasonal.filter(s => s.genres.includes(selectedGenre))
    : []

  if (loading) {
    return (
      <div className="bg-[#0f0e0d] min-h-screen text-white">
        <Nav />
        <div className="flex items-center justify-center h-96">
          <p className="text-[#9a9590] text-sm animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0f0e0d] min-h-screen text-white">
      <Nav />

      <div className="max-w-6xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h1 className="text-xl font-medium text-[#f0ede8] mb-1">Browse</h1>
          <p className="text-[13px] text-[#9a9590]">Discover anime — trending, top rated, and by genre</p>
        </div>

        <ShelfRow
          title="Trending this season"
          subtitle="Most watched and loved right now"
          shows={[...seasonal].sort((a, b) => b.score - a.score)}
          watchedIds={watchedIds}
          isLoggedIn={isLoggedIn}
          onAdd={handleAdd}
        />

        <ShelfRow
          title="All time top rated"
          subtitle="The highest scored anime of all time"
          shows={topRated}
          watchedIds={watchedIds}
          isLoggedIn={isLoggedIn}
          onAdd={handleAdd}
        />

        <ShelfRow
          title="Most popular"
          subtitle="Most members on MyAnimeList"
          shows={popular}
          watchedIds={watchedIds}
          isLoggedIn={isLoggedIn}
          onAdd={handleAdd}
        />

        {/* Browse by genre */}
        <div>
          <div className="mb-4">
            <h2 className="text-[15px] font-medium text-[#f0ede8] mb-1">Browse by genre</h2>
            <p className="text-[11px] text-[#9a9590]">Filter this season by genre</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
                className={`text-[12px] px-4 py-1.5 rounded-full border cursor-pointer transition-all ${
                  selectedGenre === genre
                    ? 'border-[#D13924] text-[#D13924] bg-[#D13924]/10'
                    : 'border-white/10 text-[#9a9590] hover:border-white/20 hover:text-[#f0ede8]'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          {selectedGenre && genreFiltered.length === 0 && (
            <div className="text-center py-12 bg-[#1a1815] border border-white/7 rounded-xl">
              <p className="text-[#9a9590] text-sm">No {selectedGenre} shows this season</p>
            </div>
          )}

          {selectedGenre && genreFiltered.length > 0 && (
            <div className="grid grid-cols-6 gap-4">
              {genreFiltered.map((show) => {
                const isAdded = watchedIds.includes(show.id)
                return (
                  <div
                    key={show.id}
                    onClick={() => window.location.href = `/show/${show.id}`}
                    className="cursor-pointer group"
                  >
                    <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden mb-2">
                      <img
                        src={proxyImage(show.image)}
                        alt={show.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2">
                        <span className="text-[10px] text-white font-medium">♥ {show.score}</span>
                      </div>
                      {isLoggedIn && (
                        <button
                          onClick={(e) => handleAdd(e, show)}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all opacity-0 group-hover:opacity-100"
                          style={{
                            backgroundColor: isAdded ? 'rgba(209,57,36,0.9)' : 'rgba(0,0,0,0.7)',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.2)'
                          }}
                        >
                          {isAdded ? '✓' : '+'}
                        </button>
                      )}
                    </div>
                    <div className="text-[12px] font-medium text-[#f0ede8] truncate group-hover:text-[#D13924] transition-all">
                      {show.title}
                    </div>
                    <div className="text-[10px] text-[#5a5650] truncate mt-0.5">
                      {show.genres.slice(0, 2).join(' · ')}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!selectedGenre && (
            <div className="text-center py-12 bg-[#1a1815] border border-white/7 rounded-xl">
              <p className="text-[#9a9590] text-sm">Select a genre to browse</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Browse