import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService.js";
import toast, { Toaster } from "react-hot-toast";
import Footer from "../components/Footer"; // import Footer

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const result = await authService.signup(username, email, password);
      if (result.success) {
         toast.success("Account created successfully! Redirecting to login...");
         setTimeout(() => navigate("/login"), 1500);
      }
    } catch (error) {
      toast.error(error.message || "Signup failed, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-200">

          {/* Logo and Header */}
          <div className="text-center mb-6">
            <img
              src="/Images/chat-talk.jpg"
              alt="EchoChat Logo"
              className="w-20 h-20 mx-auto rounded-full mb-4 shadow-md"
            />
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-wide">Sign Up</h1>
            <p className="text-sm text-gray-500 mt-2">
              Create an account to start chatting
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={50}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={20}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
            />

            <button
              type="submit"
              disabled={!username.trim() || !email.trim() || !password.trim() || isLoading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition 
                ${isLoading || !username.trim() || !email.trim() || !password.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-lg hover:shadow-xl"
                }`}
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>

            {message && (
              <p
                className={`text-center text-sm mt-3 font-medium ${
                  message.includes("successfully") ? "text-green-500" : "text-red-500"
                }`}
              >
                {message}
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Signup;
