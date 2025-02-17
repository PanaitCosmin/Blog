import { dbconn } from "../db.js";
import bcrypt from "bcrypt";

// 🔹 Update User
export const updateUser = (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.session.user.id;
    const { username, email, password } = req.body;

    // Hash new password if provided
    let hashedPassword = null;
    if (password) {
        const salt = bcrypt.genSaltSync(10);
        hashedPassword = bcrypt.hashSync(password, salt);
    }

    // Build update query dynamically
    let updateQuery = "UPDATE users SET ";
    let updateValues = [];

    if (username) {
        updateQuery += "username = ?, ";
        updateValues.push(username);
    }
    if (email) {
        updateQuery += "email = ?, ";
        updateValues.push(email);
    }
    if (hashedPassword) {
        updateQuery += "password = ?, ";
        updateValues.push(hashedPassword);
    }

    updateQuery = updateQuery.slice(0, -2) + " WHERE id = ?";
    updateValues.push(userId);

    // Execute the update
    dbconn.query(updateQuery, updateValues, (err, data) => {
        if (err) {
            console.error("Database update error:", err);
            return res.status(500).json({ error: "Error updating profile" });
        }

        // Update session with new user info
        req.session.user = {
            id: userId,
            username: username || req.session.user.username,
            email: email || req.session.user.email,
        };

        return res.status(200).json({ success: "Profile updated successfully" });
    });
};

// 🔹 Delete User
export const deleteUser = (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = req.session.user.id;
    const deleteQuery = "DELETE FROM users WHERE id = ?";

    dbconn.query(deleteQuery, [userId], (err, result) => {
        if (err) {
            console.error("Database delete error:", err);
            return res.status(500).json({ message: "Database delete error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found or already deleted" });
        }

        // Destroy session after deletion
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: "Error clearing session" });
            }

            return res.status(200).json({ success: "User deleted successfully" });
        });
    });
};
