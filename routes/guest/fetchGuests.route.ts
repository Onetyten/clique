import express from 'express'
import { fetchGuests } from '../../controller/fetchGuests.controller'

const router = express.Router()

router.get('/guests/fetch/:roomName',fetchGuests)

export default router
