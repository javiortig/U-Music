const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: false
    },
    nickname: {
      type: String,
      required: true,
      unique: true,
      index: true 
    },
    password: {
      type: String,
      required: true
    },
    bio: {
      type: String
    },
    instruments: {
      type: [String],
      required: true
    },
    availabilitySchedule: {
      monday: [{ type: String }],
      tuesday: [{ type: String }],
      wednesday: [{ type: String }],
      thursday: [{ type: String }],
      friday: [{ type: String }],
      saturday: [{ type: String }],
      sunday: [{ type: String }]
    },
    receiveNotifications: {
      type: Boolean,
      required: true,
      default: true
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      required: true,
      default: 'user'
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
