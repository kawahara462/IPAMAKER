import express from "express"
import multer from "multer"
import fs from "fs"
import fetch from "node-fetch"
import {checkLimit} from "./buildManager.js"

const app=express()

const upload=multer({
 limits:{fileSize:500*1024*1024}
})

app.use(express.static("public"))

app.post("/upload",upload.single("file"),async(req,res)=>{

 let user=req.ip

 if(!checkLimit(user)){
  return res.send("Build limit reached")
 }

 if(!req.file.originalname.endsWith(".zip")){
  return res.send("ZIP only")
 }

 let path=req.file.path

 fs.renameSync(path,"uploads/"+req.file.filename+".zip")

 await fetch(`https://api.github.com/repos/${process.env.GH_REPO}/actions/workflows/build.yml/dispatches`,{
  method:"POST",
  headers:{
   Authorization:`token ${process.env.GITHUB_TOKEN}`,
   Accept:"application/vnd.github+json"
  },
  body:JSON.stringify({
   ref:"main",
   inputs:{
    file:req.file.filename+".zip"
   }
  })
 })

 res.send("Build started")

})

app.get("/builds",(req,res)=>{

 let files=fs.readdirSync("./builds")

 res.json(files)

})

app.listen(3000)
