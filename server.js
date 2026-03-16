import express from "express"
import multer from "multer"
import fs from "fs"
import fetch from "node-fetch"
import {checkLimit} from "./buildManager.js"

const app = express()

const upload = multer({
 limits:{fileSize:500*1024*1024}
})

if(!fs.existsSync("./uploads")) fs.mkdirSync("./uploads")
if(!fs.existsSync("./builds")) fs.mkdirSync("./builds")

app.use(express.static("public"))

app.post("/upload", upload.single("file"), async (req,res)=>{

 let user = req.ip

 if(!checkLimit(user)){
  return res.send("Build limit reached")
 }

 if(!req.file.originalname.endsWith(".zip")){
  return res.send("ZIP only")
 }

 let newPath = "./uploads/"+req.file.filename+".zip"

 fs.renameSync(req.file.path, newPath)

 try{

  await fetch(`https://api.github.com/repos/${process.env.GH_REPO}/actions/workflows/build.yml/dispatches`,{
   method:"POST",
   headers:{
    Authorization:`Bearer ${process.env.GITHUB_TOKEN}`,
    Accept:"application/vnd.github+json"
   },
   body:JSON.stringify({
    ref:"main"
   })
  })

 }catch(e){

  return res.send("GitHub API error")

 }

 res.send("Build started")

})

app.get("/builds",(req,res)=>{

 let files = fs.readdirSync("./builds")

 res.json(files)

})

app.listen(process.env.PORT || 3000)
