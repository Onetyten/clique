import Redis from "ioredis";
const redis = new Redis()

redis.on('connect',()=>{
    console.log("connected to redis")
})

redis.on('error',(err)=>{
    console.log("Redis connection error",err)
})

export default redis