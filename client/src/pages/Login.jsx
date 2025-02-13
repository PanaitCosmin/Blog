import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/authContext";

const Login = () => {
  const [inputs, setInputs] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();

  const { currentUser, login } = useAuth();

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await login(inputs); 

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setInputs({ username: "", password: "" });
      toast.success("Login successful!");
      navigate("/", {replace: true});
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("Something went wrong");
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-center text-gray-700 mb-6">Login</h1>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-gray-600 font-medium">Username</label>
            <input
              required
              type="text"
              placeholder="Enter your username"
              name="username"
              value={inputs.username}
              onChange={handleChange}
              className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {/* Username credential */}
            <p className="text-gray-400 text-x">Username = Admin</p>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-gray-600 font-medium">Password</label>
            <input
              required
              type="password"
              placeholder="Enter your password"
              name="password"
              value={inputs.password}
              onChange={handleChange}
              className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            
            {/* Password credential */}
            <p className="text-gray-400 text-x">Passsword = admin</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="cursor-pointer w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:scale-105 transition duration-200"
          >
            Login
          </button>

          {/* Register Link */}
          <p className="text-center text-gray-600 mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
