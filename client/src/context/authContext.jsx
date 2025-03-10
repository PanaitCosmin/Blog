import { createContext, useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthContextProvider");
    }
    return context;
};

export const AuthContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);

    // 🔹 Login User
    const login = async (inputs) => {
        try {
            const res = await axios.post("/api/auth/login", inputs, { withCredentials: true });

            if (res.data.error) {
                return { error: res.data.error };
            }

            setCurrentUser(res.data.user);
            return res.data;
        } catch (error) {
            return { error: error.response?.data?.error || "Something went wrong" };
        }
    };

    // 🔹 Logout User
    const logout = async () => {
        try {
            await axios.post("/api/auth/logout", {}, { withCredentials: true });
            setCurrentUser(null);
            toast.success("User logged out successfully");
        } catch (error) {
            console.error("Logout failed: ", error);
            toast.error("Logout failed");
        }
    };

    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
