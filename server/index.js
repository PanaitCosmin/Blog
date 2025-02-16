import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoute from './routes/authRoute.js'
import postRoute from './routes/postRoute.js'
import userRoute from './routes/userRoute.js'
import { db } from './db.js'
import { upload, deleteOldImage  } from './helpers/upload.js'
import session from 'express-session';

const PORT = process.env.PORT
const app = express()

const allowedOrigin = process.env.CLIENT; 
console.log('Origin:', allowedOrigin)

// Middleware
app.use(cors({
    origin: allowedOrigin,  // Allow only the frontend domain
    credentials: true,      // If using cookies/authentication
  }));
// app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

app.use(session({
    secret: process.env.SESSION_SECRET, // Secret for signing the session ID
    resave: false,  // Don't save session if nothing changed
    saveUninitialized: false, // Don't create session until something is stored
    cookie: {
        httpOnly: true, // Prevents JavaScript access
        secure: process.env.NODE_ENV === 'production', // Only secure in production
        sameSite: 'Lax', // Helps prevent CSRF attacks
        maxAge: 24 * 60 * 60 * 1000, // 1-day session duration
    }
}));

// Ensure response headers allow credentials
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Origin", allowedOrigin);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

// Image Upload Route
app.post('/api/upload', upload.single('image'), async (req, res) => {
  const newImageUrl = req.file.path; // Cloudinary image URL from multer
  const oldImageUrl = req.body.oldImage; // Old image URL from request

  // Delete old image if it exists
  if (oldImageUrl) {
      await deleteOldImage(oldImageUrl);
  }

  res.json({ url: newImageUrl }); // Return new Cloudinary image URL
});

  

app.use('/api/auth', authRoute)
app.use('/api/posts', postRoute)
app.use('/api/user', userRoute)


app.listen(PORT, () => {
    console.log('Connected: ', PORT)
})

// Test DB connection
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack)
    } else {
        console.log('Connected to the database')
    }
})