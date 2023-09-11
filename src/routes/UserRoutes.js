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
  forget_password,
  reset_password,
  notification,
  block_user
} = require("../controller/UserController");
const user_token_auth = require("../middleware/Auth");
const file=require("../middleware/Multer")

const router = express.Router();

router.post("/create",file.user,addUser);
router.post("/otp_verify",file.user,otp_verify);
router.post("/complete_profile",file.user, Complete_profile);
router.post("/login",file.user,loginUser);
router.post("/forgot_password",file.user,forget_password);
router.post("/reset_password",file.user,reset_password);
router.post("/notification",user_token_auth,notification);
router.post("/block_user/:id",file.user,block_user);
router.get("/allusers", user_token_auth, getAllUsers);
router.get("/", user_token_auth, getUser);
router.put("/update", user_token_auth, updateUser);
router.delete("/delete", user_token_auth, deleteUser);

module.exports = router;
