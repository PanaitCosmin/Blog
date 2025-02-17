import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import axios from 'axios';
import moment from 'moment';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/authContext';



const Write = () => {
  const {currentUser} = useAuth()
  const navigate = useNavigate();
  const state = useLocation().state;

  const quillRef = useRef(null)

  // Initialize states with existing post data or default values
  const [title, setTitle] = useState(state?.title || '');
  const [desc, setDesc] = useState(state?.desc || '');
  const [cat, setCat] = useState(state?.cat || 'art');
  const [img, setImg] = useState(null); // Image is null initially, to be updated if needed

  const uploadImage = async (imageFile, oldImageUrl) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (oldImageUrl) formData.append('oldImage', oldImageUrl); // Send old image URL
    
    try {
      const response = await axios.post('/api/upload', formData, {withCredentials: true});
  
      if (response.data.url) {
        return response.data.url; // Cloudinary image URL
      } else {
        throw new Error('Image upload failed: No URL returned');
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    let imageUrl = state?.img; // Default to existing image URL
  
    if (img) {
      try {        
        // Upload new image & send old image URL to delete it
        imageUrl = await uploadImage(img, state?.img);
      } catch (error) {
        return; // Stop submission if image upload fails
      }
    }
  
    const postData = {
      id: currentUser.id,
      title,
      desc,
      cat,
      img: imageUrl, // Use updated Cloudinary URL
      date: moment().utc().format('YYYY-MM-DD HH:mm:ss'),
    };
  
    try {
      if (state) {
        await axios.put(`/api/posts/${state.id}`, postData, { withCredentials: true });
        toast.success('Post updated!');
      } else {
        await axios.post('/api/posts', postData, { withCredentials: true });
        toast.success('Post created!');
      }
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred while submitting the post.');
      console.error('Error submitting post:', error);
    }
  };
  

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 md:p-12 bg-gray-100 min-h-150 mt-[15vh]">
      {/* Left Section - Post Content */}
      <div className="w-full md:w-2/3 bg-white p-6 rounded-lg shadow-lg h-105">
        <input
          type="text"
          value={title}
          placeholder="Enter post title..."
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
        />

        {/* Editor */}
        <div className="mt-4">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={desc}
            onChange={setDesc}
            className="h-60"
          />
        </div>
      </div>

      {/* Right Section - Settings */}
      <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-lg">
        {/* Publish Settings */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700">Publish</h2>
          <div className="text-gray-400 text-sm mt-2">
            <p><b>Status:</b> Draft</p>
            <p><b>Visibility:</b> Public</p>
          </div>

          {/* Upload Image */}
          <input
            type="file"
            id="file"
            onChange={(e) => setImg(e.target.files[0])}
            className="hidden"
          />
          <label htmlFor="file" className="block mt-3 bg-blue-400 text-white text-center py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition">
            Upload Image
          </label>

        </div>

        {/* Category Selection */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700">Category</h2>
          <div className="flex flex-col gap-2 mt-2">
            {["technology", "health", "lifestyle", "business", "entertainment"].map((category) => (
              <label key={category} className="flex items-center space-x-2 text-gray-700">
                <input
                  type="radio"
                  checked={cat === category}
                  name="category"
                  value={category}
                  onChange={(e) => setCat(e.target.value)}
                  className="text-blue-400"
                />
                <span className="capitalize">{category}</span>
              </label>
            ))}
          </div>

          {/* Move Publish Button Here */}
          <button
            onClick={handleSubmit}
            className="cursor-pointer mt-4 w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default Write;
