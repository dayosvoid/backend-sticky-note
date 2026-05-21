const router = require("express").Router()
const {handleRegister,handleLogin} = require("../contoller/user.Controller")

router.post("/login",handleLogin)
router.post("/register", handleRegister)

module.exports = router