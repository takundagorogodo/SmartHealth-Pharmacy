import { parse } from "dotenv";
import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true
        },
        surname:{
            type:String,
            required:true,
            trim:true
        },
        email:{
            type:String,
            trim:true,
            lowercase:true,
            required:true,
            unique:true
        },
        password:{
            type:String,
            required:true,
            trim:true
        },
        gender:{
            type:String,
            enum:["male","female"],
            default:"male"
        },
        age:{
            type:Number,
            min:0,
            max:120
        },
        role:{
            type:String,
            enum:["patient","doctor","admin"],
            default:"patient"
        }
    },
    {timestamps:true}
)

export default mongoose.model('User',userSchema);