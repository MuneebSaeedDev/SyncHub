const express = require('express')
const { signUp, signIn, logOut, getUserById } = require('../controllers/auth.controller')
const verifyToken = require('../middlewares/auth.middleware')

const router = express.Router()

router.post('/signup', signUp);
router.post('/login', signIn);
router.post('/signin', signIn);
router.post('/logout', logOut)
router.post('/signout', logOut)

router.get("/:id", verifyToken, getUserById);

module.exports = router;