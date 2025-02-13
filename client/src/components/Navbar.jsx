import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import logo from "../assets/logo-blog.png";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
        if (window.scrollY > lastScrollY) {
            setShowNavbar(false); // Hide on scroll down
        } else {
            setShowNavbar(true); // Show on scroll up
        }
        setLastScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
}, [lastScrollY]);


// Disable scrolling when mobile menu is open
useEffect(() => {
  if (isOpen) {
      document.body.classList.add('overflow-hidden');
  } else {
      document.body.classList.remove('overflow-hidden');
  }

  // Cleanup function to restore scrolling when component unmounts
  return () => document.body.classList.remove('overflow-hidden');
}, [isOpen]);

  return (
    <nav className={`fixed z-2 top-0 left-0 w-full bg-white shadow-md transition-transform duration-300 ease-in-out ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-14">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="w-34 sm:w-40">
            <Link to="/">
              <img src={logo} alt="Logo" className="w-full" />
            </Link>
          </div>

          {/* Desktop Links */}
          <ul className="hidden lg:flex items-center space-x-6 text-black">
            <Link className="hover:text-blue-600" to="/?cat=technology">
              <h4>Technology</h4>
            </Link>
            <Link className="hover:text-blue-600" to="/?cat=health">
              <h4>Health</h4>
            </Link>
            <Link className="hover:text-blue-600" to="/?cat=lifestyle">
              <h4>Lifestyle</h4>
            </Link>
            <Link className="hover:text-blue-600" to="/?cat=business">
              <h4>Business</h4>
            </Link>
            <Link className="hover:text-blue-600" to="/?cat=entertainment">
              <h4>Entertainment</h4>
            </Link>
            {currentUser && (
              <Link className=" hover:text-blue-600" to="/profile">
                {currentUser?.username}
              </Link>
            )}
            {currentUser ? (
              <span className="text-red-600 cursor-pointer px-4 py-2 border-2 rounded-lg border-red-600 hover:bg-red-600 hover:text-white" onClick={logout}>Logout</span>
            ) : (
              <Link className="text-blue-600" to="/login">
                Login
              </Link>
            )}
            {currentUser &&  <Link className="bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-600" to="/write">Write</Link>}
          </ul>

            {/* Mobile & Tablet: Login + Hamburger */}
            <div className="lg:hidden flex items-center">
              <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
        </div>
      </div>


       {/* Mobile Menu: Sliding from Right to Left */}
       <div className={`lg:hidden fixed top-0 right-0 h-screen w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="flex justify-end p-4">
                    <button onClick={() => setIsOpen(false)} className="text-gray-700">
                        <X size={28} />
                    </button>
                </div>
                <ul className="flex flex-col items-start px-6 space-y-4">
                    <Link className="text-gray-700 border-b border-gray-700 w-full py-2" to="/?cat=technology" onClick={() => setIsOpen(false)}>Technology</Link>
                    <Link className="text-gray-700 border-b border-gray-700 w-full py-2" to="/?cat=health" onClick={() => setIsOpen(false)}>Health</Link>
                    <Link className="text-gray-700 border-b border-gray-700 w-full py-2" to="/?cat=lifestyle" onClick={() => setIsOpen(false)}>Lifestyle</Link>
                    <Link className="text-gray-700 border-b border-gray-700 w-full py-2" to="/?cat=business" onClick={() => setIsOpen(false)}>Business</Link>
                    <Link className="text-gray-700 border-b border-gray-700 w-full py-2" to="/?cat=entertainment" onClick={() => setIsOpen(false)}>Entertainment</Link>
                    {currentUser && <Link className="text-gray-700 " to="/profile" onClick={() => setIsOpen(false)}>{currentUser?.username}</Link>}
                    {currentUser ? (
                        <span className="text-red-600 cursor-pointer" onClick={() => { logout(); setIsOpen(false); }}>Logout</span>
                    ) : (
                        <Link className="text-blue-600" to="/login" onClick={() => setIsOpen(false)}>Login</Link>
                    )}
                    {currentUser && <Link className=" text-blue-600" to="/write" onClick={() => setIsOpen(false)}>Write</Link>}
                </ul>
            </div>
    </nav>
  );
};

export default Navbar;
