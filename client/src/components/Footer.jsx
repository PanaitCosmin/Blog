import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo-blog.png";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-100 py-6 flex flex-col sm:flex-row items-center justify-between px-6 border-t border-gray-300 mt-12">
      {/* Logo */}
      <div className="w-34 sm:w-40">
        <Link to="/">
          <img src={logo} alt="Logo" className="w-full" />
        </Link>
      </div>

      {/* Creator Link */}
      <p>
        Created by:{" "}
        <a 
          href="https://github.com/PanaitCosmin" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline font-semibold"
        >
          Cosmin D. Panait
        </a>
      </p>

      {/* Text */}
      <span className="text-gray-600 text-sm mt-4 sm:mt-0">
        Made with ❤️ and <b className="text-blue-500">React</b>
      </span>
    </footer>
  );
};

export default Footer;
