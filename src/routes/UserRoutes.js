const express = require("express");
const {
  getUser,
  updateUser,
  deleteUser,
  getAllUsers,
  addUser,
  loginUser,
  Complete_profile,
  otp_verify,
} = require("../controller/UserController");
const user_token_auth = require("../middleware/Auth");

const router = express.Router();

router.post("/create", addUser);
router.post("/otp_verify", otp_verify);
router.post("/complete_profile", Complete_profile);
router.post("/login", loginUser);
router.get("/allusers", user_token_auth, getAllUsers);
router.get("/", user_token_auth, getUser);
router.put("/update", user_token_auth, updateUser);
router.delete("/delete", user_token_auth, deleteUser);

module.exports = router;
