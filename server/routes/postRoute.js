import express from "express";
import { addPost, deletePost, getMenuPosts, getPost, getPosts, updatePost } from "../controllers/postController.js";

const router = express.Router()

router.get('/menu', getMenuPosts)


router.get('/', getPosts)
router.get('/:id', getPost)

router.post('/', addPost)
router.delete('/:id', deletePost)
router.put('/:id', updatePost)

export default router