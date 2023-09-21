const express=require("express");
const user_token_auth = require("../middleware/Auth");
const file=require("../middleware/Multer");
const { create_task,
    assign_task,
    accept_task,
    task_completed,
    completion_approval,
    freelancer_task_todo,
    freelancer_task_assigned,
    freelancer_task_accepted,
    freelancer_task_completed,
    freelancer_task_approved,
    all_completed_task,
    delete_task } = require("../controller/TaskController");
const router=express.Router()

router.post("/create_task",file.user,user_token_auth,create_task);
router.get("/freelancer_task_todo",user_token_auth,freelancer_task_todo);
router.put("/assign_task",file.user,user_token_auth,assign_task);
router.put("/accept_task",user_token_auth,accept_task);
router.put("/task_completed",user_token_auth,task_completed);
router.put("/completion_approval",user_token_auth,completion_approval);
router.get("/freelancer_task_assigned",user_token_auth,freelancer_task_assigned);
router.get("/freelancer_task_accepted",user_token_auth,freelancer_task_accepted);
router.get("/freelancer_task_completed",user_token_auth,freelancer_task_completed,);
router.get("/freelancer_task_approved",user_token_auth,freelancer_task_approved);
router.get("/all_completed_task",user_token_auth,all_completed_task);
router.get("/task_deleted",user_token_auth, delete_task);


module.exports=router

