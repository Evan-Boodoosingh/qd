import { useState, useEffect } from 'react'
import { fetchCurrentSeason, proxyImage } from '../../services/anime'
import { addToWatchlist } from '../../services/watchlist'

type Show = {
  id: number
  title: string
  image: string | null
  score: number
  genres: string[]
  day: string
  synopsis: string
  episodes: number | null
  airing: boolean
  episodeList?: { number: number }[]
}

type Props = {
  watchedIds: number[]
  onAdded: (showId: number) => void
}

function Hero({ watchedIds = [], onAdded }: Props) {
  const [shows, setShows] = useState<Show[]>([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)

  const user = localStorage.getItem('user') || sessionStorage.getItem('user')
  const isLoggedIn = !!user

  useEffect(() => {
    fetchCurrentSeason()
      .then((data) => {
        const filtered = data
          .filter((s: Show) => s.image && s.score > 7.5)
          .slice(0, 5)
        setShows(filtered)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (shows.length === 0) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % shows.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [shows])

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
      <div className="relative h-[500px] bg-[#1a1815] flex items-center justify-center">
        <div className="text-[#9a9590] text-sm animate-pulse">Loading season...</div>
      </div>
    )
  }

  if (shows.length === 0) return null

  const show = shows[current]
  const isAdded = watchedIds.includes(show.id)

  return (
    <div className="relative h-[500px] overflow-hidden bg-[#0f0e0d]">

      <img
        src={proxyImage(show.image)}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-10 blur-xl scale-110 transition-all duration-1000"
      />
      <div className="absolute inset-0 bg-[#0f0e0d]/60" />

      <div className="relative h-full max-w-6xl mx-auto px-8 flex items-center gap-12 z-10">

        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 text-[11px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/25 rounded-full px-3 py-1.5 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#D13924] animate-pulse" />
            Airing now · Spring 2026
          </div>

          <h2
            onClick={() => window.location.href = `/show/${show.id}`}
            className="text-4xl font-medium text-[#f0ede8] mb-3 leading-tight cursor-pointer hover:text-[#D13924] transition-all"
          >
            {show.title}
          </h2>

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-[12px] text-[#c8c4be]">{show.genres.slice(0, 3).join(' · ')}</span>
            <span className="text-[11px] text-[#D13924] bg-[#D13924]/10 px-2 py-0.5 rounded border border-[#D13924]/20">
              {show.day}
            </span>
            <span className="text-[12px] text-[#9a9590]">♥ {show.score}</span>
          </div>

          <p className="text-[13px] text-[#9a9590] leading-relaxed mb-8 line-clamp-3 max-w-lg">
            {show.synopsis}
          </p>

          <div className="flex gap-3 mb-10">
            {isLoggedIn ? (
              <button
                onClick={(e) => handleAddToList(e, show)}
                className="text-white text-sm font-medium px-6 py-2.5 rounded-full hover:opacity-90 cursor-pointer transition-all"
                style={{
                  backgroundColor: isAdded ? 'rgba(209,57,36,0.2)' : '#D13924',
                  color: isAdded ? '#D13924' : '#fff',
                  border: isAdded ? '1px solid #D13924' : 'none',
                }}
              >
                {isAdded ? '✓ On list' : '+ Add to list'}
              </button>
            ) : (
              <button
                onClick={() => window.location.href = '/register'}
                className="text-white text-sm font-medium px-6 py-2.5 rounded-full hover:opacity-90 cursor-pointer transition-all"
                style={{ backgroundColor: '#D13924' }}
              >
                + Add to list
              </button>
            )}
            <button
              onClick={() => window.location.href = `/show/${show.id}`}
              className="bg-white/10 text-[#f0ede8] text-sm px-6 py-2.5 rounded-full border border-white/15 hover:bg-white/15 cursor-pointer transition-all"
            >
              View show
            </button>
          </div>

          <div className="flex gap-2">
            {shows.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-[3px] rounded-full transition-all duration-300 cursor-pointer ${
                  i === current ? 'w-8 bg-[#D13924]' : 'w-4 bg-white/25 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex-shrink-0">
          <div
            onClick={() => window.location.href = `/show/${show.id}`}
            className="w-[260px] h-[370px] rounded-xl overflow-hidden shadow-2xl cursor-pointer hover:opacity-90 transition-all"
          >
            <img
              src={proxyImage(show.image)}
              alt={show.title}
              className="w-full h-full object-cover transition-all duration-700"
            />
          </div>
        </div>

      </div>
    </div>
  )
}

export default Hero