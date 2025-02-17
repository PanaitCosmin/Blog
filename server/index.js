import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoute from './routes/authRoute.js'
import postRoute from './routes/postRoute.js'
import userRoute from './routes/userRoute.js'
import { upload, deleteOldImage  } from './helpers/upload.js'
// import session from 'express-session';

const PORT = process.env.PORT
const app = express()

console.log(Intl.DateTimeFormat().resolvedOptions().timeZone)

const allowedOrigin = process.env.CLIENT; 
console.log('Origin:', allowedOrigin)

// import mysql from "mysql2"; // ✅ Use "mysql2" (not "mysql2/promise")
// import MySQLStore from "express-mysql-session";
import connectToDb from './db.js'
// const dbPool = mysql.createPool({
//     host: process.env.HOST_DB,
//     user: process.env.USER_DB,
//     password: process.env.PASSWORD_DB,
//     database: process.env.DB,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
// });


// const sessionStore = new (MySQLStore(session))({
//     clearExpired: true,
//     expiration: 86400000,
//       checkExpirationInterval: 3600000,
//     createDatabaseTable: true,
//       }, 
//       dbPool);

// Middleware
app.use(cors({
    origin: allowedOrigin,  // Allow only the frontend domain
    credentials: true,      // If using cookies/authentication
    methods: ["GET", "POST", "PUT", "DELETE"], 
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", allowedOrigin);
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   next();
// });


//   app.use(session({
//     name: 'session_name',
//     secret: process.env.SESSION_SECRET || 'your_secret_key',
//     store: sessionStore,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         secure: process.env.NODE_ENV === 'production', // Secure in production
//         httpOnly: true,
//         maxAge: 24 * 60 * 60 * 1000, // 1 day
//         sameSite: "None"
//     }
// }));

app.use(express.json())
app.use(cookieParser())



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

  
// API Routes
app.use('/api/auth', authRoute)
app.use('/api/posts', postRoute)
app.use('/api/user', userRoute)


app.listen(PORT, () => {
    console.log('Connected: ', PORT)
})

// Test DB connection
connectToDb().then(()=>{
    console.log('connected to db!!');
  }
  ).catch((err)=>{
      return res.status(500).send({msg: 'Error connecting to database', err: err.message})
  })
// dbPool.getConnection((err, connection) => {
//     if (err) {
//         console.error("Database connection failed:", err);
//     } else {
//         console.log("Connected to the database");
//         connection.release();
//     }
// });