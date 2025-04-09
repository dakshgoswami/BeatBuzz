import mongoose from 'mongoose';

const connection  = async () => {
    try {
     const connection = await mongoose.connect(process.env.MONGODB_URI);
     console.log(`Connected to the database: ${connection.connection.host}`);
    } catch (error) {
        console.log('Error connecting to the database: ', error);
    }
}

export default connection;