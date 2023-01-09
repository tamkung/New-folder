const express = require('express');
const router = express.Router();

const {
  signup,
  signin,
  signout,
  verified,
  protected
} = require('../controllers/auth.controller');

router.post("/auth/signup", signup);

router.post("/auth/signin", signin);

router.post("/auth/signout", signout);

router.get("/auth/verified", verified);

router.get("/auth/protected", protected);

module.exports = router;
