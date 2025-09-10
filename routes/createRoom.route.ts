import express from 'express'
import { CreateRoomController } from '../controller/createRoom.controller'

const router = express.Router()

router.post('/create',CreateRoomController)

export default router
