import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import axios from 'axios'

const Home = () => {

  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true);

  const cat = useLocation().search

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const res = await axios.get(`/api/posts${cat}`)
        setPosts(res.data)
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [cat])

  const getText = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const text = doc.body.textContent || ""; // Extract text content
    const words = text.split(" "); // Split into words
    return words.length > 25 ? words.slice(0, 25).join(" ") + "..." : text;
};


  return (
    <div className="home mt-[15vh] lg:mt-[20vh] min-h-[70vh]">
        {posts.length === 0 && !isLoading && (
        <div className='min-h-[70vh] flex items-center justify-center text-5xl'>
          <h1>No posts for this category</h1>
        </div>)}
        <div className="posts space-y-10">
            {isLoading
          ? // Skeleton Loading Placeholder
            Array(3).fill().map((_, index) => (
              <div key={index} className="post flex flex-col-reverse md:flex-row items-center md:items-start gap-6 md:gap-10 overflow-hidden p-6 animate-pulse">
                <div className="content flex-1 max-w-lg self-center text-center md:text-left">
                  <div className="h-6 bg-gray-300 rounded-md w-2/3 mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded-md w-full mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded-md w-5/6 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded-md w-4/6 mb-4"></div>
                  <div className="h-10 bg-gray-300 rounded-md w-32"></div>
                </div>
                <div className="img w-full md:w-1/2 bg-gray-300 rounded-lg h-60"></div>
              </div>
            ))
            : // Render Posts
            posts.map((post) => ( 
                <div key={post.id} className="post flex flex-col-reverse md:flex-row items-center md:items-start gap-6 md:gap-10 overflow-hidden p-6">
                    
                    {/* Text Content */}
                    <div className="content flex-1 max-w-lg self-center text-center md:text-left">
                        <Link to={`/posts/${post.id}`}>
                            <h1 className="text-2xl font-bold text-blue-600 md:text-gray-900 hover:text-blue-600">{post.title}</h1>
                        </Link>
                        <p className="text-gray-700 mt-3">
                          {getText(post.desc)}
                        </p>

                        <Link to={`/posts/${post.id}`}>
                        <button className="cursor-pointer mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg transition transform hover:scale-105">
                          Read More
                        </button>

                        </Link>
                    </div>

                    {/* Image */}
                    <div className="img w-full md:w-1/2 bg-gray-500 rounded-lg">
                        <img src={post.img} alt="Post" className="w-full h-60 object-cover rounded-md" />
                    </div>

                </div>
            ))}
        </div>
    </div>
);
}

export default Home