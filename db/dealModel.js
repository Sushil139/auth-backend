const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema({
    name: String,
    date: Date,
    discount: Number,
    coupon: String
}, { _id: false });

const locationDeals = new mongoose.Schema({
    countryName: String,
    discount: Number,
    coupon: String
}, { _id: false });

const dealSchema = new mongoose.Schema({
    dealName: String,
    description: String,
    link: String,
    uuid: String,
    holidays: [holidaySchema],
    locationDeals: [locationDeals]
});


module.exports = mongoose.model.Deal || mongoose.model("Deal", dealSchema);