require("dotenv").config();
const express = require("express")
const path = require("path");
const cookieParser = require("cookie-parser");
//user Routes
const userRoutes = require("./routes/user");
const blogRoutes = require("./routes/blog");

const Blog = require("./models/blog.js");

//mongoose to access db
const mongoose = require("mongoose");
const {checkForAuthenticationCookie} = require("./middlewares/auth.js");

const app = express();
const PORT = process.env.PORT || 8000;

// template setter
app.set("view engine","ejs");
app.set("views",path.resolve("./views"));

//connection to db
mongoose.connect(process.env.MONGO_URL).then((e) =>{
    console.log("MongoDb Connected");
})

//middleware to get data form the Forms
app.use(express.urlencoded({extended:false}));

app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")))

//User Routes (SignUp, SignIn)
app.use("/user",userRoutes);
//Blog Route (add blog)
app.use("/blog",blogRoutes);

//Home Routes
app.get("/", async (req,res)=>{
    const blogs = await Blog.find({});
    res.render("home",{
        user:req.user,
        blogs: blogs,
    });
});

app.listen(PORT,()=>{console.log(`Server is running on ${PORT}`)});