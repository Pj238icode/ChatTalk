import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService.js";
import toast, { Toaster } from "react-hot-toast";
import Sidebar from "../components/Sidebar.jsx";
import PrivateChat from "./PrivateChat.jsx";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { ChevronRight } from "lucide-react";
import { WS_BASE_URL } from "../constants/Constants.js";

const Settings = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const { username, color: userColor } = currentUser || {};

  const [allUsers, setAllUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadMessages, setUnreadMessages] = useState(new Map());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);

  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(
    currentUser?.imageUrl || null
  );
  const [usernameInput, setUsernameInput] = useState(username || "");
  const [email] = useState(currentUser?.email || "");
  const [isLoading, setIsLoading] = useState(false);

  const stompClient = useRef(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) navigate("/login");
  }, [currentUser, navigate]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await authService.fetchAllUsers();
        setAllUsers(data.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // WebSocket setup
  useEffect(() => {
    if (!username) return;

    const socket = new SockJS(WS_BASE_URL);
    const client = Stomp.over(socket);
    stompClient.current = client;

    client.connect({ username }, () => {
      console.log("Connected via STOMP");

      client.subscribe(`/user/${username}/queue/private`, (msg) => {
        const privateMessage = JSON.parse(msg.body);
        const otherUser =
          privateMessage.sender === username
            ? privateMessage.recipient
            : privateMessage.sender;

        setUnreadMessages((prev) => {
          const updated = new Map(prev);
          const count = updated.get(otherUser) || 0;
          updated.set(otherUser, count + 1);
          return updated;
        });
      });

      client.subscribe("/topic/onlineUsers", (msg) => {
        const onlineList = JSON.parse(msg.body);
        setOnlineUsers(new Set(onlineList));
      });

      client.send(
        "/app/chat.addUser",
        {},
        JSON.stringify({ sender: username, type: "JOIN", color: userColor })
      );
    });

    return () => client?.disconnect();
  }, [username, userColor]);

  // Logout and disconnect
  const handleDisconnect = async () => {
    if (stompClient.current?.connected) stompClient.current.disconnect();
    await authService.logout();
    navigate("/login");
  };

  // Image handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedExtensions = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
      if (!allowedExtensions.includes(file.type)) {
        toast.error("Invalid image format. Only PNG, JPG, JPEG, GIF are allowed.");
        return;
      }
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Save profile changes
  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await authService.updateProfile(usernameInput, profileImage);
      if (result.success) {
        toast.success("Profile updated successfully!");
        localStorage.setItem("currentUser", JSON.stringify(result.user));
        setPreviewImage(result.user.imageUrl || previewImage);
        window.dispatchEvent(new Event("userUpdated"));
      } else {
        toast.error(result.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Profile update failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Open private chat
  const handleOpenPrivateChat = (user) => {
    setActiveChatUser(user);
    setUnreadMessages((prev) => {
      const updated = new Map(prev);
      updated.delete(user);
      return updated;
    });
    setSidebarOpen(false);
  };

  const openPrivateChat = (user) => {
    handleOpenPrivateChat(user);
    navigate("/chatarea");
  };

  // Change password handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    const oldPassword = e.target.oldPassword.value.trim();
    const newPassword = e.target.newPassword.value.trim();
    const confirmPassword = e.target.confirmPassword.value.trim();


    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    try {
      const res = await authService.changePassword(oldPassword, newPassword);
      if (res.success) {
        toast.success(res.message || "Password changed successfully!");
        e.target.reset();
      } else {
        toast.error(res.message || "Failed to change password.");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong. Try again.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 relative overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        username={username}
        allUsers={allUsers}
        onlineUsers={onlineUsers}
        unreadMessages={unreadMessages}
        setUnreadMessages={setUnreadMessages}
        openPrivateChat={openPrivateChat}
        handleDisconnect={handleDisconnect}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-y-auto p-4">
        <button
          className="absolute top-1 left-0 md:hidden bg-gray-200 p-2 rounded-md shadow z-40"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title="Toggle Sidebar"
        >
          <ChevronRight size={15} />
        </button>

        <Toaster position="top-center" reverseOrder={false} />

        {!activeChatUser ? (
          <div className="w-full max-w-5xl bg-transparent mx-auto my-6 overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Account Settings
            </h2>

            {/* Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                  My Profile
                </h3>

                <div className="flex flex-col items-center mb-6">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-500 flex items-center justify-center bg-indigo-100 text-indigo-700 text-4xl font-bold">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      // Fallback: first character of username in uppercase
                      usernameInput?.charAt(0)?.toUpperCase() || "U"
                    )}
                  </div>

                  <label className="mt-3 px-4 py-2 bg-indigo-500 text-white rounded-lg cursor-pointer hover:bg-indigo-600 transition">
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">Username</label>
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      maxLength={20}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Email (read-only)
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 rounded-lg text-white font-semibold transition ${isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-500 hover:bg-indigo-600"
                      }`}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </div>

              {/* Change Password Card */}
              <div className="bg-white rounded-2xl shadow-lg p-9">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                  Change Password
                </h3>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Old Password
                    </label>
                    <input
                      type="password"
                      name="oldPassword"
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      required
                      minLength={6}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      minLength={6}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold transition"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <PrivateChat
            key={activeChatUser}
            currentUser={username}
            recipientUser={activeChatUser}
            userColor={userColor}
            stompClient={stompClient}
            onClose={() => setActiveChatUser(null)}
            registerPrivateMessageHandler={() => { }}
            unregisterPrivateMessageHandler={() => { }}
            onlineUsers={onlineUsers}
          />
        )}
      </div>
    </div>
  );
};

export default Settings;
