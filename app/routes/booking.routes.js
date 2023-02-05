const express = require('express');
const router = express.Router();

const {
    addBooking,
    getBooking,
    getBookingByEmail,
    searchBookingByDateRange,
    updateBookingStatus,
    updateBookingActive,
    updateBookingFinish
} = require('../controllers/booking.controller');

router.post("/addbooking", addBooking);

router.get("/getbooking", getBooking);

router.get("/getbookingbyemail/:id", getBookingByEmail);

router.post("/updatebookingstatus", updateBookingStatus);

// router.post("/updatebookingactive", updateBookingActive);

// router.post("updatebookingfinish", updateBookingFinish);

router.post("/searchbookingbydaterange", searchBookingByDateRange);

module.exports = router;