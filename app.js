const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');

// require database connection
const dbConnect = require("./db/dbConnect");
const User = require("./db/userModel");
const Deal = require("./db/dealModel");
const auth = require("./auth");

// execute database connection
dbConnect();

// Curb Cores Error by adding a header here
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// body parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (request, response, next) => {
  response.json({ message: "Hey! This is your server response!" });
  next();
});

// register endpoint
app.post("/register", (request, response) => {
  // hash the password
  bcrypt
    .hash(request.body.password, 10)
    .then((hashedPassword) => {
      // create a new user instance and collect the data
      const user = new User({
        email: request.body.email,
        password: hashedPassword,
        uuid:  uuidv4()
      });

      // save the new user
      user
        .save()
        // return success if the new user is added to the database successfully
        .then((result) => {
          response.status(201).send({
            message: "User Created Successfully",
            result,
          });
        })
        // catch erroe if the new user wasn't added successfully to the database
        .catch((error) => {
          response.status(500).send({
            message: "Error creating user",
            error,
          });
        });
    })
    // catch error if the password hash isn't successful
    .catch((e) => {
      response.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
});

// login endpoint
app.post("/login", (request, response) => {
  // check if email exists
  User.findOne({ email: request.body.email })

    // if email exists
    .then((user) => {
      // compare the password entered and the hashed password found
      bcrypt
        .compare(request.body.password, user.password)

        // if the passwords match
        .then((passwordCheck) => {

          // check if password matches
          if(!passwordCheck) {
            return response.status(400).send({
              message: "Passwords does not match",
              error,
            });
          }

          //   create JWT token
          const token = jwt.sign(
            {
              userId: user.uuid,
              userEmail: user.email,
            },
            "RANDOM-TOKEN",
            { expiresIn: "24h" }
          );

          //   return success response
          response.status(200).send({
            message: "Login Successful",
            email: user.email,
            token,
          });
        })
        // catch error if password do not match
        .catch((error) => {
          response.status(400).send({
            message: "Passwords does not match",
            error,
          });
        });
    })
    // catch error if email does not exist
    .catch((e) => {
      response.status(404).send({
        message: "Email not found",
        e,
      });
    });
});

// free endpoint
app.get("/free-endpoint", (request, response) => {
  response.json({ message: "You are free to access me anytime" });
});

// authentication endpoint
app.get("/auth-endpoint", auth, (request, response) => {
  response.send({ message: "You are authorized to access me" });
});

// create deals endpoint
app.post('/deal', auth, async (req, res) => {
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

app.put('/deal/:id', auth, async (req, res) => {
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

app.delete('/deal/:id', auth, async (req, res) => {
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

app.get('/deals', auth, async (req, res) => {
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

module.exports = app;
