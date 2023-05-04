const express = require('express')
const app = express()
const ejs = require('ejs')
const bodyparser = require('body-parser')
const mongoose = require('mongoose')
require('dotenv').config()

const URI = process.env.URI

mongoose.connect(URI)
.then(()=>{
    console.log("working mongo");
})
.catch((err)=>{
    console.log(err);
})

let userSchema={
firstname:{type:String, required:true},
lastname:{type:String, required:true},
email:{type:String, required:true, unique:true},
password:{type:String, required:true}
}

let userModel = mongoose.model("user_collection", userSchema)

app.set("view engine", "ejs")
app.use(bodyparser.urlencoded({extended:true}))

app.get("/",(request,response)=>{
    console.log("request made")
    response.sendFile(__dirname+"/index.html")
    // response.send([{name:"jinad", club:"manchester united"}])
}) 

app.get("/signUp",(request,response)=>{
    response.render("signUp",{message: ""})
})

app.post("/signUp", (request, response)=>{
    console.log(request.body)
    let form = new userModel(request.body)
    form.save()
    .then(()=>{
        console.log("details has been saved in the data base")
        response.redirect("/signIn")
    })
    .catch((err)=>{
        console.log(err)
        if(err.code == 11000){
            response.render("signUp", {message:"Email already exist"})
        }else{
            response.render("signUp", {message:"All fields most be filled"})
        }
        
    })
})

app.get("/signIn",(request,response)=>{
    response.render("signIn")
})

app.post("/signIn", (request,response)=>{
    userModel.find({email:request.body.email, password:request.body.password})
    .then((res)=>{
        console.log(res)
        response.redirect("/dashboard")
    })
    .catch((err)=>{
        console.log(err)
    })
})

app.get("/dashboard",(request,response)=>{
    userModel.find()
    .then((res)=>{
        response.render("dashboard", {res})
    })
    .catch((err)=>{
        console.log(err);
    })
})

app.post("/delete", (request,response)=>{
    userModel.findOneAndDelete({email:request.body.userEmail})
    .then((res)=>{
        response.redirect("dashboard")
    })
})

app.get("/editUser",(request,response)=>{
    response.render("editUser")
})

app.post("/edit",(request,response)=>{
    userModel.findOne({email:request.body.userEmail})
    .then((res)=>{
        console.log(res);
      response.render("editUser", {userDetails:res})
    })
})

app.post("/update", (request,response)=>{
    let id = request.body.id
    userModel.findByIdAndUpdate(id, request.body)
    .then((res)=>{
        console.log(res);
        response.redirect("dashboard")
    })
    .catch((err)=>{
        console.log(err);
        
    })
})

app.get("/index", (request,response)=>{
response.render("index")
})
app.listen(4500,()=>{
    console.log("server has started")
})