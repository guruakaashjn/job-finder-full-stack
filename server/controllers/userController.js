import asyncHandler from "express-async-handler";
import User from "../models/UserModel.js";

export const getUserProfile = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params

        // find user by auth0Id
        const getUserProfileById = await User.findOne({ auth0Id: id });
        if (!getUserProfileById) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        res.status(200).json(getUserProfileById);
    } catch (error) {
        console.log("Error in getUserProfile: ", error);

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
})