const express = require('express');
const router = express.Router();

const {
    getUser
} = require('../controllers/user.controller');


router.get("/getuser", getUser);

module.exports = router;