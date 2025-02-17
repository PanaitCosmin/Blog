import { dbconn } from "../db.js";
import bcrypt from "bcrypt";

export const getMe = (req, res) => {
    // console.log("Session:", req.session);
    console.log("Session ID:", req.sessionID, "Session Data:", req.session);
    if (!req.session.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    // Exclude password from the response
    const { password, ...other } = req.session.user;
    res.status(200).json(other);
};

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const checkUserQuery = "SELECT * FROM users WHERE email = ? OR username = ?";
        const checkValues = [email, username];

        dbconn.query(checkUserQuery, checkValues, (err, data) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error occurred while checking user." });
            }

            if (data.length) {
                return res.status(400).json({ error: "User with this email or username already exists." });
            }

            // Hash password
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);

            // Insert new user
            const insertUserQuery = "INSERT INTO users (`username`, `email`, `password`) VALUES (?, ?, ?)";
            dbconn.query(insertUserQuery, [username, email, hashedPassword], (err, result) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ error: "Database error occurred while creating user." });
                }

                return res.status(201).json({
                    success: "User has been created successfully",
                    user: { username, email },
                });
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong during registration" });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const query = "SELECT * FROM users WHERE username = ?";
        dbconn.query(query, [username], async (err, data) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "A database error occurred." });
            }

            if (data.length === 0) {
                return res.status(404).json({ error: "User not found." });
            }

            const user = data[0];

            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (!isPasswordCorrect) {
                return res.status(400).json({ error: "Incorrect password." });
            }

            // 🔹 Assign user to existing session instead of creating a new one
            req.session.user = {
                id: user.id,
                username: user.username,
                email: user.email,
            };

            req.session.save((err) => {
                if (err) {
                    console.error("Session save error:", err);
                    return res.status(500).json({ error: "Session error." });
                }

                console.log("User logged in, session updated:", req.session);
                res.status(200).json({
                    user: req.session.user,
                    success: "Login successful",
                });
            });
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "An unexpected error occurred during login." });
    }
};


export const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).json({ error: "Logout failed" });
        }

        res.clearCookie("connect.sid", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        });

        res.status(200).json({ message: "User has been logged out." });
    });
};
