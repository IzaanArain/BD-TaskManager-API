const User = require("../models/UserModel");
const Task = require("../models/TaskModel");
const mongoose = require("mongoose");
const moment = require("moment");

const create_task = async (req, res) => {
  try {
    const adminId = req.id;
    const { title, description, amount, completion_date } = req.body;
    const admin = await User.findOne({ _id: adminId, role: "admin" });
    if (!admin) {
      return res.status(404).send({
        status: 0,
        message: "you are not Admin",
      });
    }
    if (!title) {
      return res.status(404).send({
        status: 0,
        message: "must have title",
      });
    } else if (!description) {
      return res.status(404).send({
        status: 0,
        message: "must have description",
      });
    } else if (!amount) {
      return res.status(404).send({
        status: 0,
        message: "please enter amount",
      });
    } else if (!completion_date) {
      return res.status(404).send({
        status: 0,
        message: "please enter a completion date",
      });
    }
    const com_date = completion_date.split("T")[0];
    if (
      !com_date.match(/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/)
    ) {
      return res.status(404).send({
        status: 0,
        message: "date format must match YYYY-MM-DD",
      });
    }

    const date1 = moment(Date.now());
    const date2 = moment(com_date);
    if (date2.isBefore(date1)) {
      return res.status(404).send({
        status: 0,
        message: "completion date can not before creation date",
      });
    }
    const future_date = date1.add(1, "M");
    if (date2.isAfter(future_date)) {
      return res.status(404).send({
        status: 0,
        message: "completion date can not be beyond 1 month",
      });
    }
    const task = await Task.create({
      title,
      description,
      amount,
      create_date: moment(Date.now()).format("MMMM Do YYYY, h:mm:ss a"),
      completion_date: date2.format("MMMM Do YYYY, h:mm:ss a"),
      status: "todo",
      createdBy_id: adminId,
    });
    res.status(200).send({
      status: 1,
      message: "Successfully created task",
      task,
    });
  } catch (err) {
    console.error("Error", err.message.red);
    res.status(500).send({
      status: 0,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

const assign_task = async (req, res) => {
  try {
    const adminId = req.id;
    const userId = req.query.user_id;
    const task_id = req.query.task_id;
    if (!task_id) {
      return res.status(404).send({
        status: 0,
        message: "please enter user id",
      });
    } else if (!mongoose.isValidObjectId(userId)) {
      console.error("Error", "not valid user".red);
      return res.status(404).send({
        status: 0,
        message: "not valid user",
      });
    } else if (!mongoose.isValidObjectId(task_id)) {
      return res.status(404).send({
        status: 0,
        message: "not a valid task",
      });
    }
    const taskUser = await User.findOne({ _id: userId, role: "user" });
    if (!taskUser) {
      return res.status(404).send({
        status: 0,
        message: "user not found",
      });
    }
    const admin = await User.findOne({ _id: adminId, role: "admin" });
    if (!admin) {
      return res.status(404).send({
        status: 0,
        message: "you are not Admin",
      });
    }
    const task = await Task.findOne({ _id: task_id });
    if (!task) {
      return res.status(404).send({
        status: 0,
        message: "No such task exists",
      });
    }
    const task_update = await Task.findOneAndUpdate(
      { _id: task?._id.toString() },
      {
        freeLancer_id: userId,
        status: "assigned",
        assign_date: moment(Date.now()).format("MMMM Do YYYY, h:mm:ss a"),
      },
      { new: true }
    );
    res.status(200).send({
      status: 0,
      message: "successfully assigned task",
      task_update,
    });
  } catch (err) {
    console.log("Error", err.message.red);
    res.status(500).send({
      status: 0,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

const accept_task = async (req, res) => {
  try {
    const userId = req.id;
    const task_id = req.query.task_id;
    const user = await User.findOne({ _id: userId, role: "user" });
    if (!user) {
      return res.status(400).send({
        status: 0,
        message: "user not found",
      });
    }
    const task = await Task.findOne({
      _id: task_id,
      freeLancer_id: userId,
      status: "assigned",
    });
    if (!task) {
      return res.status(400).send({
        status: 0,
        message: "No assigned task found",
      });
    }
    const taskId = task?._id;
    const accept_task = await Task.findOneAndUpdate(
      { _id: taskId },
      {
        task_accepted: true,
        status: "accepted",
        accepted_date: moment(Date.now()).format("MMMM Do YYYY, h:mm:ss a"),
      },
      { new: true }
    );
    res.status(200).send({
      status: 1,
      message: "Task accepted by user",
      accept_task,
    });
  } catch (err) {
    console.log("Error", err.message.red);
    res.status(500).send({
      status: 0,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

const task_completed = async (req, res) => {
  try {
    const userId = req.id;
    const task_id = req.query.task_id;
    const user = await User.findOne({ _id: userId, role: "user" });
    if (!user) {
      return res.status(400).send({
        status: 0,
        message: "user not found",
      });
    }
    const task = await Task.findOne({
      _id: task_id,
      freeLancer_id: userId,
      status: "accepted",
    });
    if (!task) {
      return res.status(400).send({
        status: 0,
        message: "No accepted task found",
      });
    }
    const taskId = task?._id;
    const complted_task = await Task.findOneAndUpdate(
      { _id: taskId },
      {
        status: "completedByFreelancer",
        freeLancer_completion: moment(Date.now()).format(
          "MMMM Do YYYY, h:mm:ss a"
        ),
      },
      { new: true }
    );
    res.status(200).send({
      status: 1,
      message: "freelancer completed task successfully",
      complted_task,
    });
  } catch (err) {
    console.log("Error", err.message.red);
    res.status(500).send({
      status: 0,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

const completion_approval = async (req, res) => {
  try {
    const adminId = req.id;
    const userId = req.query.user_id;
    const taskId = req.query.task_id;
    const admin = await User.findOne({ _id: adminId, role: "admin" });
    if (!admin) {
      return res.status(400).send({
        status: 0,
        message: "you are not admin",
      });
    }
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(404).send({
        status: 0,
        message: "not a valid user",
      });
    }
    const user = await User.findOne({ _id: userId, role: "user" });
    if (!user) {
      return res.status(404).send({
        status: 0,
        message: "user not found",
      });
    }
    const task = await Task.findOne({
      _id: taskId,
      freeLancer_id: userId,
      // status: "completedByFreelancer",
    });
    if (!task) {
      return res.status(404).send({
        status: 0,
        message: "task not found, task has be completed by freelancer",
      });
    } else if (task.status === "completionApproval") {
      return res.status(404).send({
        status: 0,
        message: "task has already been approved",
      });
    }

    const date1 = moment(task.completion_date, "MMMM Do YYYY, h:mm:ss a");
    const date2 = moment(task.freeLancer_completion, "MMMM Do YYYY, h:mm:ss a");

    if (date2.isAfter(date1)) {
      const num_days = date2.diff(date1, "days");
      const num_hours = date2.hour();
      const total_hours = num_days * 24 + num_hours;
      const d_amount = total_hours * 10;
      const amount = task.amount - d_amount;

      const task_completed = await Task.findOneAndUpdate(
        { _id: task._id },
        { status: "completionApproval", isCompleted: true, amount },
        { new: true }
      );

      res.status(200).send({
        status: 1,
        message: "completion approved",
        task: task_completed,
      });
    } else {
      const task_completed = await Task.findOneAndUpdate(
        { _id: task._id },
        { status: "completionApproval", isCompleted: true },
        { new: true }
      );

      res.status(200).send({
        status: 1,
        message: "completion approved",
        task: task_completed,
      });
    }
  } catch (err) {
    console.log("Error", err.message.red);
    res.status(500).send({
      status: 0,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

// Get tasks
const freelancer_task_todo=async(req,res)=>{
  try{
    const adminId=req.id
    const admin=await User.findOne({_id:adminId,role:"admin"})
    if(!admin){
      return   res.status(500).send({
        status:0,
        message:"you are not admin",
      })
    }
    const task=await Task.find({createdBy_id:adminId,status:"todo"})
    if(!task){
      return   res.status(500).send({
        status:0,
        message:"No task todo found",
      })
    }

    res.status(200).send({
      status:0,
      message:"all todo tasks",
      task
    })
  }catch(err){
    res.status(500).send({
      status:0,
      message:"Something went wrong",
      Error:err.message
    })
  }
}

const freelancer_task_assigned=async(req,res)=>{
  try{
    const userId=req.id
    const task=await Task.find({freeLancer_id:userId,status:"assigned"})
    if(!task){
      return   res.status(500).send({
        status:0,
        message:"No assigned task found",
      })
    }

    res.status(200).send({
      status:0,
      message:"all assigned tasks",
      task
    })
  }catch(err){
    res.status(500).send({
      status:0,
      message:"Something went wrong",
      Error:err.message
    })
  }
}

const freelancer_task_accepted=async(req,res)=>{
  try{
    const userId=req.id
    const task=await Task.find({freeLancer_id:userId,status:"accepted"})
    if(!task){
      return   res.status(500).send({
        status:0,
        message:"No accepted task found",
      })
    }

    res.status(200).send({
      status:0,
      message:"all accepted tasks",
      task
    })
  }catch(err){
    res.status(500).send({
      status:0,
      message:"Something went wrong",
      Error:err.message
    })
  }
}

const freelancer_task_completed=async(req,res)=>{
  try{
    const userId=req.id
    const task=await Task.find({freeLancer_id:userId,status:"completedByFreelancer"})
    if(!task){
      return   res.status(500).send({
        status:0,
        message:"No completed by user",
      })
    }

    res.status(200).send({
      status:0,
      message:"all completed tasks by user tasks",
      task
    })
  }catch(err){
    res.status(500).send({
      status:0,
      message:"Something went wrong",
      Error:err.message
    })
  }
}

const freelancer_task_approved=async(req,res)=>{
  try{
    const userId=req.id
    const task=await Task.find({freeLancer_id:userId,status:"completionApproval"})
    if(!task){
      return   res.status(500).send({
        status:0,
        message:"No task approved by admin",
      })
    }

    res.status(200).send({
      status:0,
      message:"all approved task",
      task
    })
  }catch(err){
    res.status(500).send({
      status:0,
      message:"Something went wrong",
      Error:err.message
    })
  }
}

const all_completed_task=async(req,res)=>{
  try{
    const adminId=req.id
    const admin=await User.find({_id:adminId,role:"admin"})
    if(!admin){
      return   res.status(500).send({
        status:0,
        message:"you are not admin",
      })
    }
    const task=await Task.findOne({createdBy_id:adminId,status:"completionApproval"})
    if(!task){
      return   res.status(500).send({
        status:0,
        message:"No task approved by admin",
      })
    }

    res.status(200).send({
      status:0,
      message:"all approved task",
      task
    })
  }catch(err){
    res.status(500).send({
      status:0,
      message:"Something went wrong",
      Error:err.message
    })
  }
}
module.exports = {
  create_task,
  assign_task,
  accept_task,
  task_completed,
  completion_approval,
  freelancer_task_todo,
  freelancer_task_assigned,
  freelancer_task_accepted,
  freelancer_task_completed,
  freelancer_task_approved,
  all_completed_task
};
