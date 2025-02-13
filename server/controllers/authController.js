import { db } from "../db.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


export const getMe = (req, res) => {
    const token = req.cookies.access_token

    if (!token) {
        return res.status(401).json({message: "Not authenticated"})
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, userInfo) => {
        if (err) {
            return res.status(403).json({message: 'Token is not valid'})
        }
        // exclude password from the response 
        const { password, ...other } = userInfo
        res.status(200).json(other)
    })
}

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body
        // check existing user
        const checkUserQuery = 'SELECT * FROM users WHERE email = ? OR username = ?'
        const checkValues = [email, username]

        db.query(checkUserQuery, checkValues, (err, data) => {
            if (err) {
                console.log(err)
                return res.status(500).json({error: 'Database error occurred while checking user.'})
            }
           
            if (data.length) {
                return res.status(400).json({ error: 'User with this email or username already exists.'})
            }
            
            // Hash password
            const salt = bcrypt.genSaltSync(10)
            const hashedPassword = bcrypt.hashSync(password, salt)            // add user
            
            const insertUserQuery = 'INSERT INTO users (`username`, `email`, `password`) VALUES (?)'
            const insertValues = [
                username, 
                email,
                hashedPassword
            ]
    
            db.query(insertUserQuery, [insertValues], (err, data) => {
                if (err) {
                    console.error(err)
                    return res.status(500).json({ error: 'Database error occurred while creating user.'})
                }
            
                return res.status(201).json({
                    success: 'User has been created successfully',
                    user: { username, email}
                })
            })
        })


    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Something went wrong during registration' });
    }
};

export const login = async (req, res) => {
    try {
        const q = "SELECT * FROM users WHERE username = ?"
        db.query(q, [req.body.username], async (err, data) => {
            if (err) {
                console.log('Database error: ', err)
                return res.status(500).json({
                    error: 'A database error occurred.'
                })
            }

            if (data.length === 0) return res.status(404).json({
                error: "User not found."
            })

            const user = data[0];

            // Check password
            const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password)
        
            if (!isPasswordCorrect) return res.status(400).json({
                error: 'Incorrect password.'
            })
            
            // Generate JWT token
            const token = jwt.sign(
                {email: user.email, id: user.id, username: user.username}, 
                process.env.JWT_SECRET, 
                { expiresIn: '24h' },       
            )  
            // Exclude password from the user data
            const { password, ...other } = user;
            
            // Set token in a cookie
            res.cookie('access_token', token, {
                httpOnly: true,
                sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict',
                secure: process.env.NODE_ENV === 'production'
            }).status(200).json({
                user: other,
                success: "Login successfully"
            })
        })
    } catch (error) {
        console.log('Login error:', error)
        res.status(500).json({message: "An unexpected error occurred during login."})
    }
}

export const logout = (req, res) => {
    res.clearCookie("access_token", {
        httpOnly: true, // Ensures the cookie is not accessible via JavaScript
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // Dynamic sameSite based on environment
        secure: process.env.NODE_ENV === "production", // Only secure cookies in production
    }).status(200).json({message: 'User has been logged out.'})
}
