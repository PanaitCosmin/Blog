import { db } from "../db.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// Update user
// export const updateUser = (req, res) => {
//     const token = req.cookies.access_token

//     if (!token) {
//         return res.status(401).json({message: "Not authenticated"})
//     }

//     jwt.verify(token, process.env.JWT_SECRET, async (err, userInfo) => {
//         if (err) {
//             return res.status(403).json({message: 'Invalid token'})
//         }

//         const userId = userInfo.id
//         const { username, email, password, img } = req.body

//         // Hash new password if provided
//         let hashedPassword = null
//         if (password) {
//             const salt = bcrypt.genSaltSync(10)
//             hashedPassword = bcrypt.hashSync(password, salt)
//         }

//         // Update query with only provided fields
//         let updateQuery = "UPDATE users SET "
//         let updateValues = []

//         // update username
//         if (username) {
//             updateQuery += 'username = ?, '
//             updateValues.push(username)
//         }

//         // update email
//         if (email) {
//             updateQuery += 'email = ?, '
//             updateValues.push(email)
//         }

//         // update password
//         if (hashedPassword) {
//             updateQuery += 'password = ?, '
//             updateValues.push(hashedPassword)
//         }

//         updateQuery = updateQuery.slice(0, -2) // remove  last comma
//         updateQuery += ' WHERE id = ?'
//         updateValues.push(userId)

//         // Execute the query
//         db.query(updateQuery, updateValues, (err, data) => {
//             if (err) {
//                 console.log('Database update error:', err)
//                 return res.status(500).json({
//                     error: 'Error updating profile'
//                 })
//             }

//             // Generate a new JWT token with updated info
//             const newToken = jwt.sign(
//                 { email: email || userInfo.email, id: userId, username: username || userInfo.username},
//                 process.env.JWT_SECRET,
//                 { expiresIn: '24h'}
//             )

//             // Send new token in a cookie
//             res.cookie("access_token", newToken, {
//                 httpOnly: true,
//                 sameSite: process.env.NODE_ENV === "production" ? "lax" : "strict",
//                 secure: process.env.NODE_ENV === "production",
//             }).status(200).json({
//                 success: 'Profile updated successfully',
//                 token: newToken
//             })
//         })
//     }) 
// }
export const updateUser = (req, res) => {
    // Check if user is authenticated via session
    if (!req.session.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.session.user.id; // Get user ID from session
    const { username, email, password, img } = req.body;

    // Hash new password if provided
    let hashedPassword = null;
    if (password) {
        const salt = bcrypt.genSaltSync(10);
        hashedPassword = bcrypt.hashSync(password, salt);
    }

    // Dynamically build the update query
    let updateQuery = "UPDATE users SET ";
    let updateValues = [];

    if (username) {
        updateQuery += 'username = ?, ';
        updateValues.push(username);
    }
    if (email) {
        updateQuery += 'email = ?, ';
        updateValues.push(email);
    }
    if (hashedPassword) {
        updateQuery += 'password = ?, ';
        updateValues.push(hashedPassword);
    }
    if (img) {
        updateQuery += 'img = ?, ';
        updateValues.push(img);
    }

    updateQuery = updateQuery.slice(0, -2); // Remove last comma
    updateQuery += ' WHERE id = ?';
    updateValues.push(userId);

    // Execute the query
    db.query(updateQuery, updateValues, (err, data) => {
        if (err) {
            console.log('Database update error:', err);
            return res.status(500).json({ error: 'Error updating profile' });
        }

        // Update session user data
        req.session.user = {
            ...req.session.user,
            username: username || req.session.user.username,
            email: email || req.session.user.email,
            img: img || req.session.user.img,
        };

        return res.status(200).json({
            success: 'Profile updated successfully',
            user: req.session.user,
        });
    });
};


// Delete user
// export const deleteUser = (req, res) => {
//     const token = req.cookies.access_token; // Fixed typo

//     if (!token) {
//         return res.status(401).json({ message: "Not authenticated" });
//     }

//     jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
//         if (err) {
//             return res.status(403).json({ message: "Invalid token" });
//         }

//         const userId = userInfo.id;
//         const deleteQuery = "DELETE FROM users WHERE id = ?";

//         db.query(deleteQuery, [userId], (err, result) => {
//             if (err) {
//                 console.error("Database delete error:", err);
//                 return res.status(500).json({ message: "Database delete error" });
//             }

//             // Check if any row was deleted
//             if (result.affectedRows === 0) {
//                 return res.status(404).json({ message: "User not found or already deleted" });
//             }

//             // Clear authentication cookie after deletion
//             res.clearCookie("access_token", {
//                 httpOnly: true,
//                 sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
//                 secure: process.env.NODE_ENV === "production",
//             });

//             return res.status(200).json({ success: "User deleted successfully" });
//         });
//     });
// };

export const deleteUser = (req, res) => {
    // Check if user is authenticated via session
    if (!req.session.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.session.user.id; // Get user ID from session
    const deleteQuery = "DELETE FROM users WHERE id = ?";

    db.query(deleteQuery, [userId], (err, result) => {
        if (err) {
            console.error("Database delete error:", err);
            return res.status(500).json({ message: "Database delete error" });
        }

        // Check if the user was actually deleted
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found or already deleted" });
        }

        // Destroy session after user is deleted
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session:", err);
                return res.status(500).json({ message: "Error logging out after deletion" });
            }

            return res.status(200).json({ success: "User deleted successfully" });
        });
    });
};
