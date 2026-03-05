const router = require('express').Router();
const Player = require('../models/Player');
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// GET /api/players — list all, optional ?search=name
router.get('/', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }
    const players = await Player.find(filter).populate('owner', 'username email').sort({ overall: -1 });
    res.json(players);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/players/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const player = await Player.findById(req.params.id).populate('owner', 'username email');
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json(player);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/players — admin only
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { name, position, nationality, club, photo, overall, stats, owner } = req.body;
    const player = await Player.create({
      name, position, nationality, club, photo, overall, stats,
      owner: owner || null,
    });
    await player.populate('owner', 'username email');
    res.status(201).json(player);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/players/:id — admin only (full update)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { name, position, nationality, club, photo, overall, stats, owner } = req.body;
    const player = await Player.findByIdAndUpdate(
      req.params.id,
      { name, position, nationality, club, photo, overall, stats, owner: owner || null },
      { new: true, runValidators: true }
    ).populate('owner', 'username email');
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json(player);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/players/:id — admin only
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json({ message: 'Player deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/players/:id/profile — owner or admin: name + photo only
router.patch('/:id/profile', auth, async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ message: 'Player not found' });

    const isAdmin = req.user.role === 'admin';
    const isOwner = player.owner && player.owner.toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to edit this player' });
    }

    // Strip everything except name and photo
    const { name, photo } = req.body;
    if (name !== undefined) player.name = name;
    if (photo !== undefined) player.photo = photo;

    await player.save();
    await player.populate('owner', 'username email');
    res.json(player);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/players/users/list — admin only: get all users for owner dropdown
router.get('/users/list', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('_id username email');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
