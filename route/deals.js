const express = require("express");
const router = express.Router();

// require database connection
const dbConnect = require("../db/dbConnect");
const Deal = require("../db/dealModel");
const auth = require("../auth");

// execute database connection
dbConnect();

// create deals endpoint
router.post('/deal', auth, async (req, res) => {
    try {
      const deal = new Deal({
        ...req.body,
        uuid: req.user.userId
        // user: req.user.userId
      });
      await deal.save();
      res.status(201).send(deal);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });
  
router.put('/deal/:id', auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['dealName', 'description', 'link', 'holidays', 'locationDeals'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid updates!' });
    }

    const deal = await Deal.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    console.log("req.body", req.body);
    console.log("deals", deal);
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

router.get('/deals', auth, async (req, res) => {
  try {
    console.log("req.user", req.user);
    const deals = await Deal.find({ uuid: req.user.userId });
    console.log("deals", deals);
    if (deals.length === 0) {
      return res.status(404).send({ message: 'No deals found' });
    }

    res.send(deals);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;