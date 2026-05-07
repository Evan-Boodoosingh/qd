const express = require('express')
const router = express.Router()

// ─── Constants ───────────────────────────────────────────────────────────────

const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

// ─── In-memory caches ────────────────────────────────────────────────────────

const cache = {
  season: { data: null, time: null },
  seasonal: { data: null, time: null },
}

const episodeCache = {}
const episodeDetailCache = {}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const jikanFetch = (url) =>
  fetch(url, { headers: { 'User-Agent': 'Queued/1.0' } })

const isCacheValid = (entry) =>
  entry.data && entry.time && Date.now() - entry.time < CACHE_DURATION

const getCurrentSeason = () => {
  const month = new Date().getMonth()
  if (month < 3) return 'winter'
  if (month < 6) return 'spring'
  if (month < 9) return 'summer'
  return 'fall'
}

const normalizeDayFromJikan = (day) => {
  const map = {
    Mondays: 'Monday', Tuesdays: 'Tuesday', Wednesdays: 'Wednesday',
    Thursdays: 'Thursday', Fridays: 'Friday', Saturdays: 'Saturday', Sundays: 'Sunday',
  }
  return map[day] || day
}

// Convert AniList Unix timestamp to day of week (in JST, where most anime airs)
const getDayFromTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown'
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  // Convert to JST (UTC+9) before getting day
  const jstDate = new Date((timestamp + 9 * 3600) * 1000)
  return days[jstDate.getUTCDay()]
}

// Convert AniList Unix timestamp to JST time string
const getTimeFromTimestamp = (timestamp) => {
  if (!timestamp) return null
  const jstDate = new Date((timestamp + 9 * 3600) * 1000)
  const hours = jstDate.getUTCHours().toString().padStart(2, '0')
  const mins = jstDate.getUTCMinutes().toString().padStart(2, '0')
  return `${hours}:${mins}`
}

const mapJikanShow = (show, isOngoing = false) => ({
  id: show.mal_id,
  title: show.title_english || show.title,
  image: show.images?.jpg?.large_image_url || null,
  score: show.score || 0,
  genres: show.genres?.map((g) => g.name) || [],
  day: normalizeDayFromJikan(show.broadcast?.day) || 'Unknown',
  time: show.broadcast?.time || null,
  timezone: show.broadcast?.timezone || 'Asia/Tokyo',
  episodes: show.episodes || null,
  synopsis: show.synopsis || '',
  trailer: show.trailer?.embed_url || null,
  studio: show.studios?.[0]?.name || 'Unknown',
  season: show.season || getCurrentSeason(),
  year: show.year || new Date().getFullYear(),
  airing: show.airing || false,
  url: show.url,
  isOngoing,
})

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * GET /api/anime/season
 * Primary schedule data — AniList for coverage + carryovers,
 * Jikan for accurate JST broadcast times when available.
 */
