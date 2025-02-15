import { db } from '../db.js'
import jwt from 'jsonwebtoken'

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { v2 as cloudinary } from 'cloudinary';

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
    const postId = req.params.id;
    const token = req.cookies.access_token;

    if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
        if (err) {
            return res.status(403).json({ message: 'Token is not valid' });
        }

        // Retrieve the post and get the image URL
        const queryGetPost = 'SELECT img FROM posts WHERE id = ? AND userid = ?';
        db.query(queryGetPost, [postId, userInfo.id], async (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Database error while fetching post.' });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: 'Post not found or unauthorized.' });
            }

            const imageUrl = result[0].img;

            // Function to extract Public ID from Cloudinary URL
            const getPublicIdFromUrl = (url) => {
                try {
                    const parts = url.split('/');
                    const fileName = parts.pop(); // e.g., "image.webp"
                    const folder = parts.slice(parts.indexOf("blog_images")).join('/'); // "blog_images"
                    return `${folder}/${fileName.split('.')[0]}`; // "blog_images/imageName"
                } catch (error) {
                    console.error("Error extracting public ID:", error);
                    return null;
                }
            };

            const publicId = getPublicIdFromUrl(imageUrl);

            // Delete the image from Cloudinary (if exists)
            if (publicId) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                    console.log(`Deleted image: ${publicId}`);
                } catch (error) {
                    console.error('Cloudinary image deletion failed:', error);
                }
            } else {
                console.error("Public ID extraction failed, image not deleted.");
            }

            // Delete the post from the database
            const queryDeletePost = 'DELETE FROM posts WHERE id = ? AND userid = ?';
            db.query(queryDeletePost, [postId, userInfo.id], (err, data) => {
                if (err) {
                    return res.status(500).json({ message: 'Database error occurred while deleting post.' });
                }

                if (data.affectedRows === 0) {
                    return res.status(404).json({ message: 'Post not found' });
                }

                return res.status(202).json({ message: 'Post deleted successfully!' });
            });
        });
    });
};


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
