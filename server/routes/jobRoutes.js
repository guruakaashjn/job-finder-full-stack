import express from "express";
import { createJob, getJobs, getJobById, getJobsByUser, searchJobs, applyJob, likeJob, deleteJob } from "../controllers/jobController.js";
import protect from "../middleware/protect.js";


const router = express.Router();

// post a job
router.post("/jobs", protect, createJob);
// get all jobs
router.get("/jobs", getJobs);
// search for jobs
router.get("/jobs/search", searchJobs);
// search jobs by user id
router.get("/jobs/users/:id", protect, getJobsByUser);
// apply to a job
router.put("/jobs/:id/apply", protect, applyJob);
// like or unlike a job
router.put("/jobs/:id/like", protect, likeJob);
// get job by id
router.get("/jobs/:id", protect, getJobById);
// delete job by id
router.delete("/jobs/:id", protect, deleteJob);



export default router;