router.get('/season', async (req, res) => {
  try {
    if (isCacheValid(cache.season)) {
      return res.json(cache.season.data)
    }

    const anilistQuery = `
      query {
        Page(page: 1, perPage: 50) {
          media(status: RELEASING, type: ANIME, sort: POPULARITY_DESC) {
            id
            idMal
            title { english romaji }
            nextAiringEpisode { airingAt episode }
            airingSchedule(notYetAired: false, perPage: 1) { nodes { airingAt episode } }
            coverImage { large }
            genres
            averageScore
            episodes
            studios(isMain: true) { nodes { name } }
          }
        }
      }
    `

    // Fetch AniList and Jikan in parallel
    const [anilistRes, jikanRes] = await Promise.all([
      fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query: anilistQuery }),
      }),
      jikanFetch('https://api.jikan.moe/v4/seasons/now?limit=25'),
    ])

    const [anilistData, jikanData] = await Promise.all([
      anilistRes.json(),
      jikanRes.json(),
    ])

    const anilistShows = anilistData?.data?.Page?.media || []
    const jikanShows = jikanData?.data || []

    // Build MAL ID → Jikan show lookup for broadcast time enrichment
    const jikanMap = {}
    for (const show of jikanShows) {
      jikanMap[show.mal_id] = show
    }

    const currentSeason = getCurrentSeason()
    const currentYear = new Date().getFullYear()
    const seenIds = new Set()
    const merged = []

    // Process AniList shows first (better coverage including carryovers)
    for (const show of anilistShows) {
      if (!show.idMal || seenIds.has(show.idMal)) continue
      seenIds.add(show.idMal)

      const jikan = jikanMap[show.idMal]

      // Prefer Jikan broadcast data (JST, accurate) over AniList timestamps (UTC, can drift)
      const hasJikanBroadcast = !!(jikan?.broadcast?.time)
      const airTimestamp = show.nextAiringEpisode?.airingAt || show.airingSchedule?.nodes?.[0]?.airingAt || null

      const day = hasJikanBroadcast
        ? normalizeDayFromJikan(jikan.broadcast.day)
        : getDayFromTimestamp(airTimestamp)

      const time = hasJikanBroadcast
        ? jikan.broadcast.time
        : getTimeFromTimestamp(airTimestamp)

      const timezone = hasJikanBroadcast
        ? (jikan.broadcast.timezone || 'Asia/Tokyo')
        : 'Asia/Tokyo' // AniList timestamps converted to JST above

      const jikanSeason = jikan?.season
      const jikanYear = jikan?.year
      const isOngoing = !!(jikanSeason && (jikanSeason !== currentSeason || jikanYear !== currentYear))

      merged.push({
        id: show.idMal,
        anilistId: show.id,
        title: show.title?.english || show.title?.romaji,
        image: show.coverImage?.large || jikan?.images?.jpg?.large_image_url || null,
        score: jikan?.score || (show.averageScore ? show.averageScore / 10 : 0),
        genres: show.genres || jikan?.genres?.map((g) => g.name) || [],
        day,
        time,
        timezone,
        episodes: show.episodes || jikan?.episodes || null,
        synopsis: jikan?.synopsis || '',
        trailer: jikan?.trailer?.embed_url || null,
        studio: show.studios?.nodes?.[0]?.name || jikan?.studios?.[0]?.name || 'Unknown',
        season: jikanSeason || currentSeason,
        year: jikanYear || currentYear,
        airing: true,
        url: jikan?.url || `https://myanimelist.net/anime/${show.idMal}`,
        isOngoing,
      })
    }

    // Add any Jikan seasonal shows not already covered by AniList
    for (const show of jikanShows) {
      if (seenIds.has(show.mal_id)) continue
      seenIds.add(show.mal_id)
      merged.push(mapJikanShow(show, false))
    }

    const result = { shows: merged, fetchedAt: new Date().toISOString() }
    cache.season = { data: result, time: Date.now() }

    res.json(result)
  } catch (err) {
    console.error('SEASON ERROR:', err)
    res.status(500).json({ message: 'Failed to fetch season data', error: err.message })
  }
})

/**
 * GET /api/anime/seasonal
 * Jikan-only seasonal data for Hero carousel and Trending section.
 * No AniList — these components need score/synopsis data Jikan provides cleanly.
 */
router.get('/seasonal', async (req, res) => {
  try {
    if (isCacheValid(cache.seasonal)) {
      return res.json(cache.seasonal.data)
    }

    const response = await jikanFetch('https://api.jikan.moe/v4/seasons/now?limit=25')
    const data = await response.json()
    const shows = (data.data || []).map((show) => mapJikanShow(show, false))

    const result = { shows }
    cache.seasonal = { data: result, time: Date.now() }

    res.json(result)
  } catch (err) {
    console.error('SEASONAL ERROR:', err)
    res.status(500).json({ message: 'Failed to fetch seasonal data', error: err.message })
  }
})

/**
 * GET /api/anime/show/:id
 * Full show details from Jikan including episode list.
 */
