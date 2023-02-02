const express = require('express');
const router = express.Router();

const {
    addBooking,
    getBooking,
    getBookingByEmail,
    updateBookingApprove,
    searchBookingByDateRange
} = require('../controllers/booking.controller');

router.post("/addbooking", addBooking);

router.get("/getbooking", getBooking);

router.get("/getbookingbyemail/:id", getBookingByEmail);

router.post("/updatebookingapprove", updateBookingApprove);

router.post("/searchbookingbydaterange", searchBookingByDateRange);

module.exports = router;