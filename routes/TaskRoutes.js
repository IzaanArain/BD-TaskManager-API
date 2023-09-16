const express=require("express");
const user_token_auth = require("../middleware/Auth");
const file=require("../middleware/Multer");
const { create_task,
    assign_task,
    accept_task } = require("../controller/TaskController");
const router=express.Router()

router.post("/create_task",file.user,user_token_auth,create_task);
router.put("/assign_task/",file.user,user_token_auth,assign_task);
router.put("/accept_task/",file.user,user_token_auth,accept_task);


module.exports=router

