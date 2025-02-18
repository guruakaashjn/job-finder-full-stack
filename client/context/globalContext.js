import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import dotenv from "dotenv";
dotenv.config();

const GlobalContext = createContext();

axios.defaults.baseURL = `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}${process.env.NEXT_PUBLIC_SERVER_PORT}`;
axios.defaults.withCredentials = true;

export const GlobalContextProvider = ({ children }) => {
    const [ isAuthenticated, setIsAuthenticated ] = useState(false);
    const [ auth0User, setAuth0User ] = useState(null);
    const [ userProfile, setUserProfile ] = useState({});
    const [ loading, setLoading ] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            setLoading(true);
            try {
                const res = await axios.get("/api/v1/check-auth");
                setIsAuthenticated(res.data.isAuthenticated);
                setAuth0User(res.data.user);
                setLoading(false);
            } catch (error) {
                console.log("Error checking auth", error);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();

    }, []);

    const getUserProfile = async (id) => {
        try {
            const res = await axios.get(`/api/v1/users/${id}`);
            setUserProfile(res.data);
        } catch (error) {
            console.log("Error getting user-profile", error);
        }
    };

    useEffect(() => {
        if (isAuthenticated && auth0User) {
            getUserProfile(auth0User?.sub);
        }
    }, [ isAuthenticated, auth0User ]);

    return (
        <GlobalContext.Provider value={{ isAuthenticated, auth0User, userProfile, getUserProfile, loading }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => {
    return useContext(GlobalContext);
}