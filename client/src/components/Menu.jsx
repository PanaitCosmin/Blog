import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const Menu = ({cat, parrentId}) => {
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!cat || parrentId === undefined) return; // Prevent fetching if data is not ready
  
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const res = await axios.get(`/api/posts/menu/?cat=${cat}&parrentId=${parrentId}`);
        setPosts(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false)
      }
    };
  
    fetchData();
  }, [cat, parrentId]);

  return (
    <div className='menu flex-row md:flex-col items-center justify-center'>
      <h1 className="text-xl font-bold mb-4">Other posts you may like</h1>
      {isLoading
        ? // Skeleton Loading Placeholder
          Array(5)
            .fill()
            .map((_, index) => (
              <div key={index} className="post w-full flex flex-col items-center md:items-start mb-8 gap-2 animate-pulse">
                <div className="w-full h-32 bg-gray-300 rounded-lg"></div>
                <div className="w-3/4 h-5 bg-gray-300 rounded-md mt-2"></div>
                <div className="w-24 h-8 bg-gray-300 rounded-md mt-2"></div>
              </div>
            ))
        : // Render Posts When Loaded
          posts.length ? (
            posts.map((post) => (
              <div className="post w-full flex flex-col items-center md:items-start mb-8 gap-2" key={post.id}>
                <div className="w-full h-32 flex justify-center items-center overflow-hidden rounded-lg mb-2">
                  <img src={post.img} alt="Post Image" className="w-full h-full object-cover" />
                </div>
                <h2 className="text-lg font-semibold text-center md:text-left">{post.title}</h2>
                <Link className="link" to={`/posts/${post.id}`}>
                  <button className="cursor-pointer px-2 py-1 border-2 border-blue-600 rounded-md font-light hover:bg-blue-600 hover:text-white transition transform hover:scale-105">
                    Read More
                  </button>
                </Link>
              </div>
            ))
          ) : (
            <p>No more posts</p>
          )}
    </div>
  )
}

export default Menu