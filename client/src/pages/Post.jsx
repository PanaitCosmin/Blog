import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import moment from 'moment'
import Menu from '../components/Menu'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import DOMPurify from "dompurify";
import parse from "html-react-parser";
import { Edit, Trash2 } from 'lucide-react';


const Post = () => {

  const [post, setPost] = useState({})
  const [isLoading, setIsLoading] = useState(true);
  const {currentUser} = useAuth()

  const cleanHTML = DOMPurify.sanitize(post.desc);
  const navigate = useNavigate()
  const location = useLocation()
  const postId = location.pathname.split('/')[2]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const res = await axios.get(`/api/posts/${postId}`, {
          withCredentials: true
        })

        setPost(res.data)
      } catch (error) {
        console.log(error.response.data)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [postId])

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/posts/${postId}`, {
        withCredentials: true
      })

      toast.success('Post deleted!')
      navigate('/')

    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="single flex flex-col md:flex-row gap-8 p-4 md:p-8 mt-24">
      {/* Main Post */}
      <div className="content w-full md:w-4/5">
        {/* Post Image */}
        <div className="w-full h-50 md:h-100 bg-gray-500 overflow-hidden rounded-lg">
        {isLoading ? (
            <div className="w-full h-full bg-gray-300 animate-pulse"></div>
          ) : (
            <img src={post.img} alt="Post" className="w-full h-full object-cover" />
          )}       
        </div>

        <div className="user flex items-center justify-between mb-4 mt-4">
          {/* User Info (Left Side) */}
          <div className="info flex flex-col">
            {isLoading ? (
              <>
                <div className="w-32 h-5 bg-gray-300 rounded-md animate-pulse mb-2"></div>
                <div className="w-24 h-4 bg-gray-300 rounded-md animate-pulse"></div>
              </>
            ) : (
              <>
                <p className="font-semibold text-lg">By <span className='text-blue-600'>{post.username}</span></p>
                <p className="text-gray-500 text-sm">Posted {moment(post.date).fromNow()}</p>              
              </>
            )}
          </div>

          {/* Edit & Delete Icons (Right Side, Only If Condition is Met) */}
          {!isLoading && currentUser?.username === post.username && (
            <div className="edit flex gap-2">
              <Link to={`/write?edit=${post.id}`} state={post}>
                <Edit size={24} className="text-blue-500 cursor-pointer" />
              </Link>
              <Trash2 size={24} className="text-red-500 cursor-pointer" onClick={handleDelete} />
            </div>
          )}
        </div>

        
        {/* Post Title */}
        {isLoading ? (
          <div className="w-3/4 h-8 bg-gray-300 rounded-md animate-pulse mb-4"></div>
        ) : (
          <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
        )}       

        {/* Post Content */}
        {isLoading ? (
          <div className="space-y-3">
            <div className="w-full h-4 bg-gray-300 rounded-md animate-pulse"></div>
            <div className="w-5/6 h-4 bg-gray-300 rounded-md animate-pulse"></div>
            <div className="w-2/3 h-4 bg-gray-300 rounded-md animate-pulse"></div>
          </div>
        ) : (
          <div className="text-gray-700 text-lg leading-relaxed">{parse(cleanHTML)}</div>
        )}     
      </div>

      {/* Grey Line on Mobile */}
      <div className="border-t border-gray-300 my-4 md:hidden"></div>

      {/* Other Posts */}
      <div className="w-full md:w-1/5">
        <Menu cat={post.cat} parrentId={post.id} />
      </div>
    </div>
  );
}

export default Post