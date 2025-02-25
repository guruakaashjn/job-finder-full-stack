import express from "express";
import { auth } from "express-openid-connect";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connect from "./db/connect.js";
import fs from 'fs';
import User from './models/UserModel.js'
import asyncHandler from 'express-async-handler';

dotenv.config();

const app = express();
const serverPort = process.env.SERVER_PORT;
const clientPort = process.env.CLIENT_PORT;

// auth0 configs
const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SECRET,
    baseURL: `${process.env.BASE_URL}${serverPort}`,
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: process.env.ISSUER_BASE_URL,
    routes: {
        postLogoutRedirect: `${process.env.CLIENT_URL}${process.env.CLIENT_PORT}`,
    }
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


// function to check if user exists in the db
const ensureUserInDB = asyncHandler(async (user) => {
    try {
        const existingUser = await User.findOne({ auth0Id: user.sub });

        if (!existingUser) {
            // create a new user document
            const newUser = new User({
                auth0Id: user.sub,
                email: user.email,
                name: user.name,
                role: "jobseeker",
                profilePicture: user.picture,
            });

            await newUser.save();

            console.log("User added to the db", user);
        } else {
            console.log("User already exists in db", existingUser);
        }

    } catch (error) {
        console.log("Error checking or adding user to db", error.message);
    }
})

app.get('/', async (req, res) => {
    if (req.oidc.isAuthenticated()) {
        // check if Auth0 user exists in the db
        await ensureUserInDB(req.oidc.user);

        // redirect to the frontend
        return res.redirect(`${process.env.CLIENT_URL}${process.env.CLIENT_PORT}`);
    } else {
        return res.send("Logged out");
    }
})


// setup routes
const routeFiles = fs.readdirSync("./routes");

routeFiles.forEach((file) => {
    // import dynamic routes
    import(`./routes/${file}`)
        .then((route) => {
            app.use('/api/v1', route.default);
        })
        .catch((error) => {
            console.log("Error importing route", error);
        });
});

const server = async () => {
    try {
        console.log("Starting to run the Server....")
        await connect();
        app.listen(serverPort, () => {
            console.log(`Server is running on port ${serverPort}`);
        });
    } catch (error) {
        console.log("Server error", error);
        process.exit(1);
    }
}

server();

