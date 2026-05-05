const mongoose = require('mongoose')

const replySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  content: { type: String, required: true },
  hasSpoiler: { type: Boolean, default: false },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  spoilerFlags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies: [],
}, { timestamps: true })

const threadSchema = new mongoose.Schema({
  show: { type: String, required: true },
  showId: { type: Number },
  genres: [{ type: String }],
  threadTitle: { type: String, required: true },
  threadType: { type: String, enum: ['episode', 'season', 'show'], required: true },
  season: { type: Number },
  episode: { type: Number },
  hasSpoiler: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  originalPost: { type: String, required: true },
  replies: [replySchema],
  spoilerReports: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

module.exports = mongoose.model('Thread', threadSchema)