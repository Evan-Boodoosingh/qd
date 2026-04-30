const express = require('express')
const router = express.Router()

let cachedSeason = null
let cacheTime = null
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

// GET /api/anime/season — current season
router.get('/season', async (req, res) => {
  try {
    // Return cached data if it's still fresh
    if (cachedSeason && cacheTime && Date.now() - cacheTime < CACHE_DURATION) {
      return res.json(cachedSeason)
    }

    // Fetch from Jikan
    const response = await fetch('https://api.jikan.moe/v4/seasons/now?limit=25')
    const data = await response.json()

    // Transform the data into a cleaner shape for our frontend
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

    // Cache the result
    cachedSeason = { shows, fetchedAt: new Date().toISOString() }
    cacheTime = Date.now()

    res.json(cachedSeason)

  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch season data', error: err.message })
  }
})

// GET /api/anime/show/:id — individual show
router.get('/show/:id', async (req, res) => {
  try {
    const { id } = req.params

    const [showRes, episodesRes] = await Promise.all([
      fetch(`https://api.jikan.moe/v4/anime/${id}/full`),
      fetch(`https://api.jikan.moe/v4/anime/${id}/episodes`),
    ])

    const showData = await showRes.json()
    const episodesData = await episodesRes.json()

    const show = showData.data
    const episodes = episodesData.data || []

    res.json({
      id: show.mal_id,
      title: show.title_english || show.title,
      image: show.images?.jpg?.large_image_url || null,
      score: show.score || 0,
      communityScore: show.score || 0,
      genres: show.genres?.map((g) => g.name) || [],
      themes: show.themes?.map((t) => t.name) || [],
      synopsis: show.synopsis || '',
      trailer: show.trailer?.embed_url || null,
      studio: show.studios?.[0]?.name || 'Unknown',
      episodes: show.episodes || null,
      totalSeasons: 1,
      status: show.status,
      airing: show.airing,
      day: show.broadcast?.day || null,
      time: show.broadcast?.time || null,
      season: show.season,
      year: show.year,
      url: show.url,
      episodeList: episodes.map((ep) => ({
        number: ep.mal_id,
        title: ep.title || `Episode ${ep.mal_id}`,
        airDate: ep.aired || null,
        filler: ep.filler,
        recap: ep.recap,
      })),
    })

  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch show data', error: err.message })
  }
})

// GET /api/anime/search?q=query — search
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query
    if (!q) return res.status(400).json({ message: 'Query required' })

    const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=10&type=tv`)
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
    res.status(500).json({ message: 'Search failed', error: err.message })
  }
})

// GET /api/anime/image?url=... — image proxy
router.get('/image', async (req, res) => {
  try {
    const { url } = req.query
    if (!url) return res.status(400).json({ message: 'URL required' })

    const response = await fetch(decodeURIComponent(url))
    if (!response.ok) throw new Error('Failed to fetch image')

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const buffer = await response.arrayBuffer()

    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.send(Buffer.from(buffer))

  } catch (err) {
    res.status(500).json({ message: 'Image proxy failed', error: err.message })
  }
})

module.exports = router