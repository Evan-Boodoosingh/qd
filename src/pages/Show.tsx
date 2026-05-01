import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Nav from '../components/Nav/Nav'
import { proxyImage } from '../services/anime'
import { addToWatchlist, updateWatchlistEntry, fetchWatchlist } from '../services/watchlist'

type WatchStatus = 'watching' | 'completed' | 'planToWatch' | 'dropped' | null

type Episode = {
  number: number
  title: string
  airDate: string | null
  filler: boolean
  recap: boolean
}

type Related = {
  relation: string
  entries: {
    id: number
    title: string
    type: string
    url: string
  }[]
}

type StreamingService = {
  name: string
  url: string
}

type ExternalLink = {
  name: string
  url: string
}

type Discussion = {
  _id: string
  threadTitle: string
  threadType: 'episode' | 'season' | 'show'
  season?: number
  episode?: number
  replies: any[]
  likes: string[]
  createdAt: string
  hasSpoiler: boolean
  username: string
}

type Show = {
  id: number
  title: string
  titleJapanese: string | null
  image: string | null
  score: number
  rank: number | null
  popularity: number | null
  members: number | null
  genres: string[]
  themes: string[]
  demographics: string[]
  synopsis: string
  trailer: string | null
  studio: string
  source: string | null
  duration: string | null
  rating: string | null
  episodes: number | null
  status: string
  airing: boolean
  airedFrom: string | null
  airedTo: string | null
  day: string | null
  time: string | null
  season: string
  year: number | null
  url: string
  related: Related[]
  streaming: StreamingService[]
  external: ExternalLink[]
  openingThemes: string[]
  endingThemes: string[]
  episodeList: Episode[]
}

