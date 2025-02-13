import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import axios from 'axios';
import moment from 'moment';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-hot-toast'



const Write = () => {
  const navigate = useNavigate();
  const state = useLocation().state;

  const quillRef = useRef(null)

  // Initialize states with existing post data or default values
  const [title, setTitle] = useState(state?.title || '');
  const [desc, setDesc] = useState(state?.desc || '');
  const [cat, setCat] = useState(state?.cat || 'art');
  const [img, setImg] = useState(null); // Image is null initially, to be updated if needed

  // Upload Image function
  const uploadImage = async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);
  
    try {
      // Upload image to server
      const response = await axios.post('/api/upload', formData);
  
      // Return the filename from the response
      if (response.data.filename) {
        return response.data.filename; // Extract the filename from response data
      } else {
        throw new Error('Image upload failed: No filename returned');
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error; // Ensure the error is propagated
    }
  };
  
  // Delete image
  const deleteOldImage = async (oldImagePath) => {
    console.log("Hit deleteOldImage")
    try {
      await axios.delete('/api/posts/delete-img', {
        data: {
          imagePath: oldImagePath
        }
      })
    } catch (error) {
      console.error('Error deleting old image:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    let imageUrl = state?.img; // Default image URL (existing image) if no new image is uploaded
  
    // Only upload a new image if the user selected one
    if (img) {
      try {        
        // delete old image
        if (state?.img) await deleteOldImage(state.img)

        const uploadedImgUrl = await uploadImage(img);
        imageUrl = uploadedImgUrl; // Update image URL if new image uploaded
      } catch (error) {
        return; // Stop the process if the image upload fails
      }
    }
  
    // Check if imageUrl is already a full path (i.e., starts with '../public/upload/'), if not, prepend the path
    if (imageUrl && !imageUrl.startsWith('../upload/')) {
      //imageUrl = `../public/upload/${imageUrl}`; // Prepend the path if it's just the filename
      imageUrl = `../upload/${imageUrl}`; // Prepend the path if it's just the filename
    }
  
    // Data for the post (including the image URL)
    const postData = {
      title,
      desc,
      cat,
      img: imageUrl, // Use the updated image URL (either new or existing)
      date: moment().format('YYYY-MM-DD HH:mm:ss'), // Current timestamp for the post
    };
  
    try {
      if (state) {
        // Update the existing post
        await axios.put(`/api/posts/${state.id}`, postData, {
          withCredentials: true,
        });
        toast.success('Post updated!')
      } else {
        // Create a new post
        await axios.post('/api/posts', postData, {
          withCredentials: true,
        });
        toast.success('Post created!')
      }
  
      // Redirect to the homepage (or wherever you need)
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
