const User = require("../models/UserModel");
const Task = require("../models/TaskModel");
const mongoose = require("mongoose");
const moment = require("moment");

const create_task = async (req, res) => {
  try {
    const adminId = req.id;
    const { title, description, amount } = req.body;
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
    }
    const admin = await User.findOne({ _id: adminId, role: "admin" });
    if (!admin) {
      return res.status(404).send({
        status: 0,
        message: "you are not Admin",
      });
    }

    const task = await Task.create({
      title,
      description,
      amount,
      create_date:moment(Date.now()).format('MMMM Do YYYY, h:mm:ss a'), 
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
    const task_id=req.query.task_id
    if(!task_id){
        return res.status(404).send({
            status: 0,
            message: "please enter user id",
          });
    }else if (!mongoose.isValidObjectId(userId)) {
      console.error("Error", "not valid user".red);
      return res.status(404).send({
        status: 0,
        message: "not valid user",
      });
    }else if(!mongoose.isValidObjectId(task_id)){
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
    const task=await Task.findOne({_id:task_id})
    if(!task){
        return res.status(404).send({
            status: 0,
            message: "No such task exists",
          });
    }
    const task_update=await Task.findOneAndUpdate(
        {_id:task?._id.toString()},
        {
            freeLancer_id:userId,
            status:"assigned",
            assign_date:moment(Date.now()).format('MMMM Do YYYY, h:mm:ss a'),
        },
        {new:true}
    )
    res.status(200).send({
        status:0,
        message:"successfully assigned task",
        task_update
    })
  } catch (err) {
    console.log("Error", err.message.red);
    res.status(500).send({
      status: 0,
      message: "Something went wrong",
      error: err.message,
    });
  }
};
module.exports = {
  create_task,
  assign_task,
};
