import express from 'express'
import dotenv from 'dotenv'
import { clerkMiddleware } from '@clerk/express'
import fileUpload from 'express-fileupload'
import connection from './lib/db.js'
import path from 'path'
import cors from 'cors'

import userRoute from './routes/user.route.js'
import statsRoute from './routes/stats.route.js'
import songsRoute from './routes/songs.route.js'
import albumsRoute from './routes/albums.route.js'
import authRoute from './routes/auth.route.js'
import adminRoute from './routes/admin.route.js'
import { createServer } from 'http'
import { initializeSocket } from './lib/socket.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
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

// // Clerk middleware to populate `req.auth`
// app.use((req, res, next) => {
//     const auth = getAuth(req);
//     req.auth = auth; // Attach auth to req
//     next();
//   });

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

app.use((error, req, res, next)=>{
    res.status(500).json({message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message})
})

httpServer.listen(PORT, ()=>{
    console.log('Server is running on ', PORT)
    connection()
})