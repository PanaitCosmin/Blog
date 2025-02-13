import axios from 'axios'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

const Register = () => {

  const [inputs, setInputs] = useState({
    username: '',
    email: '',
    password: ''
  })

  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // const { data } = await axios.post('http://localhost:8080/api/auth/register', inputs);
      const { data } = await axios.post('/api/auth/register', inputs);
  
      if (data.error) {
        toast.error(data.error); // This should work if error is properly received
      } else {
        setInputs({ username: '', email: '', password: '' });
        toast.success(data.success);
        navigate('/login', {replace: true});
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Something went wrong'); 
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-center text-gray-700 mb-6">Register</h1>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-gray-600 font-medium">Username</label>
            <input
              required
              type="text"
              placeholder="Enter your username"
              name="username"
              value={inputs.username}
              onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
              className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-gray-600 font-medium">Email</label>
            <input
              required
              type="email"
              placeholder="Enter your email"
              name="email"
              value={inputs.email}
              onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
              className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-gray-600 font-medium">Password</label>
            <input
              required
              type="password"
              placeholder="Enter your password"
              name="password"
              value={inputs.password}
              onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
              className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="cursor-pointer w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:scale-105 transition duration-200"
          >
            Register
          </button>

          {/* Login Link */}
          <p className="text-center text-gray-600 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register