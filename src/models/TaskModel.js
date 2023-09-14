const mongoose=require("mongoose")
const moment=require("moment")

const TaskSchema=new mongoose.Schema({
    title:{
        type:String,
        require:[true,"title is mandatory"]
    },
    description:{
        type:String,
        require:true
    },
    amount:{
        type:Number,
        default:0,
    },
    image:{
        type:String,
        default:""
    },
    assign_date:{
        type:String,
        default:moment(Date.now()).format('MMMM Do YYYY, h:mm:ss a'), 
    },
    completion_date:{
        type:String,
        default:""
    },
    freeLancer_id:{
        type:mongoose.Schema.ObjectId,
        ref:"user",
        required:true,
    },
    status:{
        type:String,
        enum:["todo","assigned", 'completionApproval',"completedByFreelancer"],
        default:"todo",
    },
    createdBy_id:{
        type:mongoose.Schema.ObjectId,
        ref:"user",
        required:true
    },
},{
    timestamps:true
});

module.exports=mongoose.model("task",TaskSchema);