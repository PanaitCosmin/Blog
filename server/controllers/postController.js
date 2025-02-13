import { db } from '../db.js'
import jwt from 'jsonwebtoken'

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory using import.meta.url and fileURLToPath
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Single Post
export const getPost = async (req, res) => {
    const queryPost = "SELECT p.id, u.username, `title`, `desc`,  p.img, u.img as userImg, `cat`, `date` FROM users u JOIN posts p ON u.id = p.userid WHERE p.id = ?"

    db.query(queryPost, [req.params.id], (err, data) => {
        if (err) return res.status(500).json({
            message:'Database error occurred while checking user.'
        })

        return res.status(200).json(data[0])
    })
}

// All Posts
export const getPosts = (req, res) => {
    const queryPosts = req.query.cat 
        ? "SELECT * from posts WHERE cat = ? ORDER BY `date` DESC"
        : "SELECT * from posts ORDER BY `date` DESC"
    
    const values = req.query.cat ? [req.query.cat] : []

    db.query(queryPosts, values, (err, data) => {
        if (err) return res.status(500).json({
            message:'Database error occurred while checking user.'
        }) 

        return res.status(200).json(data)
    })
}


// Get Menu Posts 
export const getMenuPosts = (req, res) => {
    const queryMenuPosts = 'SELECT * FROM posts WHERE `cat` = ? AND `id` != ? ORDER BY `date` DESC';

    const values = [req.query.cat, parseInt(req.query.parrentId)];

    db.query(queryMenuPosts, values, (err, data) => {
        if (err) return res.status(500).json({ message: 'Database error occurred.' });

        return res.status(200).json(data);
    });
};


// Create Post
export const addPost = (req, res) => {
    const token = req.cookies.access_token
    if (!token) return res.status(401).json({
        message: 'Not authenticated'
    })

    jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
        if (err) return res.status(403).json({
            message: 'Token is not valid'
        })

        const queryAddPost = 'INSERT INTO posts (`title`, `desc`, `img`, `cat`, `date`, `userid`) VALUES (?)'
    
        const postValues = [
            req.body.title,
            req.body.desc,
            req.body.img,
            req.body.cat,
            req.body.date,
            userInfo.id,
        ]

        db.query(queryAddPost, [postValues], (err, data) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    message: err.message,
                });
            }

            return res.status(201).json({
                message: 'Post created!'
            })
        })
    })
}

// Delete Single Post
export const deletePost = (req, res) => {
    const postId = req.params.id
    const token = req.cookies.access_token
    
    if (!token) return res.status(401).json({
        message: 'Not authenticated'
    })

    jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
        if (err) return res.status(403).json({
            message: 'Token is not valid'
        })

        const queryDeletePost = 'DELETE FROM posts WHERE `id` = ? AND `userid` = ?'

        db.query(queryDeletePost, [postId, userInfo.id], (err, data) => {
            if (err) return res.status(500).json({
                message:'Database error occurred while checking user.'
            }) 

            if (data.affectedRows === 0) {
                return res.status(404).json({
                    message: 'Post not found'
                })
            }

            return res.status(202).json({
                message: 'Post deleted!'
            })
        })
    })
}


// Update Post
export const updatePost = (req, res) => {
    const postId = req.params.id
    const token = req.cookies.access_token

    if (!token) return res.status(401).json({ message: 'Not authenticated' })


    jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
        if (err) return res.status(403).json({ message: 'Token is not valid' })

        const queryUpdatePost = 'UPDATE posts SET `title` = ?, `desc` = ?, `img` = ?, `date` = ?, `cat` = ? WHERE `id` = ? AND `userid` = ?'

        const updateValues = [
            req.body.title,
            req.body.desc,
            req.body.img,
            req.body.date,
            req.body.cat,
            postId,
            userInfo.id
        ]

        db.query(queryUpdatePost, updateValues, (err, data) => {
            if (err) {
                console.error("Database Error:", err)
                return res.status(500).json({ message: 'Database error', error: err.message })
            }

            if (data.affectedRows === 0) {
                return res.status(404).json({ error: 'Post not found' })
            }    
            
            return res.status(200).json({ success: "Post updated!" })
        })
    })
}


// Delete post image
export const deleteImage = (req, res) => {
    const { imagePath } = req.body;

    // Ensure the path does not start with '/'
    const normalizedPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

    // Resolve the correct absolute path (adjust based on your server structure)
    const fullImagePath = path.join(__dirname, '../../client/public', normalizedPath);

    // Check if the file exists
    fs.access(fullImagePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(400).json({ message: 'Old image not found' });
        }

        // Delete the old image
        fs.unlink(fullImagePath, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error deleting old image' });
            }

            return res.status(200).json({ message: 'Old image deleted successfully' });
        });
    });
};