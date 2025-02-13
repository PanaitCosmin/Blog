import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoute from './routes/authRoute.js'
import postRoute from './routes/postRoute.js'
import userRoute from './routes/userRoute.js'
import { db } from './db.js'
import { upload } from './helpers/upload.js'


const PORT = process.env.PORT
const app = express()

// Cors Options
const corsOptions = {
    origin: process.env.CLIENT, // Frontend URL
    credentials: true, // Allow credentials (cookies)
};

// Middleware
app.use(express.json())
app.use(cors(corsOptions))
app.use(cookieParser())


app.post('/api/upload', upload.single('file'), function (req, res) {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Send back the filename of the uploaded image
    res.status(200).json({ filename: file.filename });
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
