const mongoose=require("mongoose")


const TaskSchema=new mongoose.Schema({
    title:{
        type:String,
        require:[true,"title is mandatory"]
    },
    description:{
        type:String,
        require:true
    },
    date:{
        type:String,
        default:""
    },
    amount:{
        type:Number,
        default:0,
    },
    FreeLancer_id:{
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

module.exports=mongoose.model("task",UserSchema);