import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const Menu = ({cat, parrentId}) => {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    if (!cat || parrentId === undefined) return; // Prevent fetching if data is not ready
  
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/posts/menu/?cat=${cat}&parrentId=${parrentId}`);
        setPosts(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.log(error);
      }
    };
  
    fetchData();
  }, [cat, parrentId]);

  return (
    <div className='menu flex-row md:flex-col items-center justify-center'>
      <h1 className="text-xl font-bold mb-4">Other posts you may like</h1>
      {posts.length ? posts.map(post => (
        <div className="post w-full flex flex-col items-center md:items-start mb-8 gap-2" key={post.id}>
          <div className="w-full h-32 flex justify-center items-center overflow-hidden rounded-lg mb-2">
              <img src={post.img} alt="post image" className="w-full h-full object-cover" />
            </div>
          <h2>{post.title}</h2>
          <Link className='link' to={`/posts/${post.id}`}>
            <button className='cursor-pointer px-4 py-2 border-2 border-blue-600 rounded-md font-light hover:bg-blue-600 hover:text-white transition transform hover:scale-105'>Read More</button>
          </Link>
        </div>
      ))
      : <p>No more posts</p>
    }
    </div>
  )
}

export default Menu