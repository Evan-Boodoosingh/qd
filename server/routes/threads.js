const express = require('express')
const router = express.Router()
const Thread = require('../models/Thread')
const User = require('../models/User')
const auth = require('../middleware/auth')
const mongoose = require('mongoose')

// GET /api/threads
router.get('/', async (req, res) => {
  try {
    const { showId } = req.query
    const query = showId ? { showId: Number(showId) } : {}
    const threads = await Thread.find(query).sort({ createdAt: -1 }).limit(50)
    res.json(threads)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch threads', error: err.message })
  }
})

// GET /api/threads/friends
// Must be before /:id so Express doesn't match 'friends' as an id param
router.get('/friends', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const friendIds = user.friends || []
    
    if (friendIds.length === 0) return res.json([])

      console.log('friendIds raw:', friendIds)
console.log('friendIds types:', friendIds.map(id => typeof id + ' : ' + id))
console.log('thread createdBy should match one of these')



    const friendObjectIds = friendIds.map(id => new mongoose.Types.ObjectId(id))

    const threads = await Thread.aggregate([
      {
        $match: {
          $or: [
            { createdBy: { $in: friendObjectIds } },
            { 'replies.user': { $in: friendObjectIds } },
            { likes: { $in: friendObjectIds } },
          ]
        }
      },
      { $sort: { updatedAt: -1 } },
      { $limit: 30 },
      {
        $addFields: {
          friendParticipations: {
            $reduce: {
              input: friendObjectIds,
              initialValue: [],
              in: {
                $let: {
                  vars: {
                    isCreator: { $eq: ['$createdBy', '$$this'] },
                    hasReplied: {
                      $gt: [
                        {
                          $size: {
                            $filter: {
                              input: '$replies',
                              as: 'reply',
                              cond: { $eq: ['$$reply.user', '$$this'] }
                            }
                          }
                        },
                        0
                      ]
                    },
                    hasLiked: { $in: ['$$this', '$likes'] },
                  },
                  in: {
                    $cond: {
                      if: { $or: ['$$isCreator', '$$hasReplied', '$$hasLiked'] },
                      then: {
                        $concatArrays: [
                          '$$value',
                          [{
                            friendId: '$$this',
                            type: {
                              $switch: {
                                branches: [
                                  { case: '$$isCreator', then: 'created' },
                                  { case: '$$hasReplied', then: 'replied' },
                                  { case: '$$hasLiked', then: 'liked' },
                                ],
                                default: 'interacted'
                              }
                            }
                          }]
                        ]
                      },
                      else: '$$value'
                    }
                  }
                }
              }
            }
          }
        }
      },
      {
        $match: {
          'friendParticipations.0': { $exists: true }
        }
      },
      {
        $project: {
          show: 1,
          showId: 1,
          threadTitle: 1,
          threadType: 1,
          season: 1,
          episode: 1,
          originalPost: 1,
          hasSpoiler: 1,
          username: 1,
          createdBy: 1,
          likes: 1,
          replyCount: { $size: '$replies' },
          createdAt: 1,
          updatedAt: 1,
          friendParticipations: 1,
        }
      }
    ])

    const friendDetails = await User.find(
      { _id: { $in: friendObjectIds } },
      { _id: 1, username: 1, displayName: 1 }
    )
    const friendMap = {}
    for (const f of friendDetails) {
      friendMap[f._id.toString()] = f
    }

    const enriched = threads.map(thread => ({
      ...thread,
      friendParticipations: thread.friendParticipations.map(p => ({
        ...p,
        friend: friendMap[p.friendId.toString()] || null,
      }))
    }))

    res.json(enriched)
  } catch (err) {
    console.error('FRIENDS THREADS ERROR:', err)
    res.status(500).json({ message: 'Failed to fetch friend threads', error: err.message })
  }
})

// GET /api/threads/:id
router.get('/:id', async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id)
    if (!thread) return res.status(404).json({ message: 'Thread not found' })
    res.json(thread)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch thread', error: err.message })
  }
})

// POST /api/threads
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })
    const { show, showId, genres, threadTitle, threadType, season, episode, hasSpoiler, originalPost } = req.body
    const thread = new Thread({
      show,
      showId,
      genres: genres || [],
      threadTitle,
      threadType,
      season,
      episode,
      hasSpoiler,
      originalPost,
      createdBy: user._id,
      username: user.username
    })
    await thread.save()
    res.status(201).json(thread)
  } catch (err) {
    res.status(500).json({ message: 'Failed to create thread', error: err.message })
  }
})

// PATCH /api/threads/:id/like
router.patch('/:id/like', auth, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id)
    if (!thread) return res.status(404).json({ message: 'Thread not found' })
    const alreadyLiked = thread.likes.includes(req.user.userId)
    if (alreadyLiked) {
      thread.likes = thread.likes.filter(id => id.toString() !== req.user.userId)
    } else {
      thread.likes.push(req.user.userId)
    }
    await thread.save()
    res.json(thread)
  } catch (err) {
    res.status(500).json({ message: 'Failed to like thread', error: err.message })
  }
})

// POST /api/threads/:id/replies
router.post('/:id/replies', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })
    const { content, hasSpoiler } = req.body
    const thread = await Thread.findById(req.params.id)
    if (!thread) return res.status(404).json({ message: 'Thread not found' })
    thread.replies.push({ user: user._id, username: user.username, content, hasSpoiler: hasSpoiler || false })
    await thread.save()
    res.status(201).json(thread)
  } catch (err) {
    res.status(500).json({ message: 'Failed to post reply', error: err.message })
  }
})

// PATCH /api/threads/:id/replies/:replyId/like
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

// PATCH /api/threads/:id/replies/:replyId/flag
router.patch('/:id/replies/:replyId/flag', auth, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id)
    if (!thread) return res.status(404).json({ message: 'Thread not found' })
    const reply = thread.replies.id(req.params.replyId)
    if (!reply) return res.status(404).json({ message: 'Reply not found' })
    if (!reply.spoilerFlags.includes(req.user.userId)) reply.spoilerFlags.push(req.user.userId)
    if (reply.spoilerFlags.length >= 5) reply.hasSpoiler = true
    await thread.save()
    res.json(thread)
  } catch (err) {
    res.status(500).json({ message: 'Failed to flag reply', error: err.message })
  }
})

// POST /api/threads/:id/replies/:replyId/report
router.post('/:id/replies/:replyId/report', auth, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id)
    if (!thread) return res.status(404).json({ message: 'Thread not found' })
    const reply = thread.replies.id(req.params.replyId)
    if (!reply) return res.status(404).json({ message: 'Reply not found' })
    if (!reply.reports.includes(req.user.userId)) reply.reports.push(req.user.userId)
    await thread.save()
    res.json({ message: 'Reply reported' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to report reply', error: err.message })
  }
})

module.exports = router