const express = require('express');
const router = express.Router();

const {
    addBooking,
    getBooking,
    getBookingByEmail,
    sendNotify,
    updateBookingStatus,
    updateBookingStartMile,
    updateBookingEndMile,
    updateBookingImage,
    searchBookingByDateRange,
    searchBookingByEmail,
} = require('../controllers/booking.controller');

router.post("/addbooking", addBooking);

router.get("/getbooking", getBooking);

router.get("/getbookingbyemail/:id", getBookingByEmail);

router.post("/sendnotify", sendNotify);

router.post("/updatebookingstatus", updateBookingStatus);

router.post("/updatebookingstartmile", updateBookingStartMile);

router.post("/updatebookingendmile", updateBookingEndMile);

router.post("/updatebookingimage", updateBookingImage);

router.post("/searchbookingbydaterange", searchBookingByDateRange);

router.post("/searchbookingbyemail", searchBookingByEmail);

module.exports = router;