router.get('/show/:id', async (req, res) => {
  try {
    const { id } = req.params

    const showRes = await jikanFetch(`https://api.jikan.moe/v4/anime/${id}/full`)
    const showData = await showRes.json()

    if (!showData.data) {
      return res.status(404).json({ message: 'Show not found' })
    }

    const show = showData.data
    let episodes = []
    let totalEpisodePages = 1

    try {
      const cacheKey = `${id}-page-1`
      const now = Date.now()

      if (episodeCache[cacheKey] && now - episodeCache[cacheKey].time < CACHE_DURATION) {
        episodes = episodeCache[cacheKey].data
        totalEpisodePages = episodeCache[cacheKey].totalPages
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const episodesRes = await jikanFetch(`https://api.jikan.moe/v4/anime/${id}/episodes?page=1`)
        const episodesData = await episodesRes.json()
        episodes = episodesData.data || []
        totalEpisodePages = episodesData.pagination?.last_visible_page || 1
        if (episodes.length > 0) {
          episodeCache[cacheKey] = { data: episodes, totalPages: totalEpisodePages, time: now }
        }
      }
    } catch {
      episodes = []
    }

    res.json({
      id: show.mal_id,
      title: show.title_english || show.title,
      titleJapanese: show.title_japanese || null,
      image: show.images?.jpg?.large_image_url || null,
      score: show.score || 0,
      rank: show.rank || null,
      popularity: show.popularity || null,
      members: show.members || null,
      genres: show.genres?.map((g) => g.name) || [],
      themes: show.themes?.map((t) => t.name) || [],
      demographics: show.demographics?.map((d) => d.name) || [],
      synopsis: show.synopsis || '',
      trailer: show.trailer?.embed_url || null,
      studio: show.studios?.[0]?.name || 'Unknown',
      source: show.source || null,
      duration: show.duration || null,
      rating: show.rating || null,
      episodes: show.episodes || null,
      status: show.status || 'Unknown',
      airing: show.airing || false,
      airedFrom: show.aired?.from || null,
      airedTo: show.aired?.to || null,
      day: show.broadcast?.day || null,
      time: show.broadcast?.time || null,
      season: show.season || 'Unknown',
      year: show.year || null,
      url: show.url,
      related: show.relations?.map((r) => ({
        relation: r.relation,
        entries: r.entry?.map((e) => ({
          id: e.mal_id,
          title: e.name,
          type: e.type,
          url: e.url,
        })) || [],
      })) || [],
      streaming: show.streaming?.map((s) => ({ name: s.name, url: s.url })) || [],
      external: show.external?.map((e) => ({ name: e.name, url: e.url })) || [],
      openingThemes: show.theme?.openings || [],
      endingThemes: show.theme?.endings || [],
      episodeList: episodes
        .map((ep) => ({
          number: ep.mal_id,
          title: ep.title || `Episode ${ep.mal_id}`,
          airDate: ep.aired || null,
          filler: ep.filler || false,
          recap: ep.recap || false,
        }))
        .sort((a, b) => a.number - b.number),
      totalEpisodePages,
    })
  } catch (err) {
    console.error('SHOW ERROR:', err)
    res.status(500).json({ message: 'Failed to fetch show data', error: err.message })
  }
})

/**
 * GET /api/anime/show/:id/episodes?page=N
 * Paginated episode list for a show.
 */
