const express= require("express");
const jwt= require("jsonwebtoken")
const {connection}= require("./config/db");
const {UserModel}= require("./models/User.model");

const bcrypt = require('bcrypt');

const cors= require('cors');

const app= express();

app.use(express.json())
app.use(cors({
    origin: "*"
}))

app.get("/",(req,res)=>{
    res.send("Welcome")
})

app.post("/signup", async(req,res)=>{
    console.log(req.body)
    const {email,password}= req.body;
    const userPresent= await UserModel.findOne({email});
    if(userPresent?.email){
        res.send("User already exists");
    }
    else{
        try{
            bcrypt.hash(password, 5, async function(err, hash) {
                // Store hash in your password DB.
                const user= new UserModel({email,password:hash})
                await user.save()
                res.send("Sign up successfully");
            });
        }
        catch(err){
            console.log(err);
            res.send("Something went wrong, pls try again later")
        }
    }
})

app.post("/login",async(req,res)=>{
    const {email,password}= req.body;
    try{
        const user= await UserModel.find({email});
        // console.log(user)
        if(user.length>0){
            const hashed_password= user[0].password;
            bcrypt.compare(password, hashed_password, function(err, result) {
                if(result){
                    const token = jwt.sign({ "userID": user[0]._id }, 'hush');
                    res.send({"msg":"Login successfull","token": token})
                }
                else{
                    res.send("Login failed")
                }
            });
            
        }
        else{
            res.send("Login failed");
        }
    }
    catch{
        res.send("Something went wrong, pls try again later")
    }
    // res.send("work in progress");
})





// app.use(authenticate)
// app.use("/notes",notesRouter)

app.listen(8080,async()=>{
    try{
        await connection;
        console.log("Connected to DB Successfully")
    }
    catch(err){
        console.log("Error connecting to DB");
        console.log(err);
    }
    console.log("http://localhost:8080")
})