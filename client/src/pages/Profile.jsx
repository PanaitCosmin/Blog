import React from 'react'
import { useAuth } from '../context/authContext'
import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const Profile = () => {

  const { currentUser, setCurrentUser, logout } = useAuth()

  const [formData, setFormData] = useState({
    id: currentUser.id,
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    password: '',
  })

  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const res = await axios.put('/api/user/', formData, {
        withCredentials: true
      })

      setCurrentUser({
        username: formData.username,
        email: formData.email,
      })

      toast.success(res.data.success)
    } catch (error) {
      console.error('Update failed:', error)
      toast.error('Failed to update profile')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action is irreversible.')) {
      return
    }

    try {
      const res = await axios.delete('/api/user/', {
        withCredentials: true
      })
      
      setCurrentUser(null)

      await logout()
      toast.success(res.data.success)

      navigate('/', {replace: true})
    } catch (error) {
      toast.error("Error: User not deleted")
      console.error('Delete user error:', error)
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 mt-[15vh]">
      {/* Sidebar */}
      <aside className="w-full md:w-1/4 bg-white shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-700 mb-6">Dashboard</h2>
        {/* <ul className="space-y-4">
          <li className="text-blue-500 font-medium">Profile Settings</li>
          <li className="text-gray-600 hover:text-blue-500 cursor-pointer">Posts Manager</li>
          <li className="text-gray-600 hover:text-blue-500 cursor-pointer">Subscription</li>
        </ul> */}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Update User</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-gray-600 font-medium">Username</label>
              <input
                type="text"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-gray-600 font-medium">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-gray-600 font-medium">New Password (Optional)</label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Update Button */}
            <button
              type="submit"
              className="cursor-pointer w-full bg-blue-500 text-white py-3 rounded-md font-medium hover:bg-blue-600 transition duration-200"
            >
              Update Profile
            </button>
          </form>

          {/* Delete Account Section */}
          <h2 className="text-2xl font-bold text-gray-700 mt-8">Delete User</h2>
          <button
            onClick={handleDelete}
            className="cursor-pointer w-full bg-red-500 text-white py-3 rounded-md font-medium hover:bg-red-600 transition duration-200 mt-4"
          >
            Delete Account
          </button>
        </div>
      </main>
    </div>
  );
}

export default Profile