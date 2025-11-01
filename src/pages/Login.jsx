import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService.js";
import toast, { Toaster } from "react-hot-toast";
import Footer from "../components/Footer.jsx";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await authService.login(username, password);
      if (result.success) {
        toast.success("Login successful!");
        setTimeout(() => navigate("/chatarea"), 1500);
      } else {
        toast.error(result.message || "Login failed, please try again.");
      }
    } catch (error) {
      toast.error(error.message || "Login failed, please try again.");
      console.error("Login failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <div className="flex flex-col min-h-screen bg-white">
        {/* Main Content */}
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            {/* Logo and Header */}
            <div className="text-center mb-6">
              <img
                src="/Images/chat-talk.jpg"
                alt="ChatTalk Logo"
                className="w-20 h-20 mx-auto rounded-full mb-4 shadow-md"
              />
              <h1 className="text-3xl font-extrabold text-gray-800 tracking-wide">Login</h1>
              <p className="text-sm text-gray-500 mt-2">
                Welcome back! Please enter your credentials.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                disabled={!username.trim() || !password.trim() || isLoading}
                className={`w-full py-3 rounded-lg font-semibold text-white transition 
                  ${isLoading || !username.trim() || !password.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-lg hover:shadow-xl"
                  }`}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default Login;
