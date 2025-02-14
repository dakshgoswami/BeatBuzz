import mongoose from 'mongoose';

const connection  = async () => {
    try {
     const connection = await mongoose.connect('mongodb://127.0.0.1:27017/beatbuzz');
     console.log(`Connected to the database: ${connection.connection.host}`);
    } catch (error) {
        console.log('Error connecting to the database: ', error);
    }
}

export default connection;