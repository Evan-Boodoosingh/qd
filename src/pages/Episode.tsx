import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Nav from '../components/Nav/Nav'
import { proxyImage } from '../services/anime'

type EpisodeData = {
  number: number
  title: string
  airDate: string | null
  filler: boolean
  recap: boolean
  synopsis?: string | null
}

type ShowData = {
  id: number
  title: string
  image: string | null
  score: number
  genres: string[]
  themes: string[]
  studio: string
  season: string
  year: number | null
  episodes: number | null
  synopsis: string
  rating: string | null
}

type Reply = {
  _id: string
}

type Discussion = {
  _id: string
  threadTitle: string
  threadType: 'episode' | 'season' | 'show'
  season?: number
  episode?: number
  replies: Reply[]
  hasSpoiler: boolean
  username: string
  createdAt: string
}

const formatAirDate = (dateString: string | null) => {
  if (!dateString) return 'TBA'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const timeAgo = (dateString: string) => {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const synopsisCache: Record<string, string> = {}

function Episode() {
  const { id, ep } = useParams<{ id: string; ep: string }>()
  const [show, setShow] = useState<ShowData | null>(null)
  const [episode, setEpisode] = useState<EpisodeData | null>(null)
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSynopsis, setLoadingSynopsis] = useState(() => {
  if (!id || !ep) return false
  return !synopsisCache[`${id}-${ep}`]
})
  const [showDiscussions, setShowDiscussions] = useState(false)

  const user = localStorage.getItem('user') || sessionStorage.getItem('user')
  const isLoggedIn = !!user

  useEffect(() => {
    if (!id || !ep) return

    const cacheKey = `${id}-${ep}`

    

    fetch(`http://localhost:3001/api/anime/show/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setShow({
          id: data.id,
          title: data.title,
          image: data.image,
          score: data.score,
          genres: data.genres || [],
          themes: data.themes || [],
          studio: data.studio,
          season: data.season,
          year: data.year,
          episodes: data.episodes,
          synopsis: data.synopsis || '',
          rating: data.rating || null,
        })

        const epNumber = parseInt(ep)
        const foundEp = data.episodeList?.find((e: EpisodeData) => e.number === epNumber)
        const baseEpisode = foundEp || {
          number: epNumber,
          title: `Episode ${epNumber}`,
          airDate: null,
          filler: false,
          recap: false,
        }

        setEpisode({
          ...baseEpisode,
          synopsis: synopsisCache[cacheKey] || null,
        })

        setLoading(false)
      })
      .catch(() => setLoading(false))

    const fetchEpisodeDetail = async (retries = 2) => {
      if (synopsisCache[cacheKey]) {
        setLoadingSynopsis(false)
        return
      }

      try {
        const res = await fetch(`http://localhost:3001/api/anime/show/${id}/episode/${ep}`)
        const data = await res.json()
        if (data.synopsis) {
          synopsisCache[cacheKey] = data.synopsis
          setEpisode((prev) => prev ? { ...prev, synopsis: data.synopsis } : prev)
          setLoadingSynopsis(false)
        } else if (retries > 0) {
          setTimeout(() => fetchEpisodeDetail(retries - 1), 3000)
        } else {
          setLoadingSynopsis(false)
        }
      } catch {
        if (retries > 0) {
          setTimeout(() => fetchEpisodeDetail(retries - 1), 3000)
        } else {
          setLoadingSynopsis(false)
        }
      }
    }

    fetchEpisodeDetail()

    fetch(`http://localhost:3001/api/threads?showId=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDiscussions(data.filter(
            (d: Discussion) => d.threadType === 'episode' && d.episode === parseInt(ep!)
          ))
        }
      })
      .catch(() => {
        // fail silently
      })
  }, [id, ep])

  if (loading) {
    return (
      <div className="bg-[#0f0e0d] min-h-screen text-white">
        <Nav />
        <div className="flex items-center justify-center h-96">
          <p className="text-[#9a9590] text-sm animate-pulse">Loading episode...</p>
        </div>
      </div>
    )
  }

  if (!show || !episode) {
    return (
      <div className="bg-[#0f0e0d] min-h-screen text-white">
        <Nav />
        <div className="flex items-center justify-center h-96">
          <p className="text-[#9a9590] text-sm">Episode not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0f0e0d] min-h-screen text-white">
      <Nav />

      {/* Hero */}
      <div className="relative h-[240px] overflow-hidden bg-[#1a1815]">
        <img
          src={proxyImage(show.image)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e0d] via-[#0f0e0d]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f0e0d] via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 px-8 pb-6 flex flex-col items-center text-center">
          <div
            className="text-[12px] text-[#D13924] cursor-pointer hover:underline mb-1"
            onClick={() => window.location.href = `/show/${show.id}`}
          >
            {show.title}
          </div>
          <h1 className="text-3xl font-medium text-[#f0ede8] mb-1">
            Episode {episode.number}{episode.title !== `Episode ${episode.number}` ? ` — ${episode.title}` : ''}
          </h1>
          <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
            {show.genres.slice(0, 3).map((g) => (
              <span key={g} className="text-[10px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/25 px-2 py-0.5 rounded-full">
                {g}
              </span>
            ))}
            {episode.filler && (
              <span className="text-[10px] text-[#9a9590] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">Filler</span>
            )}
            {episode.recap && (
              <span className="text-[10px] text-[#9a9590] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">Recap</span>
            )}
          </div>
          <p className="text-[12px] text-[#9a9590]">
            {show.studio} · {formatAirDate(episode.airDate)}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="flex gap-6 items-start">

          {/* Left column */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* Episode navigation */}
            <div className="bg-[#1a1815] border border-white/7 rounded-xl p-4 flex items-center justify-between">
              <button
                onClick={() => episode.number > 1 && (window.location.href = `/show/${show.id}/episode/${episode.number - 1}`)}
                disabled={episode.number <= 1}
                className="flex items-center gap-2 text-[12px] text-[#9a9590] hover:text-[#f0ede8] cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Episode {episode.number - 1}
              </button>
              <button
                onClick={() => window.location.href = `/show/${show.id}`}
                className="text-[12px] text-[#D13924] hover:underline cursor-pointer"
              >
                All episodes
              </button>
              <button
                onClick={() => (!show.episodes || episode.number < show.episodes) && (window.location.href = `/show/${show.id}/episode/${episode.number + 1}`)}
                disabled={!!(show.episodes && episode.number >= show.episodes)}
                className="flex items-center gap-2 text-[12px] text-[#9a9590] hover:text-[#f0ede8] cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Episode {episode.number + 1} →
              </button>
            </div>

            {/* Synopsis */}
            <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
              <h2 className="text-[13px] font-medium text-[#f0ede8] mb-3">Synopsis</h2>
              {episode.synopsis ? (
                <p className="text-[13px] text-[#c8c4be] leading-relaxed">{episode.synopsis}</p>
              ) : loadingSynopsis ? (
                <p className="text-[13px] text-[#5a5650] animate-pulse">Loading synopsis...</p>
              ) : (
                <p className="text-[13px] text-[#5a5650] italic">No synopsis available for this episode</p>
              )}
            </div>

            {/* Discussions toggle */}
            <div className="bg-[#1a1815] border border-white/7 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowDiscussions(!showDiscussions)}
                className="w-full p-5 flex items-center justify-between cursor-pointer hover:bg-white/3 transition-all"
              >
                <div className="flex items-center gap-3">
                  <h2 className="text-[14px] font-medium text-[#f0ede8]">
                    Episode {episode.number} discussions
                  </h2>
                  {discussions.length > 0 && (
                    <span className="text-[11px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/25 px-2 py-0.5 rounded-full">
                      {discussions.length} thread{discussions.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <span
                  className="text-[#9a9590] text-sm transition-all duration-200"
                  style={{ transform: showDiscussions ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}
                >
                  ▾
                </span>
              </button>

              {showDiscussions && (
                <div className="px-5 pb-5 border-t border-white/5">
                  <div className="flex items-center justify-between py-4">
                    <p className="text-[12px] text-[#9a9590]">
                      {discussions.length === 0
                        ? 'No discussions for this episode yet'
                        : `${discussions.length} thread${discussions.length !== 1 ? 's' : ''} about this episode`}
                    </p>
                    {isLoggedIn && (
                      <button
                        onClick={() => window.location.href = `/thread/new?showId=${show.id}&showName=${encodeURIComponent(show.title)}&episode=${episode.number}&threadType=episode`}
                        className="text-[11px] text-white px-3 py-1.5 rounded-full cursor-pointer hover:opacity-90 transition-all"
                        style={{ backgroundColor: '#D13924' }}
                      >
                        + Start a thread
                      </button>
                    )}
                  </div>

                  {discussions.length === 0 ? (
                    <div className="text-center py-8 bg-[#0f0e0d] rounded-xl">
                      <p className="text-[#9a9590] text-sm mb-2">Be the first to discuss this episode</p>
                      {!isLoggedIn && (
                        <button
                          onClick={() => window.location.href = '/register'}
                          className="text-[12px] text-white px-4 py-2 rounded-full cursor-pointer hover:opacity-90 transition-all mt-2"
                          style={{ backgroundColor: '#D13924' }}
                        >
                          Sign up to start a thread
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {discussions.map((disc) => (
                        <div
                          key={disc._id}
                          onClick={() => window.location.href = `/thread/${disc._id}`}
                          className="border border-white/5 rounded-xl p-4 cursor-pointer hover:border-[#D13924]/30 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-medium text-[#f0ede8] mb-1">{disc.threadTitle}</div>
                              <div className="text-[11px] text-[#9a9590]">by @{disc.username} · {timeAgo(disc.createdAt)}</div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {disc.hasSpoiler && (
                                <span className="text-[9px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/25 px-2 py-0.5 rounded-full">
                                  ⚠ Spoiler
                                </span>
                              )}
                              <span className="text-[11px] text-[#9a9590]">
                                <span className="text-[#D13924]">{disc.replies.length}</span> replies
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              window.location.href = `/thread/${disc._id}`
                            }}
                            className="text-[11px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/25 rounded-md px-3 py-1.5 hover:bg-[#D13924]/20 cursor-pointer"
                          >
                            Join thread ›
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Right sidebar */}
          <div className="w-[260px] shrink-0 flex flex-col gap-4">

            {/* Poster */}
            <div className="rounded-xl overflow-hidden border border-white/7">
              <img src={proxyImage(show.image)} alt={show.title} className="w-full object-cover" />
            </div>

            {/* Episode details */}
            <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
              <h2 className="text-[13px] font-medium text-[#f0ede8] mb-4">Details</h2>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Show', value: show.title },
                  { label: 'Episode', value: String(episode.number) },
                  { label: 'Title', value: episode.title !== `Episode ${episode.number}` ? episode.title : 'TBA' },
                  { label: 'Aired', value: formatAirDate(episode.airDate) },
                  { label: 'Studio', value: show.studio },
                  { label: 'Season', value: `${show.season} ${show.year}` },
                  { label: 'Total eps', value: show.episodes ? String(show.episodes) : 'Ongoing' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start justify-between gap-2">
                    <span className="text-[11px] text-[#9a9590] shrink-0">{item.label}</span>
                    <span className="text-[11px] text-[#f0ede8] text-right truncate">{item.value}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#9a9590]">Show score</span>
                    <span className="text-[11px] text-[#D13924]">♥ {show.score}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Genres */}
            <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
              <h2 className="text-[13px] font-medium text-[#f0ede8] mb-3">Genres & Themes</h2>
              <div className="flex flex-wrap gap-2">
                {[...show.genres, ...show.themes].map((g) => (
                  <span key={g} className="text-[10px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/25 px-2 py-0.5 rounded-full">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Back to show */}
            <div
              onClick={() => window.location.href = `/show/${show.id}`}
              className="bg-[#1a1815] border border-white/7 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-[#D13924]/30 transition-all"
            >
              <span className="text-[12px] text-[#9a9590]">Back to {show.title}</span>
              <span className="text-[#D13924] text-sm">→</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Episode