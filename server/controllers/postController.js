import { dbconn } from "../db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔹 Single Post
export const getPost = async (req, res) => {
    const queryPost = "SELECT p.id, u.username, title, `desc`, p.img, u.img as userImg, cat, date FROM users u JOIN posts p ON u.id = p.userid WHERE p.id = ?";

    dbconn.query(queryPost, [req.params.id], (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        return res.status(200).json(data[0]);
    });
};

// 🔹 All Posts
export const getPosts = (req, res) => {
    const queryPosts = req.query.cat
        ? "SELECT * FROM posts WHERE cat = ? ORDER BY date DESC"
        : "SELECT * FROM posts ORDER BY date DESC";

    const values = req.query.cat ? [req.query.cat] : [];

    dbconn.query(queryPosts, values, (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        return res.status(200).json(data);
    });
};

// 🔹 Get Menu Posts
export const getMenuPosts = (req, res) => {
    const queryMenuPosts = "SELECT * FROM posts WHERE cat = ? AND id != ? ORDER BY date DESC";

    const values = [req.query.cat, parseInt(req.query.parrentId)];

    dbconn.query(queryMenuPosts, values, (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        return res.status(200).json(data);
    });
};

// 🔹 Create Post
export const addPost = (req, res) => {
    // if (!req.session.user) {
    //     return res.status(401).json({ message: "Not authenticated" });
    // }

    const userId = req.body.id;

    const queryAddPost = "INSERT INTO posts (`title`, `desc`, `img`, `cat`, `date`, `userid`) VALUES (?)";

    const postValues = [req.body.title, req.body.desc, req.body.img, req.body.cat, req.body.date, userId];

    dbconn.query(queryAddPost, [postValues], (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        return res.status(201).json({ message: "Post created!" });
    });
};

// 🔹 Delete Single Post
export const deletePost = (req, res) => {
    const postId = req.params.id;
    const userId = req.body.id;  // ✅ Extract userId properly

    if (!userId) {
        return res.status(400).json({ message: "User ID is required." });
    }

    console.log('Post id:', postId);
    console.log('User id:', userId);

    const queryGetPost = "SELECT img FROM posts WHERE id = ? AND userid = ?";
    dbconn.query(queryGetPost, [postId, userId], async (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error while fetching post.", error: err });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "Post not found or unauthorized." });
        }

        const imageUrl = result[0].img;

        // Extract Cloudinary Public ID from URL
        const getPublicIdFromUrl = (url) => {
            try {
                const parts = url.split("/");
                const fileName = parts.pop();
                const folder = parts.slice(parts.indexOf("blog_images")).join("/");
                return `${folder}/${fileName.split(".")[0]}`;
            } catch (error) {
                console.error("Error extracting public ID:", error);
                return null;
            }
        };

        const publicId = getPublicIdFromUrl(imageUrl);

        // Delete the image from Cloudinary
        if (publicId) {
            try {
                await cloudinary.uploader.destroy(publicId);
                console.log(`Deleted image: ${publicId}`);
            } catch (error) {
                console.error("Cloudinary image deletion failed:", error);
            }
        }

        // Delete the post from the database
        const queryDeletePost = "DELETE FROM posts WHERE id = ? AND userid = ?";
        dbconn.query(queryDeletePost, [postId, userId], (err, data) => {
            if (err) {
                return res.status(500).json({ message: "Database error while deleting post.", error: err });
            }

            if (data.affectedRows === 0) {
                return res.status(404).json({ message: "Post not found" });
            }

            return res.status(202).json({ message: "Post deleted successfully!" });
        });
    });
};


// 🔹 Update Post
export const updatePost = (req, res) => {
    // if (!req.session.user) {
    //     return res.status(401).json({ message: "Not authenticated" });
    // }

    const postId = req.params.id;
    const userId = req.body.id;

    const queryUpdatePost = `
        UPDATE posts 
        SET title = ?, \`desc\` = ?, img = ?, date = ?, cat = ? 
        WHERE id = ? AND userid = ?`;

    const updateValues = [
        req.body.title,
        req.body.desc,
        req.body.img,
        req.body.date,
        req.body.cat,
        postId,
        userId,
    ];

    dbconn.query(queryUpdatePost, updateValues, (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }

        if (data.affectedRows === 0) {
            return res.status(404).json({ error: "Post not found or unauthorized" });
        }

        return res.status(200).json({ success: "Post updated!" });
    });
};