const timeAgo = (dateString: string) => {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const cleanSynopsis = (text: string) => {
  return text
    .replace(/\[Written by MAL Rewrite\]/g, '')
    .replace(/\(Source:.*?\)/g, '')
    .trim()
}

const formatAirDate = (dateString: string | null) => {
  if (!dateString) return 'TBA'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function Show() {
  const { id } = useParams<{ id: string }>()
  const [show, setShow] = useState<Show | null>(null)
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(true)
  const [watchStatus, setWatchStatus] = useState<WatchStatus>(null)
  const [currentEpisode, setCurrentEpisode] = useState(0)
  const [showTrailer, setShowTrailer] = useState(false)
  const [onList, setOnList] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)
  const [activeTab, setActiveTab] = useState<'episodes' | 'discussions' | 'related'>('episodes')

  const user = localStorage.getItem('user') || sessionStorage.getItem('user')
  const isLoggedIn = !!user

  useEffect(() => {
    if (!id) return

    fetch(`http://localhost:3001/api/anime/show/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setShow(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    fetch(`http://localhost:3001/api/threads?showId=${id}`)
      .then((res) => res.json())
      .then((data) => setDiscussions(Array.isArray(data) ? data : []))
      .catch(() => {})

    if (isLoggedIn) {
      fetchWatchlist()
        .then((watchlist) => {
          const entry = watchlist.find((w: any) => w.showId === Number(id))
          if (entry) {
            setOnList(true)
            setWatchStatus(entry.status)
            setCurrentEpisode(entry.currentEpisode)
          }
        })
        .catch(() => {})
    }
  }, [id])

  const handleAddToList = async () => {
    if (!show) return
    try {
      await addToWatchlist({
        showId: show.id,
        showName: show.title,
        image: show.image,
        totalEpisodes: show.episodes,
        genres: show.genres,
      })
      setOnList(true)
      setWatchStatus('planToWatch')
    } catch (err: any) {
      if (err.message === 'Show already on your list') setOnList(true)
    }
  }

  const handleStatusChange = async (status: WatchStatus) => {
    if (!show || !status) return
    setWatchStatus(status)
    setSavingStatus(true)
    try {
      if (!onList) await handleAddToList()
      await updateWatchlistEntry(show.id, { status })
    } catch {} finally {
      setSavingStatus(false)
    }
  }

  const handleEpisodeChange = async (newEp: number) => {
    if (!show) return
    setCurrentEpisode(newEp)
    try {
      await updateWatchlistEntry(show.id, { currentEpisode: newEp })
    } catch {}
  }

  if (loading) {
    return (
      <div className="bg-[#0f0e0d] min-h-screen text-white">
        <Nav />
        <div className="flex items-center justify-center h-96">
          <p className="text-[#9a9590] text-sm animate-pulse">Loading show...</p>
        </div>
      </div>
    )
  }

  if (!show) {
    return (
      <div className="bg-[#0f0e0d] min-h-screen text-white">
        <Nav />
        <div className="flex items-center justify-center h-96">
          <p className="text-[#9a9590] text-sm">Show not found</p>
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
        <div className="absolute bottom-0 left-0 px-8 pb-6 max-w-3xl">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {show.genres.slice(0, 3).map((g) => (
              <span key={g} className="text-[10px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/25 px-2 py-0.5 rounded-full">
                {g}
              </span>
            ))}
            {show.rating && (
              <span className="text-[10px] text-[#9a9590] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                {show.rating.split(' ')[0]}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-medium text-[#f0ede8] mb-1">{show.title}</h1>
          {show.titleJapanese && (
            <p className="text-[11px] text-[#5a5650] mb-1">{show.titleJapanese}</p>
          )}
          <p className="text-[12px] text-[#9a9590]">
            {show.studio} · {show.airing ? `Airing · ${show.day}` : show.status}
          </p>
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
                  {!onList ? (
                    <button
                      onClick={handleAddToList}
                      className="text-white text-sm font-medium px-5 py-2 rounded-full cursor-pointer hover:opacity-90 transition-all"
                      style={{ backgroundColor: '#D13924' }}
                    >
                      + Add to list
                    </button>
                  ) : (
                    <div className="flex gap-1 bg-[#0f0e0d] border border-white/7 rounded-lg p-1">
                      {(['watching', 'planToWatch', 'completed', 'dropped'] as WatchStatus[]).map((s) => (
                        <button
                          key={s!}
                          onClick={() => handleStatusChange(s)}
                          disabled={savingStatus}
                          className={`px-3 py-1.5 rounded-md text-[11px] cursor-pointer transition-all whitespace-nowrap ${
                            watchStatus === s ? 'text-white' : 'text-[#9a9590] hover:text-[#f0ede8]'
                          }`}
                          style={watchStatus === s ? { backgroundColor: '#D13924' } : {}}
                        >
                          {s === 'watching' ? 'Watching' : s === 'planToWatch' ? 'Plan to Watch' : s === 'completed' ? 'Completed' : 'Dropped'}
                        </button>
                      ))}
                    </div>
                  )}

                  {onList && watchStatus === 'watching' && (
                    <div className="flex items-center gap-2 bg-[#0f0e0d] border border-white/7 rounded-lg px-3 py-2">
                      <button
                        onClick={() => handleEpisodeChange(Math.max(0, currentEpisode - 1))}
                        className="text-[#9a9590] hover:text-[#f0ede8] cursor-pointer w-4 text-center"
                      >−</button>
                      <span className="text-[12px] text-[#f0ede8] w-24 text-center">
                        Ep {currentEpisode} / {show.episodes || '?'}
                      </span>
                      <button
                        onClick={() => handleEpisodeChange(Math.min(show.episodes || 999, currentEpisode + 1))}
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
            {showTrailer && show.trailer && (
              <div className="rounded-xl overflow-hidden border border-white/7 aspect-video w-full">
                <iframe
                  src={show.trailer}
                  className="w-full h-full"
                  allowFullScreen
                  title={`${show.title} trailer`}
                />
              </div>
            )}

            {/* Synopsis */}
            <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
              <h2 className="text-[13px] font-medium text-[#f0ede8] mb-3">Synopsis</h2>
              {show.synopsis ? (
                <p className="text-[13px] text-[#c8c4be] leading-relaxed">{cleanSynopsis(show.synopsis)}</p>
              ) : (
                <p className="text-[13px] text-[#5a5650]">No synopsis available yet.</p>
              )}
            </div>

            {/* Streaming */}
            {show.streaming.length > 0 && (
              <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
                <h2 className="text-[13px] font-medium text-[#f0ede8] mb-3">Where to watch</h2>
                <div className="flex flex-wrap gap-2">
                  {show.streaming.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => window.open(s.url, '_blank')}
                      className="text-[12px] text-[#f0ede8] bg-white/5 border border-white/10 px-4 py-2 rounded-full cursor-pointer hover:bg-white/10 transition-all"
                    >
                      {s.name} →
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-[#1a1815] border border-white/7 rounded-xl p-1 w-fit">
              {[
                { label: 'Episodes', value: 'episodes' },
                { label: `Discussions (${discussions.length})`, value: 'discussions' },
                { label: 'Related', value: 'related' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value as any)}
                  className={`px-4 py-2 rounded-lg text-[12px] cursor-pointer transition-all ${
                    activeTab === tab.value ? 'text-white' : 'text-[#9a9590] hover:text-[#f0ede8]'
                  }`}
                  style={activeTab === tab.value ? { backgroundColor: '#D13924' } : {}}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Episodes tab */}
            {activeTab === 'episodes' && (
              <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
                {show.episodeList.length === 0 ? (
                  <p className="text-[13px] text-[#5a5650] text-center py-6">Episode list not available yet</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {show.episodeList.map((ep) => {
                      const watched = watchStatus === 'watching' && currentEpisode >= ep.number
                      return (
                        <div
                          key={ep.number}
                          onClick={() => window.location.href = `/show/${show.id}/episode/${ep.number}`}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                            watched ? 'border-[#D13924]/20 bg-[#D13924]/05 hover:border-[#D13924]/40' : 'border-white/5 hover:border-white/15'
                          }`}
                        >
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0"
                            style={{
                              backgroundColor: watched ? '#D13924' : 'rgba(255,255,255,0.08)',
                              color: watched ? '#fff' : '#9a9590',
                            }}
                          >
                            {ep.number}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] text-[#f0ede8] truncate">{ep.title}</div>
                            {ep.airDate && (
                              <div className="text-[10px] text-[#5a5650] mt-0.5">{formatAirDate(ep.airDate)}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {ep.filler && (
                              <span className="text-[9px] text-[#9a9590] bg-white/5 px-2 py-0.5 rounded">Filler</span>
                            )}
                            {ep.recap && (
                              <span className="text-[9px] text-[#9a9590] bg-white/5 px-2 py-0.5 rounded">Recap</span>
                            )}
                            <span className="text-[10px] text-[#D13924]">View →</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Discussions tab */}
            {activeTab === 'discussions' && (
              <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[13px] font-medium text-[#f0ede8]">Community discussions</h2>
                  {isLoggedIn && (
                    <button
                      onClick={() => window.location.href = `/thread/new?showId=${show.id}&showName=${encodeURIComponent(show.title)}`}
                      className="text-[11px] text-white px-3 py-1.5 rounded-full cursor-pointer hover:opacity-90 transition-all"
                      style={{ backgroundColor: '#D13924' }}
                    >
                      + Start a thread
                    </button>
                  )}
                </div>

                {discussions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[#9a9590] text-sm">No discussions yet</p>
                    <p className="text-[#5a5650] text-[12px] mt-1">Be the first to start a conversation</p>
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
                            <span className="text-[10px] text-[#5a5650]">{timeAgo(disc.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-[11px] text-[#9a9590]">
                              <span className="text-[#D13924]">{disc.replies.length}</span> replies
                            </span>
                            <span className="text-[11px] text-[#9a9590]">by @{disc.username}</span>
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Related tab */}
            {activeTab === 'related' && (
              <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
                {show.related.length === 0 ? (
                  <p className="text-[13px] text-[#5a5650] text-center py-6">No related entries found</p>
                ) : (
                  <div className="flex flex-col gap-6">
                    {show.related.map((group) => (
                      <div key={group.relation}>
                        <h3 className="text-[12px] font-medium text-[#9a9590] mb-3 uppercase tracking-wider">{group.relation}</h3>
                        <div className="flex flex-col gap-2">
                          {group.entries.map((entry) => (
                            <div
                              key={entry.id}
                              onClick={() => entry.type === 'anime' && (window.location.href = `/show/${entry.id}`)}
                              className={`flex items-center justify-between p-3 rounded-lg border border-white/5 transition-all ${
                                entry.type === 'anime' ? 'cursor-pointer hover:border-[#D13924]/30' : 'cursor-default'
                              }`}
                            >
                              <div>
                                <div className="text-[12px] text-[#f0ede8]">{entry.title}</div>
                                <div className="text-[10px] text-[#9a9590] mt-0.5 capitalize">{entry.type}</div>
                              </div>
                              {entry.type === 'anime' && (
                                <span className="text-[11px] text-[#D13924]">View →</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Opening and ending themes */}
            {(show.openingThemes.length > 0 || show.endingThemes.length > 0) && (
              <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
                <h2 className="text-[13px] font-medium text-[#f0ede8] mb-4">Music</h2>
                {show.openingThemes.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[11px] text-[#9a9590] mb-2 uppercase tracking-wider">Opening</div>
                    {show.openingThemes.map((theme, i) => (
                      <div key={i} className="text-[12px] text-[#c8c4be] py-2 border-b border-white/5 last:border-0">
                        {theme}
                      </div>
                    ))}
                  </div>
                )}
                {show.endingThemes.length > 0 && (
                  <div>
                    <div className="text-[11px] text-[#9a9590] mb-2 uppercase tracking-wider">Ending</div>
                    {show.endingThemes.map((theme, i) => (
                      <div key={i} className="text-[12px] text-[#c8c4be] py-2 border-b border-white/5 last:border-0">
                        {theme}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right sidebar */}
          <div className="w-[260px] flex-shrink-0 flex flex-col gap-4">

            {/* Poster */}
            <div className="rounded-xl overflow-hidden border border-white/7">
              <img
                src={proxyImage(show.image)}
                alt={show.title}
                className="w-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
              <h2 className="text-[13px] font-medium text-[#f0ede8] mb-4">Details</h2>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Studio', value: show.studio },
                  { label: 'Source', value: show.source || 'Unknown' },
                  { label: 'Episodes', value: show.episodes ? `${show.episodes} episodes` : 'Ongoing' },
                  { label: 'Duration', value: show.duration || 'Unknown' },
                  { label: 'Status', value: show.status },
                  { label: 'Season', value: `${show.season} ${show.year}` },
                  { label: 'Airs', value: show.day || 'TBA' },
                  { label: 'Premiered', value: formatAirDate(show.airedFrom) },
                  { label: 'Rating', value: show.rating?.split(' - ')[0] || 'Unknown' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start justify-between gap-2">
                    <span className="text-[11px] text-[#9a9590] flex-shrink-0">{item.label}</span>
                    <span className="text-[11px] text-[#f0ede8] text-right">{item.value}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#9a9590]">MAL Score</span>
                    <span className="text-[11px] text-[#f0ede8]">♥ {show.score}</span>
                  </div>
                  {show.rank && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#9a9590]">MAL Rank</span>
                      <span className="text-[11px] text-[#D13924]">#{show.rank}</span>
                    </div>
                  )}
                  {show.members && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#9a9590]">Members</span>
                      <span className="text-[11px] text-[#f0ede8]">{show.members.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Genres and themes */}
            <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
              <h2 className="text-[13px] font-medium text-[#f0ede8] mb-3">Genres & Themes</h2>
              <div className="flex flex-wrap gap-2">
                {[...show.genres, ...show.themes, ...show.demographics].map((g) => (
                  <span key={g} className="text-[10px] text-[#D13924] bg-[#D13924]/10 border border-[#D13924]/25 px-2 py-0.5 rounded-full">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* External links */}
            {show.external.length > 0 && (
              <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
                <h2 className="text-[13px] font-medium text-[#f0ede8] mb-3">Links</h2>
                <div className="flex flex-col gap-2">
                  {show.external.slice(0, 5).map((link) => (
                    <div
                      key={link.name + link.url}
                      onClick={() => window.open(link.url, '_blank')}
                      className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-all"
                    >
                      <span className="text-[12px] text-[#9a9590]">{link.name}</span>
                      <span className="text-[#D13924] text-sm">→</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MAL link */}
            <div
              onClick={() => window.open(show.url, '_blank')}
              className="bg-[#1a1815] border border-white/7 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-[#D13924]/30 transition-all"
            >
              <span className="text-[12px] text-[#9a9590]">View on MyAnimeList</span>
              <span className="text-[#D13924] text-sm">→</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Show