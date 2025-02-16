import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios'
import { toast } from 'react-hot-toast'


export const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error("useAuth must be used within an AuthContextProvider")
    }

    return context
}

export const AuthContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null)

    

    useEffect(() => {    
        const fetchUser = async () => {
            try {
                const res = await axios.get('/api/auth/me', { withCredentials: true })
                setCurrentUser(res.data) // Fixed: Use `res.data`, not `res.user`
            } catch (error) {
                console.error('Not authenticated: ', error)
                setCurrentUser(null)
            }
        }
    
        fetchUser()
    }, []) 
    
    const login = async (inputs) => {
        try {
            const res = await axios.post('/api/auth/login', inputs, {
                withCredentials: true
            });
    
            if (res.data.error) {
                return { error: res.data.error }; // Return error for `handleLogin` to handle
            }
    
            setCurrentUser(res.data.user); // Set user state on success
            return res.data; // Return response data
        } catch (error) {
            return { error: error.response?.data?.error || "Something went wrong" };
        }
    };

    const logout = async (inputs) => {
        try {
            const res = await axios.post('/api/auth/logout', {}, { withCredentials: true })
            setCurrentUser(null)
            toast.success("User logout successfully");
        } catch (error) {
            console.error("Logout failed: ", error)
            toast.error("Logout failed");
        }
    }

    return (
        <AuthContext.Provider value={{currentUser, setCurrentUser, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}