const express = require('express');
const router = express.Router();
const moment = require('moment');
const axios = require('axios');

// require database connection
const dbConnect = require('../db/dbConnect');
const Deal = require('../db/dealModel');
const auth = require('../auth');

// execute database connection
dbConnect();

// create deals endpoint
router.post('/deal', auth, (req, res) => {
  console.log('req.body', req.body);
  try {
    const deal = new Deal({
      ...req.body,
      uuid: req.user.userId,
      // user: req.user.userId
    });
    deal.save();
    res.status(201).send(deal);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.put('/deal/:id', auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      'dealName',
      'description',
      'link',
      'holidays',
      'locationDeals',
    ];
    const isValidOperation = updates.every(update =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid updates!' });
    }

    const deal = await Deal.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    });

    console.log('req.body', req.body);
    console.log('deals', deal);
    if (!deal) {
      return res.status(404).send({ message: 'Deal not found' });
    }

    res.send(deal);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.delete('/deal/:id', auth, async (req, res) => {
  try {
    const deal = await Deal.findOneAndDelete({ _id: req.params.id });

    if (!deal) {
      return res.status(404).send({ message: 'Deal not found' });
    }

    res.send('Deal deleted successfully');
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    console.log('req.user', req.user);
    const deals = await Deal.find({ uuid: req.user.userId });
    console.log('deals', deals);
    if (deals.length === 0) {
      return res.status(404).send({ message: 'No deals found' });
    }

    res.send(deals);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get('/deal/:id', auth, async (req, res) => {
  try {
    console.log('req.user', req.user);
    const deals = await Deal.findOne({ _id: req.params.id });
    console.log('deals', deals);
    if (deals === null) {
      return res.status(404).send({ message: 'No deals found' });
    }

    res.send(deals);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get('/discount/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Fetch the location data from ipapi
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    console.log('response', response.data);
    const userLocation = response.data.country_name;

    console.log('userLocation', userLocation);
    const currentDate = moment().format('MM-DD');

    // Fetch the deal document from the database
    const deal = await Deal.findOne({ _id: id });

    if (!deal) {
      return res.status(404).send({ message: 'Deal not found.' });
    }

    // Extract the location-based and holiday-based discounts
    locationDiscount = 0;

    if (userLocation !== undefined) {
      locationDiscount = deal.locationDeals.find(
        deal => deal.countryName.toUpperCase() === userLocation.toUpperCase()
      );
    }

    const holidayDiscount = deal.holidays.find(
      holiday => moment(holiday.date).format('MM-DD') === currentDate
    );

    let discount;
    let message;

    // Compare the discounts and construct the response message
    if (!locationDiscount && !holidayDiscount) {
      message = 'No discounts available at the moment.';
    } else if (
      !holidayDiscount ||
      (locationDiscount && locationDiscount.discount > holidayDiscount.discount)
    ) {
      discount = locationDiscount.discount;
      message = `Hey! ${userLocation} is a wonderful place. Try ${locationDiscount.coupon} to get ${discount}% off.`;
    } else {
      discount = holidayDiscount.discount;
      message = `Hey! Today is ${holidayDiscount.name}. Get ${discount}% off by applying ${holidayDiscount.coupon}.`;
    }

    res.send({ message, discount });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});
module.exports = router;
