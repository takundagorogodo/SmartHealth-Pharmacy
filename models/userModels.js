import { parse } from "dotenv";
import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            trim:true
        },
        surname:{
            type:String,
            trim:true
        },
        email:{
            type:String,
            trim:true,
            parse:true,
            unique:true
        },
        phone:{
            type:String,
            trim:true,
            parse:true,
            unique:true
        },
        gender:{
            type:String,
            enum:["male","female"],
            default:"male"
        },
        age:{
            type:String,
            trim:true
        },
        role:{
            type:String,
            enum:["patient","doctor"],
            default:"patient"
        }
    }
)

export default mongoose.model('User',userSchema);