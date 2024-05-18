const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// require database connection
const dbConnect = require('../db/dbConnect');
const User = require('../db/userModel');
const validateRegisterInput = require('./../validation/register');
const validateLoginInput = require('./../validation/login');

// execute database connection
dbConnect();

// Curb Cores Error by adding a header here
router.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  next();
});

// body parser configuration
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', (request, response, next) => {
  response.json({ message: 'Hey! This is your server response!' });
  next();
});

// register endpoint
router.post('/register', (request, response) => {
  console.log('register');
  const { errors, isValid } = validateRegisterInput(request.body);
  if (!isValid) {
    return response.status(400).json(errors);
  }

  // hash the password
  User.findOne({ email: request.body.email }).then(user => {
    if (user) {
      return response.status(400).json({ email: 'Email already exists' });
    } else {
      console.log('request', request.body);
      bcrypt
        .hash(request.body.password, 10)
        .then(hashedPassword => {
          // create a new user instance and collect the data
          const user = new User({
            email: request.body.email,
            password: hashedPassword,
            uuid: uuidv4(),
          });

          // save the new user
          user
            .save()
            // return success if the new user is added to the database successfully
            .then(result => {
              response.status(201).send({
                message: 'User Created Successfully',
                result,
              });
            })
            // catch erroe if the new user wasn't added successfully to the database
            .catch(error => {
              response.status(500).send({
                message: 'Error creating user',
                error,
              });
            });
        })
        // catch error if the password hash isn't successful
        .catch(e => {
          response.status(500).send({
            message: 'Password was not hashed successfully',
            e,
          });
        });
    }
  });
});

// login endpoint
router.post('/login', (request, response) => {
  console.log('login', request);
  const { errors, isValid } = validateLoginInput(request.body);
  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  // check if email exists
  User.findOne({ email: request.body.email })

    // if email exists
    .then(user => {
      // compare the password entered and the hashed password found
      bcrypt
        .compare(request.body.password, user.password)

        // if the passwords match
        .then(passwordCheck => {
          // check if password matches
          if (!passwordCheck) {
            return response.status(400).send({
              message: 'Passwords does not match',
              error,
            });
          }

          //   create JWT token
          const token = jwt.sign(
            {
              userId: user.uuid,
              userEmail: user.email,
            },
            'RANDOM-TOKEN',
            { expiresIn: '24h' }
          );

          //   return success response
          response.status(200).send({
            message: 'Login Successful',
            email: user.email,
            token,
          });
        })
        // catch error if password do not match
        .catch(error => {
          response.status(400).send({
            message: 'Passwords does not match',
            error,
          });
        });
    })
    // catch error if email does not exist
    .catch(e => {
      response.status(404).send({
        message: 'Email not found',
        e,
      });
    });
});

// // free endpoint
// router.get("/free-endpoint", (request, response) => {
//   response.json({ message: "You are free to access me anytime" });
// });

// // authentication endpoint
// router.get("/auth-endpoint", auth, (request, response) => {
//   response.send({ message: "You are authorized to access me" });
// });

module.exports = router;
