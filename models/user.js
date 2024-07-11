
const {Schema,model} = require("mongoose");
const {createTokenForUser} = require("../services/auth")
const { createHmac,randomBytes } = require('crypto'); // this is inbuilt in nodejs for hashing passwords

const userSchema = new Schema({
    fullName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    salt:{
        type:String,
    },
    password:{
        type:String,
        required:true,
    },
    profileImageURL:{
        type:String
    },
    role:{
        type:String,
        enum:["USER","ADMIN"],
        default:"USER",
    }
},
{
    timestamps:true
});

// it is a middleware for doing operations just befor the saving of the data from SignUp page.
userSchema.pre("save",function(next){
    const user = this;
    if(!user.isModified("password")) return ;

    const salt = randomBytes(16).toString();
    const hashedPassword = createHmac("sha256",salt)
    .update(user.password)
    .digest("hex");

    this.salt = salt;
    this.password = hashedPassword;

    next();
});

// It is a virtual function for checking password
userSchema.static("matchPasswordAndGenerateToken", async function(email,password){
    const user = await this.findOne({email});
    if(!user) throw new Error("User Not Found");
    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac("sha256",salt).update(password).digest("hex");

    if(hashedPassword !== userProvidedHash) throw new Error("Incorrect Password");

    const token = await createTokenForUser(user);
    return token;
}) 

const User = model("user",userSchema);

module.exports = User;
