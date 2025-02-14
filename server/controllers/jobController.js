import expressAsyncHandler from "express-async-handler";
import User from "../models/UserModel.js";
import Job from "../models/JobModel.js";

// create a job
export const createJob = expressAsyncHandler(async (req, res) => {
    try {
        const user = await User.findOne({ auth0Id: req.oidc.user.sub });
        const isAuth = req.oidc.isAuthenticated() || user.email;

        if (!isAuth) {
            return res.status(401).json({ message: "Not Authorized" });
        }

        const {
            title,
            description,
            location,
            salary,
            jobType,
            tags,
            skills,
            salaryType,
            negotiable
        } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }
        if (!description) {
            return res.status(400).json({ message: "Description is required" });
        }
        if (!location) {
            return res.status(400).json({ message: "Location is required" });
        }
        if (!salary) {
            return res.status(400).json({ message: "Salary is required" });
        }
        if (!jobType) {
            return res.status(400).json({ message: "JobType is required" });
        }
        if (!tags) {
            return res.status(400).json({ message: "Tags is required" });
        }
        if (!skills) {
            return res.status(400).json({ message: "Skills is required" });
        }

        const job = new Job({
            title,
            description,
            location,
            salary,
            jobType,
            tags,
            skills,
            salaryType,
            negotiable,
            createdBy: user._id,
        });

        await job.save();

        return res.status(201).json(job);
    } catch (error) {
        console.log("Error in createJob: ", error);
        return res.status(500).json({
            message: "Key Internal Server Error",
        });
    }
});

// get all jobs
export const getJobs = expressAsyncHandler(async (req, res) => {
    try {
        const jobs = await Job.find({}).populate(
            "createdBy",
            "name email profilePicture"
        ).sort({ createdAt: -1 });  //sort by latest job
        console.log(jobs);
        return res.status(200).json(jobs);
    } catch (error) {
        console.log("Error in getJobs: ", error);
        return res.status(500).json({
            message: "Key Internal Server Error",
        });
    }
});

// get job by id
export const getJobById = expressAsyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const jobById = await Job.findById(id).populate("createdBy", "name profilePicture");
        if (!jobById) {
            return res.status(404).json({ message: "Job not found" });
        }
        console.log(jobById);
        return res.status(200).json(jobById);
    } catch (error) {
        console.log("Error in getJobById: ", error);
        return res.status(500).json({
            message: "Key Internal Server Error",
        });
    }
});

// get jobs by user id
export const getJobsByUser = expressAsyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const jobsByUser = await Job.find({ createdBy: user._id }).populate(
            "createdBy",
            "name profilePicture"
        );

        console.log(jobsByUser);
        return res.status(200).json(jobsByUser);

    } catch (error) {
        console.log("Error in getJobsByUser: ", error);
        return res.status(500).json({
            message: "Key Internal Server Error",
        });
    }
});

export const searchJobs = expressAsyncHandler(async (req, res) => {
    try {
        const { tags, location, title } = req.query;

        let query = {};

        if (tags) {
            query.tags = { $in: tags.split(",") };
        }

        if (location) {
            query.location = { $regex: location, $options: "i" };
        }

        if (title) {
            query.title = { $regex: title, $options: "i" };
        }

        const jobs = await Job.find(query).populate("createdBy", "name profilePicture");
        return res.status(200).json(jobs);

    } catch (error) {
        console.log("Error in searchJobs: ", error);
        return res.status(500).json({
            message: "Key Internal Server Error",
        });
    }
});


export const applyJob = expressAsyncHandler(async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        const user = await User.findOne({ auth0Id: req.oidc.user.sub });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (job.applicants.includes(user._id)) {
            return res.status(400).json({ message: "Already applied for this job" });
        }

        job.applicants.push(user._id);
        await job.save();

        user.appliedJobs.push(job._id);

        await user.save();
        return res.status(200).json(job);

    } catch (error) {
        console.log("Error in applyJob: ", error);
        return res.status(500).json({
            message: "Key Internal Server Error",
        });
    }
});

export const likeJob = expressAsyncHandler(async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        const user = await User.findOne({ auth0Id: req.oidc.user.sub });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        job.likes.includes(user._id) ? job.likes.splice(user._id) : job.likes.push(user._id);
        await job.save();

        return res.status(200).json(job);
    } catch (error) {
        console.log("Error in likeJob: ", error);
        return res.status(500).json({
            message: "Key Internal Server Error",
        });
    }
});

export const deleteJob = expressAsyncHandler(async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }
        const user = await User.findOne({ auth0Id: req.oidc.user.sub });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const deletedObject = await Job.deleteOne({ _id: req.params.id });
        if (!deletedObject.acknowledged)
            throw new Error("Error occured while deleting the job");
        return res.status(204).json();

    } catch (error) {
        console.log("Error in likeJob: ", error);
        return res.status(500).json({
            message: "Key Internal Server Error",
        });
    }
});