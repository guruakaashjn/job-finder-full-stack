import mongoose from "mongoose";

const connect = async () => {
    try{
        console.log("Connecting to the MongoDB Database...");
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log("Connected to the MongoDB Database");
    }catch(error){
        console.log("Oops!, Failed to connect to MongoDB Database!", error.message);
        process.exit(1);
    }
}

export default connect;