const mongoose = require('mongoose')

const watchlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  showId: { type: Number, required: true },
  showName: { type: String, required: true },
  image: { type: String },
  status: {
    type: String,
    enum: ['watching', 'planToWatch', 'completed', 'dropped'],
    default: 'planToWatch'
  },
  currentEpisode: { type: Number, default: 0 },
  totalEpisodes: { type: Number },
  airingEpisode: { type: Number },
  rating: { type: Number, min: 1, max: 10 },
  genres: [String],
  subbed: { type: Boolean, default: true },
  dubbed: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Watchlist', watchlistSchema)