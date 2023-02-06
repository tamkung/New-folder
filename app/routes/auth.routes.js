const express = require('express');
const router = express.Router();

const {
  signUp,
  signIn,
  signOut,
  verified,
} = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth');

router.post("/auth/signup", signUp);

router.post("/auth/signin", signIn);

router.post("/auth/signout", signOut);

router.get("/auth/verified", verified);

router.post("/auth/verifytoken", verifyToken);

module.exports = router;
