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
  disabled_notification,
  block_user,
  unblock_user,
  change_password
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
router.post("/notification",file.user,user_token_auth,notification);
router.post("/disable_notification",file.user,user_token_auth,disabled_notification);
router.post("/block_user/:id",file.user,user_token_auth,block_user);
router.post("/unblock_user/:id",file.user,user_token_auth,unblock_user);
router.post("/change_password",file.user,user_token_auth,change_password);
router.get("/allusers", user_token_auth, getAllUsers);
router.get("/", user_token_auth, getUser);
router.put("/update",file.user,user_token_auth, updateUser);
router.delete("/delete/:id", user_token_auth, deleteUser);

module.exports = router;
