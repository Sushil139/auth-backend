const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const holidaySchema = new mongoose.Schema(
  {
    name: String,
    date: Date,
    discount: Number,
    coupon: String,
  },
  { _id: false }
);

const locationDeals = new mongoose.Schema(
  {
    countryName: String,
    discount: Number,
    coupon: String,
  },
  { _id: false }
);

const dealSchema = new mongoose.Schema({
  dealName: String,
  description: String,
  link: String,
  uuid: {
    type: String,
    default: uuidv4,
    index: true,
  },
  holidays: [holidaySchema],
  locationDeals: [locationDeals],
  visitors: {
    type: Number,
    default: 0,
  },
  visitorsPerDay: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      count: {
        type: Number,
        default: 0,
      },
      uniqueCount: {
        type: Number,
        default: 0,
      },
      countryVisitors: [{ country: String, count: Number }],
    },
  ],
  uniqueVisitors: { type: [String], default: [] },
});

module.exports = mongoose.model.Deal || mongoose.model('Deal', dealSchema);
