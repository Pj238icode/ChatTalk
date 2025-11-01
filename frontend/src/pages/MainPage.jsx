import React from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/authService";
import Footer from "../components/Footer"; // import Footer component

const MainPage = () => {
  const isAuthenticated = authService.isAuthenticated();

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800 font-sans">
      {/* Content Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4 animate-bounce">💬</div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-wide">
            Welcome to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-pink-500">
              ChatTalk
            </span>
          </h1>
          <p className="text-lg text-gray-600">
            Connect with people around the world in real time 🌐
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mb-10">
          {[
            { icon: "🌐", title: "Real-time Messaging", desc: "Chat instantly with users online — no delays." },
            { icon: "👥", title: "Multiple Users", desc: "See who's online and join conversations easily." },
            { icon: "🔒", title: "Private Chats", desc: "Securely message anyone in private mode." },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 p-6 rounded-2xl shadow-lg text-center border border-gray-200 hover:scale-105 transition-transform"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="flex flex-col md:flex-row gap-4">
          {isAuthenticated ? (
            <Link
              to="/chatarea"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-yellow-400 to-pink-400 text-gray-900 font-semibold text-lg shadow-lg hover:scale-105 transition transform"
            >
              Go to Chat Area 🚀
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-indigo-600 font-semibold text-lg shadow-lg hover:scale-105 transition transform"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg shadow-lg hover:scale-105 transition transform"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainPage;
