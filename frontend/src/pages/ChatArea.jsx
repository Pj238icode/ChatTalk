import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { authService } from '../services/authService';
import PrivateChat from './PrivateChat';
import Sidebar from '../components/Sidebar';
import { Menu } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { WS_BASE_URL } from '../constants/Constants';

const ChatArea = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();





  const { username, color: userColor } = currentUser || {};

  const [allUsers, setAllUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(new Map());


  // console.log(activeChatUser.imageUrl)
  const stompClient = useRef(null);
  const privateMessageHandlers = useRef(new Map());


  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) navigate('/login');
  }, [currentUser, navigate]);

  // Register / unregister private message handlers
  const registerPrivateMessageHandler = useCallback((otherUser, handler) => {
    privateMessageHandlers.current.set(otherUser, handler);
  }, []);

  const unregisterPrivateMessageHandler = useCallback((otherUser) => {
    privateMessageHandlers.current.delete(otherUser);
  }, []);

  // Fetch all users once
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await authService.fetchAllUsers();

        setAllUsers(data.users || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  // Setup WebSocket + STOMP
  useEffect(() => {
    if (!username || stompClient.current) return; // ✅ prevent reconnect on re-render

    const socket = new SockJS(WS_BASE_URL);

    const client = Stomp.over(socket);
    stompClient.current = client;

    client.connect(
      { username },
      () => {
        console.log('Connected via STOMP');

        client.subscribe(`/user/${username}/queue/private`, (msg) => {
          try {
            const privateMessage = JSON.parse(msg.body);
            const otherUser =
              privateMessage.sender === username
                ? privateMessage.recipient
                : privateMessage.sender;

            const handler = privateMessageHandlers.current.get(otherUser);
            if (handler) {
              handler(privateMessage);
            } else if (privateMessage.recipient === username) {
              setUnreadMessages((prev) => {
                const updated = new Map(prev);
                const count = updated.get(otherUser) || 0;
                updated.set(otherUser, count + 1);
                return updated;
              });
            }
          } catch (err) {
            console.error('Invalid private message format', err);
          }
        });

        client.subscribe('/topic/onlineUsers', (msg) => {
          try {
            const onlineList = JSON.parse(msg.body);
            setOnlineUsers(new Set(onlineList));
          } catch (err) {
            console.error('Invalid online users message', err);
          }
        });

        client.send(
          '/app/chat.addUser',
          {},
          JSON.stringify({ sender: username, type: 'JOIN', color: userColor })
        );
      },
      (error) => console.error('WebSocket error:', error)
    );

    return () => {
      if (client?.connected) client.disconnect();
      stompClient.current = null;
    };
  }, [username, userColor]);


  // Open private chat
  const handleOpenPrivateChat = (user) => {
    setActiveChatUser(user);


    setUnreadMessages((prev) => {
      const updated = new Map(prev);
      updated.delete(user.username);
      return updated;
    });


    setSidebarOpen(false);
  };

  // Logout
  const handleDisconnect = async () => {
    if (stompClient.current?.connected) stompClient.current.disconnect();
    await authService.logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        username={username}
        userColor={userColor}
        allUsers={allUsers}
        onlineUsers={onlineUsers}
        unreadMessages={unreadMessages}
        setUnreadMessages={setUnreadMessages}
        openPrivateChat={handleOpenPrivateChat}
        handleDisconnect={handleDisconnect}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Mobile toggle */}
        <button
          className="absolute top-3 left-0 md:hidden bg-gray-200 p-2 rounded-md shadow z-40"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title="Toggle Sidebar"
        >
          <ChevronRight size={15} />
        </button>

        {activeChatUser ? (
          <div className="flex-1 p-2 md:p-4">
            <PrivateChat
              key={activeChatUser.username}
              currentUser={username}
              recipientUser={activeChatUser.username}
              userColor={userColor}
              stompClient={stompClient}
              onClose={() => setActiveChatUser(null)}
              registerPrivateMessageHandler={registerPrivateMessageHandler}
              unregisterPrivateMessageHandler={unregisterPrivateMessageHandler}
              onlineUsers={onlineUsers}
              currentUserImageUrl={currentUser.imageUrl}
              recipientImageUrl={activeChatUser.imageUrl}
            />


          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 px-4 text-center">
            <p className="text-lg md:text-xl">
              Select a user from the sidebar to start chatting 💬
            </p>
          </div>
        )}
      </div>
    </div>

  );
};

export default ChatArea;
