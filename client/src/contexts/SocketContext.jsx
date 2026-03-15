import { createContext, useContext, useEffect, useState } from "react";
import socketService from "../utils/socket";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      // Connect to socket
      const socket = socketService.connect(token);

      // Setup connection listeners
      socket.on("connect", () => {
        setIsConnected(true);
        console.log("✅ Socket connected");
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
        console.log("❌ Socket disconnected");
      });

      socket.on("connect_error", (error) => {
        setIsConnected(false);
        console.error("🔴 Socket connection error:", error.message);
      });

      // Listen for user online/offline events
      socket.on("userOnline", (userId) => {
        setOnlineUsers((prev) => new Set([...prev, userId]));
      });

      socket.on("userOffline", (userId) => {
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      // Handle general notifications (like match status changed, etc.)
      socket.on("notificationReceived", (notification) => {
        // dynamic import so we don't cause circular dependency issues or initialization bugs if it's imported at the top
        import("../utils/toast").then(({ showInfo }) => {
          showInfo(notification.content, { 
            onClick: () => {
              // optional: could redirect to notifications page or match page
              if (notification.type === 'match_request' || notification.type === 'system') {
                 // The user would likely navigate to /matches or /notifications
                 window.location.href = '/notifications';
              }
            }
          });
        });
      });

      // Cleanup on unmount
      return () => {
        socketService.disconnect();
        setIsConnected(false);
        setOnlineUsers(new Set());
      };
    }
  }, []);

  const joinConversation = (conversationId) => {
    if (socketService.isConnected()) {
      socketService.joinConversation(conversationId);
      console.log(`📱 Joined conversation: ${conversationId}`);
    }
  };

  const leaveConversation = (conversationId) => {
    if (socketService.isConnected()) {
      socketService.leaveConversation(conversationId);
      console.log(`📱 Left conversation: ${conversationId}`);
    }
  };

  const sendMessage = (messageData) => {
    if (socketService.isConnected()) {
      socketService.sendMessage(messageData);
    } else {
      console.warn("Cannot send message: Socket not connected");
    }
  };

  const onMessageReceived = (callback) => {
    if (socketService.socket) {
      socketService.onMessageReceived(callback);
    }
  };

  const offMessageReceived = (callback) => {
    if (socketService.socket) {
      socketService.off("messageReceived", callback);
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  const value = {
    socket: socketService.socket,
    isConnected,
    onlineUsers: Array.from(onlineUsers),
    joinConversation,
    leaveConversation,
    sendMessage,
    onMessageReceived,
    offMessageReceived,
    isUserOnline,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export default SocketContext;
