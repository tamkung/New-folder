const express = require('express');
const router = express.Router();

const {
    addCar,
    getCar,
    getCarById,
    updateCarStatus,
    updateCarMile,
    deleteCar,
    getAvailableCars,
} = require('../controllers/car.controller');

router.post("/addcar", addCar);

router.get("/getcar", getCar);

router.get("/getcarbyid/:id", getCarById);

router.post("/updatecarstatus", updateCarStatus);

router.post("/updatecarmile", updateCarMile);

router.post("/deletecar/:id", deleteCar);

router.post("/getavailablecars", getAvailableCars);

module.exports = router;