import express from "express"
import multer from "multer"
import fetch from "node-fetch"
import fs from "fs"

const app = express()

const upload = multer({
 limits:{fileSize:500*1024*1024}
})

let builds={}

function canBuild(user){

 let now=Date.now()

 if(!builds[user]) builds[user]=[]

 builds[user]=builds[user].filter(t=>now-t<86400000)

 let lastHour=builds[user].filter(t=>now-t<3600000)

 if(lastHour.length>=1) return false
 if(builds[user].length>=3) return false

 builds[user].push(now)

 return true
}

app.use(express.static("public"))

app.post("/upload",upload.single("file"),async(req,res)=>{

 let user=req.ip

 if(!canBuild(user)){
  return res.send("Build limit reached")
 }

 let file=req.file.path

 await fetch("https://api.github.com/repos/YOURUSER/YOURREPO/actions/workflows/build.yml/dispatches",{
  method:"POST",
  headers:{
   Authorization:"token "+process.env.GITHUB_TOKEN,
   Accept:"application/vnd.github+json"
  },
  body:JSON.stringify({
   ref:"main"
  })
 })

 res.send("Build started")

})

setInterval(()=>{

 if(!fs.existsSync("./builds")) return

 let files=fs.readdirSync("./builds")

 files.forEach(f=>{

  let path="./builds/"+f
  let stat=fs.statSync(path)

  if(Date.now()-stat.mtimeMs>86400000){
   fs.unlinkSync(path)
  }

 })

},3600000)

app.listen(3000)
