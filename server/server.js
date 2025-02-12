import express from "express";
import { auth } from "express-openid-connect";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connect from "./db/connect.js";
dotenv.config();

const app = express();
const serverPort = process.env.SERVER_PORT;
const clientPort = process.env.CLIENT_PORT;

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SECRET,
    baseURL: `${process.env.BASE_URL}${serverPort}`,
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: process.env.ISSUER_BASE_URL
};

// Setup required Middlewares.

// CORS (Cross-Origin Resource Sharing)
// It allows frontend to communicate with the backend, without CORS, browsers would block cross-origin requests.
app.use(
    cors({
        origin: `${process.env.CLIENT_URL}${clientPort}`,
        credentials: true,
    })
);
// enable the Express.js app to parse incoming JSON request bodies.
app.use(express.json());
// enable the Express.js app to parse incoming URL-encoded form data.
app.use(express.urlencoded({ extended: true }));
// enable the Express.js app to parse the cookies from the incoming HTTP requests.
app.use(cookieParser());
// setup authentication routes /login, /logout, and /callback to the baseURL.
// achieved from Auth0.
app.use(auth(config));

// // req.isAuthenticated is provided from the auth router
// app.get('/', (req, res) => {
//     res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
// });
  
const server = async () => {
    try {
        console.log("Starting to run the Server....")
        await connect();
        app.listen(serverPort, () => {
            console.log(`Server is running on port ${serverPort}`);
        });
    }catch(error){
        console.log("Server error", error);
        process.exit(1);
    }
}

server();

