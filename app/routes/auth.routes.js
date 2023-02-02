const express = require('express');
const router = express.Router();

const {
  signUp,
  signIn,
  signOut,
  verified,
  protected
} = require('../controllers/auth.controller');

router.post("/auth/signup", signUp);

router.post("/auth/signin", signIn);

router.post("/auth/signout", signOut);

router.get("/auth/verified", verified);

router.get("/auth/protected", protected);

module.exports = router;
