import React, { useState, useEffect, useRef } from "react";
import { FiSend, FiPaperclip } from "react-icons/fi";
import { authService } from "../services/authService";

const PrivateChat = ({
  currentUser,
  recipientUser,
  userColor,
  stompClient,
  onClose,
  registerPrivateMessageHandler,
  unregisterPrivateMessageHandler,
  onlineUsers = new Set(),
  currentUserImageUrl,
  recipientImageUrl
}) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const messageIdsRef = useRef(new Set());
  const typingTimeoutRef = useRef(null);

  console.log(messages)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createMessageId = (msg) =>
    `${msg.sender}-${msg.recipient}-${msg.content || msg.fileUrl}`.replace(
      /\s+/g,
      "_"
    );

  const handleIncomingPrivateMessage = (privateMessage) => {
    const messageId = privateMessage.id || createMessageId(privateMessage);
    const isRelevant =
      (privateMessage.sender === currentUser &&
        privateMessage.recipient === recipientUser) ||
      (privateMessage.sender === recipientUser &&
        privateMessage.recipient === currentUser);

    if (isRelevant && !messageIdsRef.current.has(messageId)) {
      messageIdsRef.current.add(messageId);
      setMessages((prev) => [...prev, { ...privateMessage, id: messageId }]);
    }
  };

  const handleTypingMessage = (typingMessage) => {
    if (typingMessage.sender === recipientUser) {
      setIsRecipientTyping(typingMessage.isTyping);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadMessageHistory = async () => {
      try {
        const history = await authService.fetchPrivateMessages(
          currentUser,
          recipientUser
        );
        if (!isMounted) return;

        const processedHistory = history.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
          id: msg.id || createMessageId(msg),
        }));

        messageIdsRef.current.clear();
        processedHistory.forEach((msg) =>
          messageIdsRef.current.add(msg.id)
        );
        setMessages(processedHistory);
      } catch (error) {
        console.error("Error loading message history:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          registerPrivateMessageHandler(recipientUser, handleIncomingPrivateMessage);
          registerPrivateMessageHandler(`${recipientUser}-typing`, handleTypingMessage);
        }
      }
    };

    loadMessageHistory();

    return () => {
      isMounted = false;
      unregisterPrivateMessageHandler(recipientUser);
      unregisterPrivateMessageHandler(`${recipientUser}-typing`);
    };
  }, [
    currentUser,
    recipientUser,
    registerPrivateMessageHandler,
    unregisterPrivateMessageHandler,
  ]);

  useEffect(() => {
    if (!stompClient.current?.connected) return;
    const subscription = stompClient.current.subscribe(
      "/user/queue/typing",
      (msg) => {
        const typingMessage = JSON.parse(msg.body);
        if (typingMessage.sender === recipientUser) {
          setIsRecipientTyping(typingMessage.isTyping);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [recipientUser, stompClient]);

  const sendTypingStatus = (isTyping) => {
    if (!stompClient.current?.connected) return;
    const typingPayload = {
      sender: currentUser,
      recipient: recipientUser,
      isTyping,
      type: "TYPING",
    };
    stompClient.current.send(
      "/app/chat.typing",
      {},
      JSON.stringify(typingPayload)
    );
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    sendTypingStatus(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 1000);
  };

  const sendPrivateMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !stompClient.current?.connected) return;

    const privateMessage = {
      sender: currentUser,
      recipient: recipientUser,
      content: message.trim(),
      type: "PRIVATE_MESSAGE",
      color: userColor,
      timestamp: new Date(),
    };

    try {
      stompClient.current.send(
        "/app/chat.sendPrivateMessage",
        {},
        JSON.stringify(privateMessage)
      );
      setMessage("");
      sendTypingStatus(false);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !stompClient.current?.connected) return;

    try {
      const fileUrl = await authService.uploadFile(
        file,
        currentUser,
        recipientUser,
        userColor
      );
      const privateMessage = {
        sender: currentUser,
        recipient: recipientUser,
        content: file.name,
        fileUrl,
        type: "FILE",
        color: userColor,
        timestamp: new Date(),
      };

      stompClient.current.send(
        "/app/chat.sendPrivateMessage",
        {},
        JSON.stringify(privateMessage)
      );
    } catch (err) {
      console.error("File upload failed:", err);
    } finally {
      e.target.value = null;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    let dateObj;

    // Handle MongoDB LocalDateTime array or string
    if (Array.isArray(timestamp)) {
      const [year, month, day, hour, minute, second] = timestamp;
      dateObj = new Date(year, month - 1, day, hour, minute, second);
    } else {
      dateObj = new Date(timestamp);
    }

    // Format: Thu, Oct 30, 2025, 14:45
    return dateObj.toLocaleString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });
  };


  const isRecipientOnline = onlineUsers.has(recipientUser);

  if (isLoading) {
    return (
      <div className="flex flex-col w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex justify-between items-center bg-indigo-600 text-white px-4 py-3">
          <h3 className="font-semibold">💬 {recipientUser}</h3>
          <button onClick={onClose} className="text-xl hover:text-red-400 transition">
            ✕
          </button>
        </div>
        <div className="flex flex-1 items-center justify-center text-gray-500">
          Loading messages...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-[45rem] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center bg-indigo-600 text-white px-4 py-3">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${isRecipientOnline ? "border-green-400" : "border-gray-400"
              }`}
            style={{
              backgroundColor: isRecipientOnline ? "#A7F3D0" : "#E5E7EB",
              color: "#1E3A8A",
              fontWeight: "bold",
            }}
          >
            {recipientUser.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold text-lg">{recipientUser}</h3>
            <span
              className={`text-xs ${isRecipientOnline ? "text-green-500" : "text-gray-400"
                }`}
            >
              {isRecipientOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-xl hover:text-red-400 transition"
          title="Close chat"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            No messages yet. Start the conversation! 📝
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end ${msg.sender === currentUser ? "justify-end" : "justify-start"
                }`}
            >
              {/* Avatar for receiver */}
              {msg.sender !== currentUser && (
                recipientImageUrl ? (
                  <img
                    src={recipientImageUrl}
                    alt={msg.sender}
                    className="w-8 h-8 rounded-full object-cover mr-2 border border-gray-300"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2 text-sm font-semibold text-gray-700">
                    {msg.sender.charAt(0).toUpperCase()}
                  </div>
                )
              )}


              {/* Message bubble */}
              <div
                className={`max-w-[60%] px-4 py-2 rounded-2xl shadow text-sm ${msg.sender === currentUser
                  ? "bg-indigo-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-900 rounded-bl-none"
                  }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span
                    className="text-xs font-semibold"
                    style={{
                      color:
                        msg.sender === currentUser ? "#fff" : msg.color || "#4F46E5",
                    }}
                  >
                    {msg.sender === currentUser ? "You" : msg.sender}
                  </span>
                  <div className="text-[11px]  mt-1 text-right font-medium text-gray-500 italic tracking-wide font-bold">
                    {formatTime(msg.timestamp)}
                  </div>


                </div>

                {/* Message Content */}
                {msg.type === "FILE" && msg.fileUrl ? (
                  <>
                    {/* 🖼️ Image Preview */}
                    {msg.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                      <img
                        src={msg.fileUrl}
                        alt={msg.content || "Image"}
                        className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition"
                        onClick={() => window.open(msg.fileUrl, "_blank")}
                      />
                    ) : msg.fileUrl.match(/\.(pdf)$/i) ? (
                      /* 📄 PDF Viewer */
                      <div className="border rounded-lg p-2 bg-gray-100 cursor-pointer hover:bg-gray-200 transition max-w-full sm:max-w-[300px] md:max-w-[400px]">
                        <div
                          className="flex items-center gap-2"
                          onClick={() => window.open(msg.fileUrl, "_blank")}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-red-500 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 12v.01M12 6v6M6 18h12"
                            />
                          </svg>
                          <span className="font-medium text-sm truncate max-w-[250px]">
                            {msg.content || "Document.pdf"}
                          </span>
                        </div>
                        <iframe
                          src={msg.fileUrl}
                          className="w-full h-48 mt-2 rounded border"
                          title={msg.content || "PDF Preview"}
                        />
                      </div>
                    ) : (
                      /* 📎 Other Files */
                      <a
                        href={msg.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline break-words"
                      >
                        📎 {msg.content || "Download file"}
                      </a>
                    )}
                  </>
                ) : (
                  <div className="break-words">{msg.content}</div>
                )}
              </div>

              {/* Avatar for sender */}
              {msg.sender === currentUser && (
                currentUserImageUrl ? (
                  <img
                    src={currentUserImageUrl}
                    alt={msg.sender}
                    className="w-8 h-8 rounded-full object-cover ml-2 border border-indigo-300"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center ml-2 text-sm font-semibold text-indigo-800">
                    {msg.sender.charAt(0).toUpperCase()}
                  </div>
                )
              )}

            </div>
          ))
        )}

        {/* Typing indicator */}
        {isRecipientTyping && (
          <div className="text-sm text-gray-500 italic px-2">Typing...</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={sendPrivateMessage}
        className="flex items-center gap-2 p-3 bg-gray-100 border-t"
      >
        <input
          type="text"
          placeholder={`Message ${recipientUser}...`}
          value={message}
          onChange={handleInputChange}
          className="flex-1 px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          maxLength={500}
        />
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileUpload}
          className="hidden"
          id="fileUpload"
        />
        <label
          htmlFor="fileUpload"
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 p-2 rounded-full cursor-pointer transition"
          title="Send file"
        >
          <FiPaperclip size={18} />
        </label>
        <button
          type="submit"
          disabled={!message.trim()}
          className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <FiSend size={18} />
        </button>
      </form>
    </div>
  );
};

export default PrivateChat;
