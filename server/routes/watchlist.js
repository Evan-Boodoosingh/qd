const express = require('express')
const router = express.Router()
const Watchlist = require('../models/Watchlist')
const auth = require('../middleware/auth')
const User = require('../models/User')

// GET /api/watchlist — get logged in user's full watchlist
router.get('/', auth, async (req, res) => {
  try {
    const watchlist = await Watchlist.find({ user: req.user.userId }).sort({ updatedAt: -1 })
    res.json(watchlist)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch watchlist', error: err.message })
  }
})

// POST /api/watchlist — add show to list
router.post('/', auth, async (req, res) => {
  try {
    const { showId, showName, image, status, totalEpisodes, genres } = req.body

    const existing = await Watchlist.findOne({ user: req.user.userId, showId })
    if (existing) {
      return res.status(400).json({ message: 'Show already on your list' })
    }

    const entry = new Watchlist({
      user: req.user.userId,
      showId,
      showName,
      image,
      status: status || 'planToWatch',
      totalEpisodes,
      genres,
    })

    await entry.save()
    res.status(201).json(entry)
  } catch (err) {
    res.status(500).json({ message: 'Failed to add to watchlist', error: err.message })
  }
})

// PATCH /api/watchlist/:showId — update episode, status, or rating
router.patch('/:showId', auth, async (req, res) => {
  try {
    const { status, currentEpisode, rating } = req.body

    const entry = await Watchlist.findOne({ user: req.user.userId, showId: req.params.showId })
    if (!entry) return res.status(404).json({ message: 'Show not on your list' })

    if (status !== undefined) entry.status = status
    if (currentEpisode !== undefined) entry.currentEpisode = currentEpisode
    if (rating !== undefined) entry.rating = rating

    await entry.save()
    res.json(entry)
  } catch (err) {
    res.status(500).json({ message: 'Failed to update watchlist', error: err.message })
  }
})

// DELETE /api/watchlist/:showId — remove show from list
router.delete('/:showId', auth, async (req, res) => {
  try {
    const entry = await Watchlist.findOneAndDelete({ user: req.user.userId, showId: req.params.showId })
    if (!entry) return res.status(404).json({ message: 'Show not on your list' })
    res.json({ message: 'Removed from watchlist' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove from watchlist', error: err.message })
  }
})

module.exports = router