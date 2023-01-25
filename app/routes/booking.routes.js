const express = require('express');
const router = express.Router();

const {
    addbooking,
    getbooking
} = require('../controllers/booking.controller');

router.post("/addbooking", addbooking);

router.get("/getbooking", getbooking);

module.exports = router;