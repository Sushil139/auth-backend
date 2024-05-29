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
    var currentDate = moment().format('YYYY-MM-DD');

    console.log('currentDate', currentDate);
    // Fetch the deal document from the database
    const deal = await Deal.findOne({ _id: id });

    if (!deal) {
      return res.status(404).send({ message: 'Deal not found.' });
    }

    // Increment the total visitor count
    deal.visitors++;

    const isUnique = deal.uniqueVisitors ? !deal.uniqueVisitors.includes(ip) : true;
    if (isUnique) {
      deal.uniqueVisitors.push(ip);
    }

    console.log('unique', isUnique, deal.uniqueVisitors);
    // Increment the daily visitor count
    if (deal.visitorsPerDay.length === 0) {
      dailyVisitors = {
        date: new Date(currentDate),
        count: 1,
        uniqueCount: isUnique ? 1 : 0,
        countryVisitors: [{
          country: userLocation,
          count: 1
        }]
      };
      deal.visitorsPerDay.push(dailyVisitors);
    } else {
      const lastEntry = deal.visitorsPerDay[deal.visitorsPerDay.length - 1];
      if (moment(lastEntry.date).format('YYYY-MM-DD') === currentDate) {
        lastEntry.count++;
        if (isUnique) {
          lastEntry.uniqueCount++;
        }
        const countryVisitor = lastEntry.countryVisitors.find(v => v.country === userLocation);
        if (countryVisitor) {
          countryVisitor.count++;
        } else {
          lastEntry.countryVisitors.push({
            country: userLocation,
            count: 1
          });
        }

        console.log('lastEntry', lastEntry);
        deal.visitorsPerDay[deal.visitorsPerDay.length - 1] = lastEntry;
      } else {
        dailyVisitors = {
          date: new Date(currentDate),
          count: 1,
          uniqueCount: isUnique ? 1 : 0,
          countryVisitors: [{
            country: userLocation,
            count: 1
          }]
        };
        deal.visitorsPerDay.push(dailyVisitors);
      }
    }

    console.log('dealwww', deal);
    await deal.save();

    currentDate = moment().format('MM-DD');

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

router.get('/country-parity', auth, (req, res) => {
  const response = [
    {
      range: '0.0-0.1',
      countries: [],
      coupon: '',
      discount: null,
    },
    {
      range: '0.1-0.2',
      countries: [],
      coupon: '',
      discount: null,
    },
    {
      range: '0.2-0.3',
      coupon: '',
      discount: 60.0,
      countries: [
        {
          country: 'IN',
          countryName: 'India',
        },
      ],
    },
    {
      range: '0.4-0.5',
      coupon: '',
      discount: 60.0,
      countries: [
        {
          country: 'ZA',
          countryName: 'South Africa',
        },
        {
          country: 'RU',
          countryName: 'Russia',
        },
      ],
    },
    {
      range: '0.5-0.6',
      coupon: '',
      discount: 60.0,
      countries: [
        {
          country: 'CN',
          countryName: 'China',
        },
        {
          country: 'PT',
          countryName: 'Portugal',
        },
      ],
    },
    {
      range: '0.8-0.9',
      coupon: '',
      discount: 60.0,
      countries: [
        {
          country: 'GB',
          countryName: 'United Kingdom',
        },
        {
          country: 'IE',
          countryName: 'Ireland',
        },
        {
          country: 'AE',
          countryName: 'United Arab Emirates',
        },
        {
          country: 'FI',
          countryName: 'Finland',
        },
        {
          country: 'GEN',
          countryName: 'Germany',
        },
      ],
    },
    {
      range: '0.9-1.0',
      coupon: '',
      discount: 60.0,
      countries: [
        {
          country: 'CA',
          countryName: 'Canada',
        },
        {
          country: 'US',
          countryName: 'United States of America',
        },
      ],
    },
    {
      range: '1.0-1.1',
      coupon: '',
      discount: 60.0,
      countries: [
        {
          country: 'AU',
          countryName: 'Australia',
        },
      ],
    },
    {
      range: '1.2-1.3',
      countries: [],
      coupon: '',
      discount: 60.0,
    },
    {
      range: '1.3-1.4',
      countries: [],
      coupon: '',
      discount: 60.0,
    },
    {
      range: '1.7-1.8',
      countries: [],
      coupon: '',
      discount: 60.0,
    },
  ];

  res.send(response);
});

module.exports = router;
