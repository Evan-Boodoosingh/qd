const express = require('express')
const router = express.Router()

let cachedSeason = null
let cacheTime = null
const CACHE_DURATION = 60 * 60 * 1000

const episodeCache = {}
const EPISODE_CACHE_DURATION = 60 * 60 * 1000

const episodeDetailCache = {}
const EPISODE_DETAIL_CACHE_DURATION = 60 * 60 * 1000

const jikanFetch = (url) => fetch(url, {
  headers: { 'User-Agent': 'Queued/1.0' }
})

// GET /api/anime/season
router.get('/season', async (req, res) => {
  try {
    if (cachedSeason && cacheTime && Date.now() - cacheTime < CACHE_DURATION) {
      return res.json(cachedSeason)
    }

    const response = await jikanFetch('https://api.jikan.moe/v4/seasons/now?limit=25')
    const data = await response.json()

    const shows = data.data.map((show) => ({
      id: show.mal_id,
      title: show.title_english || show.title,
      image: show.images?.jpg?.large_image_url || null,
      score: show.score || 0,
      genres: show.genres?.map((g) => g.name) || [],
      day: show.broadcast?.day || 'Unknown',
      time: show.broadcast?.time || null,
      timezone: show.broadcast?.timezone || 'Asia/Tokyo',
      episodes: show.episodes || null,
      synopsis: show.synopsis || '',
      trailer: show.trailer?.embed_url || null,
      studio: show.studios?.[0]?.name || 'Unknown',
      season: show.season,
      year: show.year,
      airing: show.airing,
      url: show.url,
    }))

    cachedSeason = { shows, fetchedAt: new Date().toISOString() }
    cacheTime = Date.now()

    res.json(cachedSeason)
  } catch (err) {
    console.error('SEASON ERROR:', err)
    res.status(500).json({ message: 'Failed to fetch season data', error: err.message })
  }
})

// GET /api/anime/show/:id
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
    try {
      const now = Date.now()
      if (episodeCache[id] && now - episodeCache[id].time < EPISODE_CACHE_DURATION) {
        episodes = episodeCache[id].data
      } else {
        await new Promise(resolve => setTimeout(resolve, 500))
        const episodesRes = await jikanFetch(`https://api.jikan.moe/v4/anime/${id}/episodes`)
        const episodesData = await episodesRes.json()
        episodes = episodesData.data || []
        if (episodes.length > 0) {
          episodeCache[id] = { data: episodes, time: now }
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
      favorites: show.favorites || null,
      communityScore: show.score || 0,
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
      streaming: show.streaming?.map((s) => ({
        name: s.name,
        url: s.url,
      })) || [],
      external: show.external?.map((e) => ({
        name: e.name,
        url: e.url,
      })) || [],
      openingThemes: show.theme?.openings || [],
      endingThemes: show.theme?.endings || [],
      episodeList: episodes.map((ep) => ({
        number: ep.mal_id,
        title: ep.title || `Episode ${ep.mal_id}`,
        airDate: ep.aired || null,
        filler: ep.filler || false,
        recap: ep.recap || false,
      })),
    })
  } catch (err) {
    console.error('SHOW ERROR:', err)
    res.status(500).json({ message: 'Failed to fetch show data', error: err.message })
  }
})

// GET /api/anime/show/:id/episode/:ep
router.get('/show/:id/episode/:ep', async (req, res) => {
  try {
    const { id, ep } = req.params
    const cacheKey = `${id}-${ep}`
    const now = Date.now()

    if (
      episodeDetailCache[cacheKey] &&
      now - episodeDetailCache[cacheKey].time < EPISODE_DETAIL_CACHE_DURATION
    ) {
      return res.json(episodeDetailCache[cacheKey].data)
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    const response = await jikanFetch(`https://api.jikan.moe/v4/anime/${id}/episodes/${ep}`)
    const data = await response.json()

    if (!data.data) {
      episodeDetailCache[cacheKey] = {
        data: {
          number: parseInt(ep),
          title: `Episode ${ep}`,
          airDate: null,
          filler: false,
          recap: false,
          synopsis: null,
        },
        time: now
      }
      return res.json(episodeDetailCache[cacheKey].data)
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

    episodeDetailCache[cacheKey] = { data: result, time: now }

    res.json(result)
  } catch (err) {
    console.error('EPISODE ERROR:', err)
    res.status(500).json({ message: 'Failed to fetch episode data', error: err.message })
  }
})

// GET /api/anime/search
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query
    if (!q) return res.status(400).json({ message: 'Query required' })

    const response = await jikanFetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=10&type=tv`)
    const data = await response.json()

    const results = data.data.map((show) => ({
      id: show.mal_id,
      title: show.title_english || show.title,
      image: show.images?.jpg?.large_image_url || null,
      score: show.score || 0,
      genres: show.genres?.map((g) => g.name) || [],
      episodes: show.episodes || null,
      synopsis: show.synopsis || '',
      year: show.year,
    }))

    res.json({ results })
  } catch (err) {
    console.error('SEARCH ERROR:', err)
    res.status(500).json({ message: 'Search failed', error: err.message })
  }
})

// GET /api/anime/image — image proxy
router.get('/image', async (req, res) => {
  try {
    const { url } = req.query
    if (!url) return res.status(400).json({ message: 'URL required' })

    const response = await fetch(decodeURIComponent(url), {
      headers: { 'User-Agent': 'Queued/1.0' }
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