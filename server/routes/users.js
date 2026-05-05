const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Watchlist = require("../models/Watchlist");
const Thread = require("../models/Thread");
const auth = require("../middleware/auth");

// POST /api/users/register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/users/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/users/me — get your own full profile
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password")
    if (!user) return res.status(404).json({ message: "User not found" })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message })
  }
});

// GET /api/users/profile/:username — get any user's public profile
// Returns user info, watch stats, and recent threads
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-password -email -friendRequests")
    if (!user) return res.status(404).json({ message: "User not found" })

    const watchlist = await Watchlist.find({ user: user._id })
    const threads = await Thread.find({ createdBy: user._id })
      .sort({ createdAt: -1 })
      .limit(20)

    // Calculate stats
    const completed = watchlist.filter(e => e.status === "completed")
    const episodesWatched = watchlist.reduce((sum, e) => sum + (e.currentEpisode || 0), 0)
    const daysWatched = Math.round((episodesWatched * 24) / 60 / 24 * 10) / 10

    res.json({
      user,
      stats: {
        showsWatched: completed.length,
        episodesWatched,
        daysWatched,
        discussionsStarted: threads.length,
      },
      watchlist,
      threads,
    })
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message })
  }
});

// PATCH /api/users/me — update your own profile
router.patch("/me", auth, async (req, res) => {
  try {
    const { displayName, bio, username, email, password } = req.body
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ message: "User not found" })

    // Check username/email not taken by someone else
    if (username && username !== user.username) {
      const taken = await User.findOne({ username })
      if (taken) return res.status(400).json({ message: "Username already taken" })
      user.username = username
    }

    if (email && email !== user.email) {
      const taken = await User.findOne({ email })
      if (taken) return res.status(400).json({ message: "Email already in use" })
      user.email = email
    }

    if (displayName !== undefined) user.displayName = displayName
    if (bio !== undefined) user.bio = bio
    if (password) user.password = password

    await user.save()

    const updated = await User.findById(user._id).select("-password")
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message })
  }
});


// GET /api/users/search?q= — search users by username or displayName
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query
    if (!q) return res.json([])
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { displayName: { $regex: q, $options: 'i' } },
      ]
    }).select('username displayName').limit(10)
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: 'Search failed', error: err.message })
  }
})


module.exports = router;