const express = require('express')
const router = express.Router()
const Thread = require('../models/Thread')
const User = require('../models/User')
const auth = require('../middleware/auth')

router.get('/:id', async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id)
    if (!thread) return res.status(404).json({ message: 'Thread not found' })
    res.json(thread)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch thread', error: err.message })
  }
})

router.get('/', async (req, res) => {
  try {
    const threads = await Thread.find().sort({ createdAt: -1 }).limit(50)
    res.json(threads)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch threads', error: err.message })
  }
})

router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const { show, showId, threadTitle, threadType, season, episode, hasSpoiler, originalPost } = req.body

    const thread = new Thread({
      show,
      showId,
      threadTitle,
      threadType,
      season,
      episode,
      hasSpoiler,
      originalPost,
      createdBy: user._id,
      username: user.username,
    })

    await thread.save()
    res.status(201).json(thread)
  } catch (err) {
    res.status(500).json({ message: 'Failed to create thread', error: err.message })
  }
})

router.post('/:id/replies', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const { content, hasSpoiler } = req.body
    const thread = await Thread.findById(req.params.id)
    if (!thread) return res.status(404).json({ message: 'Thread not found' })

    thread.replies.push({
      user: user._id,
      username: user.username,
      content,
      hasSpoiler: hasSpoiler || false,
    })

    await thread.save()
    res.status(201).json(thread)
  } catch (err) {
    res.status(500).json({ message: 'Failed to post reply', error: err.message })
  }
})

router.patch('/:id/replies/:replyId/like', auth, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id)
    if (!thread) return res.status(404).json({ message: 'Thread not found' })

    const reply = thread.replies.id(req.params.replyId)
    if (!reply) return res.status(404).json({ message: 'Reply not found' })

    const alreadyLiked = reply.likes.includes(req.user.userId)
    if (alreadyLiked) {
      reply.likes = reply.likes.filter(id => id.toString() !== req.user.userId)
    } else {
      reply.likes.push(req.user.userId)
    }

    await thread.save()
    res.json(thread)
  } catch (err) {
    res.status(500).json({ message: 'Failed to like reply', error: err.message })
  }
})

router.patch('/:id/replies/:replyId/flag', auth, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id)
    if (!thread) return res.status(404).json({ message: 'Thread not found' })

    const reply = thread.replies.id(req.params.replyId)
    if (!reply) return res.status(404).json({ message: 'Reply not found' })

    if (!reply.spoilerFlags.includes(req.user.userId)) {
      reply.spoilerFlags.push(req.user.userId)
    }

    if (reply.spoilerFlags.length >= 5) {
      reply.hasSpoiler = true
    }

    await thread.save()
    res.json(thread)
  } catch (err) {
    res.status(500).json({ message: 'Failed to flag reply', error: err.message })
  }
})

router.post('/:id/replies/:replyId/report', auth, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id)
    if (!thread) return res.status(404).json({ message: 'Thread not found' })

    const reply = thread.replies.id(req.params.replyId)
    if (!reply) return res.status(404).json({ message: 'Reply not found' })

    if (!reply.reports.includes(req.user.userId)) {
      reply.reports.push(req.user.userId)
    }

    await thread.save()
    res.json({ message: 'Reply reported' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to report reply', error: err.message })
  }
})

module.exports = router