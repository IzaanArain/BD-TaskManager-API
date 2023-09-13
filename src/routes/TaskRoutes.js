const express=require("express");
const { create_task } = require("../controller/TaskController");

const router=express.Router()

router.post("/create_task",create_task);


module.exports=router

