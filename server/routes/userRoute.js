import express from 'express'
import { deleteUser, updateUser } from '../controllers/userController.js'

const router = express.Router()

router.put('/', updateUser)
router.delete('/', deleteUser)

export default router