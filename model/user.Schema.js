const dotenv = require("dotenv")
dotenv.config()
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    fullname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true
    }
}, {timestamps:true})

// hashed password
userSchema.pre("save", async function() {
    if (!this.isModified("password")) {
        return
    }
    const salt = await bcrypt.genSalt(8);
    this.password = await bcrypt.hash(this.password, salt);
    // next();
});

// compare password
userSchema.methods.comparedPassword = async function (userPassword){
    try {
        return await bcrypt.compare(userPassword, this.password)
    } catch (error) {
        console.log(error)
        return(error)
    }
}

userSchema.methods.generateJwtToken = async function (){
    const token = jwt.sign({userId : this._id}, process.env.JWT_SIGNATURE, {expiresIn:process.env.JWT_LIFESPAN})
    return token
}

const USER = mongoose.model("user",userSchema)

module.exports = USER