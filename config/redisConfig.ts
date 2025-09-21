import dotenv from 'dotenv'
dotenv.config()
import Redis from "ioredis";

const getRedisUrl = ()=>{
    if (process.env.REDIS_URL){
        return process.env.REDIS_URL
    }
    throw new Error("REDIS_URL not found update your environment variables")
} 

const redis = new Redis(getRedisUrl())

redis.on('connect',()=>{
    
    console.log("connected to redis")
})

redis.on('error',(err)=>{
    console.log("Redis connection error",err)
})

process.on('SIGTERM', () => {
  redis.quit();
});

export default redis 