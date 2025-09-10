import express from 'express'
import { JoinRoomController } from '../controller/joinRoom.controller'

const router = express.Router()

router.post('/join',JoinRoomController)

export default router
