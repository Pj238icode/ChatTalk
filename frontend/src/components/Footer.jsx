import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-100 shadow-inner mt-auto w-full py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        {/* Left: Branding */}
        <div className="text-gray-700 font-bold text-lg md:text-xl mb-3 md:mb-0">
          ChatTalk
        </div>

        {/* Center: Links */}
        <div className="flex gap-6 text-gray-600 text-sm md:text-base mb-3 md:mb-0">
          <Link to="/" className="hover:text-indigo-600 transition">
            Home
          </Link>
          <Link to="/about" className="hover:text-indigo-600 transition">
            About
          </Link>
          <Link to="/contact" className="hover:text-indigo-600 transition">
            Contact
          </Link>
        </div>

        {/* Right: Copyright */}
        <div className="text-gray-400 text-xs md:text-sm">
          &copy; 2025 ChatTalk. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
