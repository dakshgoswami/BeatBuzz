import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import { clerkMiddleware } from '@clerk/express'
import fileUpload from 'express-fileupload'
import path from 'path'
import cors from 'cors'
import { createServer } from 'http'

import connection from './lib/db.js'
import userRoute from './routes/user.route.js'
import statsRoute from './routes/stats.route.js'
import songsRoute from './routes/songs.route.js'
import albumsRoute from './routes/albums.route.js'
import authRoute from './routes/auth.route.js'
import adminRoute from './routes/admin.route.js'
import uploadRoute from './routes/upload.route.js'
import { initializeSocket } from './lib/socket.js'


const app = express()
const PORT = process.env.PORT || 8000
const __dirname = path.resolve()
app.use(express.json());
app.use(clerkMiddleware())
app.use(fileUpload(
    {
        useTempFiles: true,
        tempFileDir: path.join(__dirname, 'tmp'),
        createParentPath: true,
        limits:{
            fileSize: 10 * 1024 * 1024 //10mb max file
        }
    }
))
app.use("/uploads", express.static("uploads"));

const httpServer = createServer(app);
initializeSocket(httpServer);

app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}))

app.use('/api/users', userRoute)
app.use('/api/stats', statsRoute)
app.use('/api/songs', songsRoute)
app.use('/api/albums', albumsRoute)
app.use('/api/auth', authRoute)
app.use('/api/admin', adminRoute)
app.use("/api/upload", uploadRoute);

app.use((error, req, res, next)=>{
    res.status(500).json({message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message})
})

httpServer.listen(PORT, ()=>{
    console.log('Server is running on ', PORT)
    connection()
})