const express = require('express');
const router = express.Router();

const {
    getUser,
    getUserByEmail
} = require('../controllers/user.controller');

router.get("/getuser", getUser);

router.get("/getuserbyemail", getUserByEmail);

module.exports = router;