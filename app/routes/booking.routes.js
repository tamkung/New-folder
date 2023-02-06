const express = require('express');
const router = express.Router();

const {
    addBooking,
    getBooking,
    getBookingByEmail,
    searchBookingByDateRange,
    updateBookingStatus,
    updateBookingStartMile,
    updateBookingEndMile,
} = require('../controllers/booking.controller');

router.post("/addbooking", addBooking);

router.get("/getbooking", getBooking);

router.get("/getbookingbyemail/:id", getBookingByEmail);

router.post("/updatebookingstatus", updateBookingStatus);

router.post("/updatebookingstartmile", updateBookingStartMile);

router.post("/updatebookingendmile", updateBookingEndMile);

router.post("/searchbookingbydaterange", searchBookingByDateRange);

module.exports = router;