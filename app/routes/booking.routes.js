const express = require('express');
const router = express.Router();

const {
    addbooking,
    getbooking,
    getbookingbyemail
} = require('../controllers/booking.controller');

router.post("/addbooking", addbooking);

router.get("/getbooking", getbooking);

router.get("/getbookingbyemail/:id", getbookingbyemail);

module.exports = router;