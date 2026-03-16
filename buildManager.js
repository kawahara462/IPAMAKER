let builds={}

export function checkLimit(user){

 let now=Date.now()

 if(!builds[user]) builds[user]=[]

 builds[user]=builds[user].filter(t=>now-t<86400000)

 let lastHour=builds[user].filter(t=>now-t<3600000)

 if(lastHour.length>=1) return false
 if(builds[user].length>=3) return false

 builds[user].push(now)

 return true

}
