const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  position: { type: String, required: true, trim: true },
  nationality: { type: String, default: '', trim: true },
  club: { type: String, default: 'Cool Soccer For Cool People' },
  photo: { type: String, default: '' },
  overall: { type: Number, min: 1, max: 99, required: true },
  stats: {
    pac: { type: Number, min: 1, max: 99, default: 50 },
    sho: { type: Number, min: 1, max: 99, default: 50 },
    pas: { type: Number, min: 1, max: 99, default: 50 },
    dri: { type: Number, min: 1, max: 99, default: 50 },
    def: { type: Number, min: 1, max: 99, default: 50 },
    phy: { type: Number, min: 1, max: 99, default: 50 },
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema);