router.get('/show/:id/episodes', async (req, res) => {
  try {
    const { id } = req.params
    const page = parseInt(req.query.page) || 1
    const cacheKey = `${id}-page-${page}`
    const now = Date.now()

    if (episodeCache[cacheKey] && now - episodeCache[cacheKey].time < CACHE_DURATION) {
      return res.json({ episodes: episodeCache[cacheKey].data, page })
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
    const episodesRes = await jikanFetch(`https://api.jikan.moe/v4/anime/${id}/episodes?page=${page}`)
    const episodesData = await episodesRes.json()

    const episodes = (episodesData.data || [])
      .map((ep) => ({
        number: ep.mal_id,
        title: ep.title || `Episode ${ep.mal_id}`,
        airDate: ep.aired || null,
        filler: ep.filler || false,
        recap: ep.recap || false,
      }))
      .sort((a, b) => a.number - b.number)

    if (episodes.length > 0) {
      episodeCache[cacheKey] = { data: episodes, time: now }
    }

    res.json({ episodes, page })
  } catch (err) {
    console.error('EPISODES ERROR:', err)
    res.status(500).json({ message: 'Failed to fetch episodes', error: err.message })
  }
})

/**
 * GET /api/anime/show/:id/episode/:ep
 * Single episode detail with synopsis. Retried by frontend if synopsis is missing.
 */
router.get('/show/:id/episode/:ep', async (req, res) => {
  try {
    const { id, ep } = req.params
    const cacheKey = `${id}-${ep}`
    const now = Date.now()

    if (
      episodeDetailCache[cacheKey]?.data?.synopsis &&
      now - episodeDetailCache[cacheKey].time < CACHE_DURATION
    ) {
      return res.json(episodeDetailCache[cacheKey].data)
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const response = await jikanFetch(`https://api.jikan.moe/v4/anime/${id}/episodes/${ep}`)
    const data = await response.json()

    if (!data.data) {
      return res.json({
        number: parseInt(ep),
        title: `Episode ${ep}`,
        airDate: null,
        filler: false,
        recap: false,
        synopsis: null,
      })
    }

    const episode = data.data
    const result = {
      number: episode.mal_id,
      title: episode.title || `Episode ${episode.mal_id}`,
      titleJapanese: episode.title_japanese || null,
      titleRomanji: episode.title_romanji || null,
      airDate: episode.aired || null,
      score: episode.score || null,
      filler: episode.filler || false,
      recap: episode.recap || false,
      synopsis: episode.synopsis || null,
      forumUrl: episode.forum_url || null,
    }

    if (result.synopsis) {
      episodeDetailCache[cacheKey] = { data: result, time: now }
    }

    res.json(result)
  } catch (err) {
    console.error('EPISODE ERROR:', err)
    res.status(500).json({ message: 'Failed to fetch episode data', error: err.message })
  }
})

/**
 * GET /api/anime/search?q=query
 * Search anime by title.
 */
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query
    if (!q) return res.status(400).json({ message: 'Query required' })

    const response = await jikanFetch(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=10&type=tv`
    )
    const data = await response.json()

    const results = (data.data || []).map((show) => ({
      id: show.mal_id,
      title: show.title_english || show.title,
      image: show.images?.jpg?.large_image_url || null,
      score: show.score || 0,
      genres: show.genres?.map((g) => g.name) || [],
      episodes: show.episodes || null,
      synopsis: show.synopsis || '',
      year: show.year || null,
    }))

    res.json({ results })
  } catch (err) {
    console.error('SEARCH ERROR:', err)
    res.status(500).json({ message: 'Search failed', error: err.message })
  }
})

/**
 * GET /api/anime/top
 * All time top rated anime.
 */
router.get('/top', async (req, res) => {
  try {
    const response = await jikanFetch('https://api.jikan.moe/v4/top/anime?type=tv&limit=25')
    const data = await response.json()

    const results = (data.data || []).map((show) => ({
      id: show.mal_id,
      title: show.title_english || show.title,
      image: show.images?.jpg?.large_image_url || null,
      score: show.score || 0,
      rank: show.rank || null,
      genres: show.genres?.map((g) => g.name) || [],
      episodes: show.episodes || null,
      year: show.year || null,
      studio: show.studios?.[0]?.name || 'Unknown',
      members: show.members || 0,
    }))

    res.json({ results })
  } catch (err) {
    console.error('TOP ERROR:', err)
    res.status(500).json({ message: 'Failed to fetch top anime', error: err.message })
  }
})

/**
 * GET /api/anime/popular
 * Most popular anime by member count.
 */
router.get('/popular', async (req, res) => {
  try {
    const response = await jikanFetch(
      'https://api.jikan.moe/v4/top/anime?type=tv&filter=bypopularity&limit=25'
    )
    const data = await response.json()

    const results = (data.data || []).map((show) => ({
      id: show.mal_id,
      title: show.title_english || show.title,
      image: show.images?.jpg?.large_image_url || null,
      score: show.score || 0,
      rank: show.rank || null,
      genres: show.genres?.map((g) => g.name) || [],
      episodes: show.episodes || null,
      year: show.year || null,
      studio: show.studios?.[0]?.name || 'Unknown',
      members: show.members || 0,
    }))

    res.json({ results })
  } catch (err) {
    console.error('POPULAR ERROR:', err)
    res.status(500).json({ message: 'Failed to fetch popular anime', error: err.message })
  }
}) 

/**
 * GET /api/anime/image?url=...
 * Image proxy to bypass CORS on Jikan/AniList CDN images.
 */
router.get('/image', async (req, res) => {
  try {
    const { url } = req.query
    if (!url) return res.status(400).json({ message: 'URL required' })

    const response = await fetch(decodeURIComponent(url), {
      headers: { 'User-Agent': 'Queued/1.0' },
    })

    if (!response.ok) throw new Error('Failed to fetch image')

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const buffer = await response.arrayBuffer()

    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.send(Buffer.from(buffer))
  } catch (err) {
    console.error('IMAGE ERROR:', err)
    res.status(500).json({ message: 'Image proxy failed', error: err.message })
  }
})

module.exports = router