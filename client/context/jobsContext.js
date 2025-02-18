import React, { createContext, useContext, useState, useEffect } from "react";
import { useGlobalContext } from "./globalContext";
import axios from "axios";
import dotenv from "dotenv";
import toast from "react-hot-toast";
dotenv.config();

const JobsContext = createContext();

axios.defaults.baseURL = `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}${process.env.NEXT_PUBLIC_SERVER_PORT}`
axios.defaults.withCredentials = true

export const JobsContextProvider = ({ children }) => {
    const { userProfile } = useGlobalContext();

    const [ jobs, setJobs ] = useState([]);
    const [ loading, setLoading ] = useState(false);
    const [ userJobs, setUserJobs ] = useState([]);

    // get all jobs
    const getJobs = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/v1/jobs`);
            setJobs(res.data);
        } catch (error) {
            console.log("Error getting user-jobs", error);
        } finally {
            setLoading(false);
        }
    };

    // create a job
    const createJob = async (jobData) => {
        try {
            const res = await axios.post(`/api/v1/jobs`, jobData);

            toast.success("Job created successfully");

            // updates jobs state, to see instant updation on the UI. 
            setJobs((prevJobs) => [ res.data, ...prevJobs ]);

            // update userJobs state, only if userProfile exists
            if (userProfile._id) {
                setUserJobs((prevUserJobs) => [ res.data, ...prevUserJobs ]);
            }
        } catch (error) {
            console.log("Error creating job", error);
        }
    };

    // get user jobs
    const getUserJobs = async (userId) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/v1/jobs/users/${userId}`);
            setUserJobs(res.data);
            setLoading(false);
        } catch (error) {
            console.log("Error getting user jobs", error);
        } finally {
            setLoading(false);
        }
    };

    // search jobs
    const searchJobs = async (tags, location, title) => {
        setLoading(true);
        try {
            // build query string
            const query = new URLSearchParams();
            if (tags) query.append("tags", tags);
            if (location) query.append("location", location);
            if (title) query.append("title", title);

            // send the request
            const res = await axios.get(`/api/v1/jobs/search?${query.toString()}`);

            // set jobs to the response data
            setJobs(res.data);
            setLoading(false);
        } catch (error) {
            console.log("Error searching jobs", error);
        } finally {
            setLoading(false);
        }
    };

    // get job by id
    const getJobById = async (jobId) => {
        setLoading(true);
        try {
            const res = axios.get(`/api/v1/jobs/${jobId}`);
            setLoading(false);
            return res.data;
        } catch (error) {
            console.log("Error getting Job by Id", error);
        } finally {
            setLoading(false);
        }
    }

    // like/unlike a job
    const likeJob = async (jobId) => {
        try {
            const res = axios.put(`/api/v1/jobs/${jobId}/like`);
            toast.success("Job liked successfully");
            getJobs();
        } catch (error) {
            console.log("Error liking the job", error);
        }
    };

    // apply to a job
    const applyToJob = async (jobId) => {
        try {
            const res = await axios.put(`/api/v1/jobs/${jobId}/apply`);
            toast.success("Applied to job Successfully");
            getJobs();
        } catch (error) {
            console.log("Error applying to the job", error);
            toast.error(error.response.data.message);
        }
    };

    // delete a job
    const deleteJob = async (jobId) => {
        try {
            await axios.delete(`/api/v1/jobs/${jobId}`);

            setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
            // userJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
            searchJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));

            toast.success("Job deleted Successfully");
        } catch (error) {
            console.log("Error deleting the job", error);
        }
    }

    useEffect(() => {
        getJobs();
    }, []);

    useEffect(() => {
        if (userProfile._id) {
            getUserJobs(userProfile._id);
        }
    }, [ userProfile ]);

    return (
        <JobsContext.Provider
            value={{
                jobs,
                loading,
                userJobs,
                createJob,
                searchJobs,
                getJobById,
                likeJob,
                applyToJob,
                deleteJob,
            }}>{children}</JobsContext.Provider>
    );
};

export const useJobsContext = () => {
    return useContext(JobsContext);
}