const express=require("express");
const user_token_auth = require("../middleware/Auth");
const file=require("../middleware/Multer");
const { create_task } = require("../controller/TaskController");
const router=express.Router()

router.post("/create_task/:id",file.user,user_token_auth,create_task);


module.exports=router

