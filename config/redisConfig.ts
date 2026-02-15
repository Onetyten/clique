import dotenv from 'dotenv'
dotenv.config()
import Redis from "ioredis";
import { logger } from '../app';

const getRedisUrl = ()=>{
    if (process.env.REDIS_URL){
        return process.env.REDIS_URL
    }
    throw new Error("REDIS_URL not found update your environment variables")
} 

const redis = new Redis(getRedisUrl())

redis.on('connect',()=>{
    
    logger.info("connected to redis")
})

redis.on('error',(err)=>{
    logger.info({error:err},"Redis connection error")
})

process.on('SIGTERM', () => {
  redis.quit();
});

export default redis 