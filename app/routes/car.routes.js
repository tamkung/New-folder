const express = require('express');
const router = express.Router();

const {
    addcar,
    getcar,
    getcarbyid,
    updatecar,
    deletecar,
    getavailablecars,
} = require('../controllers/car.controller');

router.post("/addcar", addcar);

router.get("/getcar", getcar);

router.get("/getcarbyid/:id", getcarbyid);

router.post("/updatecar", updatecar);

router.post("/deletecar/:id", deletecar);

router.get("/getavailablecars", getavailablecars);

module.exports = router;