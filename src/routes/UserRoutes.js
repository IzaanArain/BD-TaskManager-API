const express = require("express");
const {
  getUser,
  updateUser,
  adminDeleteUser,
  getAllUsers,
  addUser,
  loginUser,
  Complete_profile,
  otp_verify,
  forget_password,
  reset_password,
  notification,
  block_user,
  change_password,
  user_delete
} = require("../controller/UserController");
const user_token_auth = require("../middleware/Auth");
const file=require("../middleware/Multer")

const router = express.Router();

router.post("/create",file.user,addUser);
router.post("/otp_verify",file.user,otp_verify);
router.post("/complete_profile",file.user,user_token_auth,Complete_profile);
router.post("/login",file.user,loginUser);
router.post("/forgot_password",file.user,forget_password);
router.post("/reset_password",file.user,reset_password);
router.put("/notification",file.user,user_token_auth,notification);
router.post("/block_user/:id",file.user,user_token_auth,block_user);
router.post("/change_password",file.user,user_token_auth,change_password);
router.get("/allusers", user_token_auth, getAllUsers);
router.get("/", user_token_auth, getUser);
router.put("/update",file.user,user_token_auth, updateUser);
router.delete("/admin_delete/:id", user_token_auth, adminDeleteUser);
router.delete("/user_delete", user_token_auth, user_delete);

module.exports = router;
