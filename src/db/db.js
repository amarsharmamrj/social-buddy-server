import mongoose from 'mongoose'

const Connection = async () => { 
    try { 
        await mongoose.connect(process.env.MONGODB_STRING, { useNewUrlParser: true, useUnifiedTopology: true});
        console.log("Database connected successfully!!");
    } catch (error) {
        console.log("Database connection failed!!")
    }
} 
 
//adding comment  
export default Connection; 