import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService.js";
import { useState, useRef, useEffect } from "react";
import { Menu, X, User, LogOut, Settings } from "lucide-react";
import '../styles/Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const isAuthenticated = authService.isAuthenticated();
    const currentUser = authService.getCurrentUser();
    const [isOpen, setIsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef();

    const handleLogout = async () => {
        try {
            await authService.logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
            localStorage.clear();
            navigate('/login');
        }
    };

    const [currentUserState, setCurrentUserState] = useState(authService.getCurrentUser());

    useEffect(() => {
        const handleUserUpdate = () => {
            setCurrentUserState(authService.getCurrentUser());
        };

        window.addEventListener("userUpdated", handleUserUpdate);

        return () => window.removeEventListener("userUpdated", handleUserUpdate);
    }, []);


    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Brand */}
                    <Link to="/" className="flex items-center gap-2 hover:scale-105 transition transform">
                        <img
                            src="/Images/chat-talk.jpg"
                            alt="Logo"
                            className="w-10 h-10 rounded-full object-cover shadow-md"
                        />
                        <span className="text-gray-800 font-extrabold text-xl tracking-wide">
                            ChatTalk
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/chatarea"
                                    className="text-gray-700 text-sm font-medium hover:text-indigo-600 transition"
                                >
                                    Chat Area
                                </Link>

                                {/* Profile Dropdown */}
                                <div className="relative" ref={profileRef}>
                                    <button
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition"
                                    >
                                        {currentUserState?.imageUrl ? (
                                            <img
                                                src={currentUserState.imageUrl}
                                                alt="Profile"
                                                className="w-8 h-8 rounded-full object-cover shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold shadow-sm">
                                                {currentUserState?.username?.charAt(0).toUpperCase() || "?"}
                                            </div>
                                        )}


                                        <span className="text-gray-700 font-semibold">{currentUser?.username}</span>
                                    </button>

                                    {profileOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden animate-fade-in">

                                            <Link
                                                to="/settings"
                                                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-indigo-50 transition"
                                                onClick={() => setProfileOpen(false)}
                                            >
                                                <Settings size={16} /> Settings
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 transition"
                                            >
                                                <LogOut size={16} /> Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-700 text-sm font-medium hover:text-indigo-600 transition"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold px-4 py-2 rounded-full shadow hover:scale-105 transition transform"
                                >
                                    Signup
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700 focus:outline-none"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white text-gray-700 px-4 pb-4 space-y-3 shadow-md animate-fade-in">
                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/chatarea"
                                onClick={() => setIsOpen(false)}
                                className="block hover:text-indigo-600 transition"
                            >
                                Chat Area
                            </Link>
                            <Link
                                to="/settings"
                                onClick={() => setIsOpen(false)}
                                className="block hover:text-indigo-600 transition"
                            >
                                Settings
                            </Link>
                            <button
                                onClick={() => { handleLogout(); setIsOpen(false); }}
                                className="w-full bg-red-500 text-white font-semibold px-4 py-2 rounded-full shadow hover:bg-red-600 transition"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                onClick={() => setIsOpen(false)}
                                className="block hover:text-indigo-600 transition"
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                onClick={() => setIsOpen(false)}
                                className="block bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold px-4 py-2 rounded-full text-center shadow hover:scale-105 transition transform"
                            >
                                Signup
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
