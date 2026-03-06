const router = require('express').Router();
const Vote = require('../models/Vote');
const auth = require('../middleware/auth');

// GET /api/votes/me — check if the current user has voted
router.get('/me', auth, async (req, res) => {
  try {
    const vote = await Vote.findOne({ user: req.user.id }).populate('player', 'name photo overall position');
    if (!vote) return res.json({ voted: false });
    res.json({ voted: true, player: vote.player });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/votes — cast a vote (one per user)
router.post('/', auth, async (req, res) => {
  try {
    const { playerId } = req.body;
    if (!playerId) return res.status(400).json({ message: 'playerId is required' });

    const existing = await Vote.findOne({ user: req.user.id });
    if (existing) return res.status(409).json({ message: 'You have already voted' });

    const vote = await Vote.create({ user: req.user.id, player: playerId });
    await vote.populate('player', 'name photo overall position');
    res.status(201).json({ voted: true, player: vote.player });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/votes/results — admin only: tally votes per player
router.get('/results', auth, async (req, res) => {
  try {
    const results = await Vote.aggregate([
      { $group: { _id: '$player', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $lookup: { from: 'players', localField: '_id', foreignField: '_id', as: 'player' } },
      { $unwind: '$player' },
      { $project: { _id: 0, player: { name: 1, photo: 1, overall: 1 }, count: 1 } },
    ]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
