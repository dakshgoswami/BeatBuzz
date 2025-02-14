import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    imageUrl: {
        type: String,
        required: true
    },
    clerkId:{
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    }
}, {timestamps: true});

export const User = mongoose.model('User', userSchema);

export default User;