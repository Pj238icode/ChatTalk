import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({
  username,
  allUsers = [],
  onlineUsers,
  unreadMessages,
  setUnreadMessages,
  openPrivateChat,
  handleDisconnect,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const navigate = useNavigate();

  

  const handleUserClick = (user) => {
    openPrivateChat(user);
    setSidebarOpen(false);

    setUnreadMessages((prev) => {
      const updated = new Map(prev);
      updated.delete(user);
      return updated;
    });
  };

  const goToProfile = () => {
    navigate('/settings');
    setSidebarOpen(false);
  };

  return (
    <div
      className={`fixed md:static top-16 lg:top-20 left-0 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 z-30 font-sans
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
    >
      {/* Header */}
      <div className="p-5 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <h3 className="text-xl font-bold text-gray-900">Users</h3>
          {/* Profile button */}
          <button
            onClick={goToProfile}
            className="ml-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded transition"
            title="Profile"
          >
            Profile 
          </button>
        </div>
        <div className="flex items-center space-x-2">
         
        
          {/* Logout */}
          <button
            onClick={handleDisconnect}
            className="text-gray-500 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut size={22} />
          </button>
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {allUsers.length === 0 ? (
          <p className="text-gray-500 text-sm p-2">No users found.</p>
        ) : (
          allUsers
            .filter((u) => u.username !== username)
             
            .map((u) => (
             
              <div
                key={u.username}
                onClick={() => handleUserClick(u)}
                className="flex items-center justify-between p-2 rounded-xl cursor-pointer hover:bg-gray-100 transition"
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-300 text-sm font-semibold text-white overflow-hidden"
                    style={{
                      backgroundColor: onlineUsers.has(u.username)
                        ? "#16A34A"
                        : "#9CA3AF",
                    }}
                  >
                    {u.imageUrl ? (
                      <img
                        src={u.imageUrl }
                        alt={u.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      u.username.charAt(0).toUpperCase()
                    )}
                  </div>

                  {/* Username + status */}
                  <div className="flex flex-col">
                    <span className="truncate font-medium text-sm text-gray-900">
                      {u.username}
                    </span>
                    <span
                      className={`text-xs ${onlineUsers.has(u.username) ? "text-green-500" : "text-gray-400"
                        }`}
                    >
                      {onlineUsers.has(u.username) ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>

                {/* Unread messages */}
                {unreadMessages.has(u.username) && (
                  <span className="bg-red-500 text-xs font-semibold text-white rounded-full px-2 py-0.5 shadow">
                    {unreadMessages.get(u.username)}
                  </span>
                )}
              </div>
            ))
        )}
      </div>

    </div>
  );
};

export default Sidebar;
