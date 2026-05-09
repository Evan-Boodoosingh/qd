// server/routes/friends.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Watchlist = require("../models/Watchlist");
const auth = require("../middleware/auth");

// POST /api/friends/request/:username
router.post("/request/:username", auth, async (req, res) => {
  try {
    const sender = await User.findById(req.user.userId);
    const recipient = await User.findOne({ username: req.params.username });

    if (!recipient) return res.status(404).json({ message: "User not found" });
    if (recipient._id.equals(sender._id))
      return res.status(400).json({ message: "Cannot add yourself" });

    const senderFriends = sender.friends || [];
    const alreadyFriends = senderFriends.some((id) => id.equals(recipient._id));
    if (alreadyFriends)
      return res.status(400).json({ message: "Already friends" });

    const recipientRequests = recipient.friendRequests || [];
    const alreadyRequested = recipientRequests.some(
      (r) => r.from.equals(sender._id) && r.status === "pending",
    );
    if (alreadyRequested)
      return res.status(400).json({ message: "Request already sent" });

    if (!recipient.friendRequests) recipient.friendRequests = [];
    recipient.friendRequests.push({ from: sender._id, status: "pending" });
    await recipient.save();

    res.json({ message: "Friend request sent" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to send request", error: err.message });
  }
});

// PATCH /api/friends/request/:id/accept
router.patch("/request/:id/accept", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const request = user.friendRequests.id(req.params.id);

    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "accepted";
    if (!user.friends) user.friends = [];
    if (!user.friends.some((id) => id.equals(request.from))) {
      user.friends.push(request.from);
    }
    await user.save();

    await User.findByIdAndUpdate(request.from, {
      $addToSet: { friends: user._id },
    });

    res.json({ message: "Friend request accepted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to accept request", error: err.message });
  }
});

// PATCH /api/friends/request/:id/decline
router.patch("/request/:id/decline", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const request = user.friendRequests.id(req.params.id);

    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "declined";
    await user.save();

    res.json({ message: "Friend request declined" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to decline request", error: err.message });
  }
});

// DELETE /api/friends/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const friendId = req.params.id;

    user.friends = (user.friends || []).filter(
      (id) => id.toString() !== friendId,
    );
    await user.save();

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: user._id },
    });

    res.json({ message: "Friend removed" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to remove friend", error: err.message });
  }
});

// GET /api/friends
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate(
      "friends",
      "username displayName",
    );

    res.json(user.friends || []);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch friends", error: err.message });
  }
});

// GET /api/friends/requests/sent
// Get all pending requests you've sent to others
router.get("/requests/sent", auth, async (req, res) => {
  try {
    // Find all users who have a pending request from me
    const usersWithMyRequest = await User.find({
      friendRequests: {
        $elemMatch: {
          from: req.user.userId,
          status: "pending",
        },
      },
    }).select("username displayName");

    res.json(usersWithMyRequest);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch sent requests", error: err.message });
  }
});

// GET /api/friends/requests
router.get("/requests", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate({
      path: "friendRequests.from",
      select: "username displayName",
      strictPopulate: false,
    });

    const pending = (user.friendRequests || []).filter(
      (r) => r.status === "pending",
    );
    res.json(pending);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch requests", error: err.message });
  }
});

// GET /api/friends/suggested
router.get("/suggested", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const myFriendIds = (user.friends || []).map((id) => id.toString());

    // Collect IDs of people I've already sent a pending request to
    // by checking their friendRequests collections
    const pendingSentTo = await User.find({
      friendRequests: {
        $elemMatch: {
          from: req.user.userId,
          status: "pending",
        },
      },
    }).select("_id");
    const pendingSentIds = pendingSentTo.map((u) => u._id.toString());

    // Find friends of friends who aren't already my friends
    // and haven't already received a request from me
    const friendsOfFriends = await User.find({
      _id: {
        $in: await User.find({ _id: { $in: user.friends } }).then((friends) =>
          friends.flatMap((f) => f.friends || []),
        ),
      },
      $and: [
        { _id: { $nin: [req.user.userId, ...myFriendIds] } },
        { _id: { $nin: pendingSentIds } },
      ],
    }).select("username displayName friends");

    if (friendsOfFriends.length === 0) return res.json([]);

    const myList = await Watchlist.find({ user: req.user.userId });
    const myShowIds = new Set(myList.map((e) => e.showId));

    const scored = friendsOfFriends.map((person) => {
      const mutualCount = (person.friends || []).filter((id) =>
        myFriendIds.includes(id.toString()),
      ).length;

      return {
        _id: person._id,
        username: person.username,
        displayName: person.displayName,
        mutualFriends: mutualCount,
        sharedShows: 0,
      };
    });

    const theirLists = await Watchlist.find({
      user: { $in: friendsOfFriends.map((f) => f._id) },
    });

    for (const entry of theirLists) {
      const person = scored.find(
        (p) => p._id.toString() === entry.user.toString(),
      );
      if (person && myShowIds.has(entry.showId)) {
        person.sharedShows++;
      }
    }

    const sorted = scored
      .sort(
        (a, b) =>
          b.mutualFriends - a.mutualFriends || b.sharedShows - a.sharedShows,
      )
      .slice(0, 10);

    res.json(sorted);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch suggestions", error: err.message });
  }
});

// GET /api/friends/compatibility/:username
router.get("/compatibility/:username", auth, async (req, res) => {
  try {
    const other = await User.findOne({ username: req.params.username });
    if (!other) return res.status(404).json({ message: "User not found" });

    const [myList, theirList] = await Promise.all([
      Watchlist.find({ user: req.user.userId }),
      Watchlist.find({ user: other._id }),
    ]);

    const myShowIds = new Set(myList.map((e) => e.showId));
    const theirShowIds = new Set(theirList.map((e) => e.showId));
    const sharedShows = [...myShowIds].filter((id) => theirShowIds.has(id));

    const myGenreSet = new Set(myList.flatMap((e) => e.genres));
    const theirGenreSet = new Set(theirList.flatMap((e) => e.genres));
    const sharedGenres = [...myGenreSet].filter((g) => theirGenreSet.has(g));

    const showScore = Math.min(
      (sharedShows.length / Math.max(myShowIds.size, 1)) * 70,
      70,
    );
    const genreScore = Math.min(
      (sharedGenres.length / Math.max(myGenreSet.size, 1)) * 30,
      30,
    );
    const compatibility = Math.round(showScore + genreScore);

    res.json({
      compatibility,
      sharedShows: sharedShows.length,
      sharedGenres: sharedGenres.length,
    });
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Failed to calculate compatibility",
        error: err.message,
      });
  }
});

module.exports = router;
