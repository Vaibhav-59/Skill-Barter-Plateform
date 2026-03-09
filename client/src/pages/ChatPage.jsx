import { useState, useEffect, useRef } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import api from "../utils/api";
import VideoCall from "../components/VideoCall";

export default function ChatPage() {
  const location = useLocation();
  const { matchId } = useParams();
  const navigate = useNavigate();
  const {
    isConnected,
    joinConversation,
    leaveConversation,
    onMessageReceived,
    offMessageReceived,
  } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const fileInputRef = useRef(null);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const userId = JSON.parse(localStorage.getItem("user"))?._id;
  const isInitialLoad = useRef(true);

  // Scroll the messages container to the bottom — scoped to the div, not the window
  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "instant",
      });
    }
  };

  // Load conversations on component mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        setError("");

        // If matchId is provided, try to get/create conversation for that match
        if (matchId) {
          try {
            const matchRes = await api.get(
              `/chats/conversations/match/${matchId}`
            );
            setSelectedConversation(matchRes.data);

            // Also load all conversations for the sidebar
            const allRes = await api.get("/chats/conversations");
            setConversations(allRes.data);
          } catch (matchError) {
            console.error("Match conversation error:", matchError);
            if (matchError.response?.status === 403) {
              setError(
                matchError.response.data.message ||
                  "Please wait for match approval before messaging!"
              );
            } else {
              setError("Failed to load conversation");
            }

            // Still try to load other conversations
            try {
              const allRes = await api.get("/chats/conversations");
              setConversations(allRes.data);
            } catch (err) {
              console.error("Failed to load conversations:", err);
            }
          }
        } else {
          // Load all conversations
          const res = await api.get("/chats/conversations");
          setConversations(res.data);

          // If coming from UserDetailPage with userId, find conversation
          if (location.state?.userId) {
            const conversation = res.data.find((conv) =>
              conv.participants.some((p) => p._id === location.state.userId)
            );
            if (conversation) {
              setSelectedConversation(conversation);
            }
          } else if (res.data.length > 0) {
            setSelectedConversation(res.data[0]);
          }
        }
      } catch (error) {
        console.error("Failed to load conversations:", error);
        setError("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [location.state, matchId]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation && !error) {
      loadMessages(selectedConversation._id);
      joinConversation(selectedConversation._id);

      return () => {
        leaveConversation(selectedConversation._id);
      };
    }
  }, [selectedConversation, error, joinConversation, leaveConversation]);

  // Listen for new messages with better real-time handling
  useEffect(() => {
    const handleNewMessage = (message) => {
      console.log("Real-time message received:", message);

      // Use string comparison — one side may be Mongoose ObjectId, the other a plain string
      const msgConvId = message.conversationId?.toString();
      const currConvId = selectedConversation?._id?.toString();

      if (msgConvId && currConvId && msgConvId === currConvId) {
        setMessages((prev) => {
          // Prevent duplicates — message may already be added from API response
          const exists = prev.some((msg) => msg._id?.toString() === message._id?.toString());
          if (exists) return prev;
          return [...prev, message];
        });
      }

      // Update conversation list sidebar with new last message
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id?.toString() === msgConvId
            ? {
                ...conv,
                lastMessage: message,
                lastMessageAt: message.createdAt || new Date(),
              }
            : conv
        )
      );
    };

    if (onMessageReceived) {
      onMessageReceived(handleNewMessage);
      return () => {
        if (offMessageReceived) {
          offMessageReceived(handleNewMessage);
        }
      };
    }
  }, [selectedConversation, onMessageReceived, offMessageReceived]);

  // Scroll to bottom when new messages arrive (but not on initial load)
  useEffect(() => {
    if (messages.length > 0 && !isInitialLoad.current) {
      scrollToBottom(true);
    }
    // Mark that initial load is done after first render
    if (isInitialLoad.current && messages.length > 0) {
      isInitialLoad.current = false;
    }
  }, [messages]);

  const loadMessages = async (conversationId) => {
    try {
      const res = await api.get(
        `/chats/conversations/${conversationId}/messages`
      );
      // Reset initial load flag for new conversation
      isInitialLoad.current = true;
      setMessages(res.data.messages || []);
      // Scroll to bottom instantly after loading (no smooth so it doesn't flash)
      setTimeout(() => scrollToBottom(false), 50);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Allowed: jpg, png, mp4, mov, pdf, docx");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError("File size must be less than 100MB");
      return;
    }

    setSelectedFile(file);
    setError("");

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else if (file.type.startsWith("video/")) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFile = async () => {
    if (!selectedFile || !selectedConversation) return null;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await api.post("/chats/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("File upload error:", error);
      throw error;
    }
  };

  const sendFileMessage = async (fileData) => {
    if (!selectedConversation || sending || error) return;

    setSending(true);

    // Create a temp message for optimistic UI — shown immediately while uploading
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      _id: tempId,
      text: "",
      sender: { _id: userId, name: "You" },
      createdAt: new Date().toISOString(),
      conversationId: selectedConversation._id,
      isTemporary: true,
      media: fileData.fileUrl,
      messageType: fileData.messageType,
      fileName: fileData.fileName,
      fileSize: fileData.fileSize,
      mimeType: fileData.mimeType,
    };

    setMessages((prev) => [...prev, tempMessage]);
    clearSelectedFile();

    try {
      const messageData = {
        conversationId: selectedConversation._id,
        text: "",
        messageType: fileData.messageType,
        media: fileData.fileUrl,
        fileName: fileData.fileName,
        fileSize: fileData.fileSize,
        mimeType: fileData.mimeType,
      };

      const response = await api.post("/chats/messages", messageData);

      // Replace temp message with real message from API response
      // (The socket event will also arrive but get deduplicated by _id)
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg._id !== tempId);
        const exists = filtered.some((msg) => msg._id === response.data._id);
        if (exists) return filtered;
        return [...filtered, response.data];
      });
    } catch (error) {
      console.error("Failed to send file message:", error);
      // Remove temp on error
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
      setError(error.response?.data?.message || "Failed to send file");
    } finally {
      setSending(false);
    }
  };

  const handleSendWithFile = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const fileData = await uploadFile();
      await sendFileMessage(fileData);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending || error) return;

    setSending(true);
    const tempId = `temp-${Date.now()}`;
    const messageText = newMessage.trim();

    const tempMessage = {
      _id: tempId,
      text: messageText,
      messageType: "text",
      sender: { _id: userId, name: "You" },
      createdAt: new Date().toISOString(),
      conversationId: selectedConversation._id,
      isTemporary: true,
    };

    // Optimistically add message to UI
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    try {
      const response = await api.post("/chats/messages", {
        conversationId: selectedConversation._id,
        text: messageText,
        messageType: "text",
      });

      // Replace temp with real message; socket event may also arrive (deduped by _id)
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg._id !== tempId);
        const exists = filtered.some((msg) => msg._id === response.data._id);
        if (exists) return filtered;
        return [...filtered, response.data];
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
      setNewMessage(messageText);

      if (error.response?.status === 403) {
        setError(error.response.data.message || "Please wait for match approval before messaging!");
      } else if (error.response?.status === 404) {
        setError(error.response.data.message || "Conversation not found");
      } else {
        setError(error.response?.data?.message || "Failed to send message");
      }
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  // Programmatic download: fetch as blob → create object URL → trigger download.
  // This avoids the browser trying to render the file inline (which causes CORS errors for PDFs).
  const handleDocumentDownload = async (url, fileName) => {
    try {
      const response = await fetch(url, { mode: "cors" });
      if (!response.ok) throw new Error("Fetch failed");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName || "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch {
      // Fallback: open directly in a new tab (browser will handle it)
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-slate-950 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-500/12 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-2xl shadow-emerald-500/25">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
            <div className="text-xl font-semibold bg-gradient-to-r from-white via-gray-100 to-slate-200 bg-clip-text text-transparent pb-4">
              Loading conversations...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if match is not accepted
  if (error && matchId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-slate-950 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-500/12 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 flex items-center justify-center h-screen px-4">
          <div className="text-center bg-gray-950/40 backdrop-blur-xl border border-gray-800/40 rounded-3xl p-12 max-w-md shadow-2xl">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-red-400/20 via-red-500/15 to-red-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <svg
                  className="w-10 h-10 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-4 pb-2">
              Chat Not Available
            </h3>
            <p className="text-red-400 mb-8 text-lg leading-relaxed pb-4">
              {error}
            </p>
            <div className="space-y-4">
              <button
                onClick={() => navigate("/matches")}
                className="w-full px-6 py-3 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-500 hover:via-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-emerald-500/30"
              >
                View Matches
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full px-6 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-slate-300 font-semibold rounded-xl hover:bg-gray-700/60 hover:border-gray-600/50 transition-all duration-300"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-black via-gray-950 to-slate-950 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-500/12 rounded-full blur-3xl animate-pulse delay-1000"></div>

        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-3 h-3 bg-emerald-400/60 rounded-full animate-ping shadow-lg shadow-emerald-400/30"></div>
        <div className="absolute top-40 right-32 w-2 h-2 bg-green-400/70 rounded-full animate-ping delay-1000 shadow-lg shadow-green-400/30"></div>
        <div className="absolute bottom-32 left-1/3 w-2.5 h-2.5 bg-teal-400/50 rounded-full animate-ping delay-2000 shadow-lg shadow-teal-400/30"></div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-gray-950/50"></div>
      </div>

      <div className="relative z-10 p-6 h-screen flex gap-6">
        {/* Conversations List */}
        <div className="w-1/3 bg-gray-950/25 backdrop-blur-xl border border-gray-800/30 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-gray-800/40">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent pb-2">
                Messages
              </h3>
              <div className="flex items-center gap-3">
                <div
                  className={`relative w-3 h-3 rounded-full ${
                    isConnected ? "bg-emerald-400" : "bg-red-400"
                  } animate-pulse shadow-md`}
                  title={isConnected ? "Connected" : "Disconnected"}
                >
                  <div
                    className={`absolute inset-0 w-3 h-3 rounded-full ${
                      isConnected ? "bg-emerald-400" : "bg-red-400"
                    } animate-ping opacity-15`}
                  ></div>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {isConnected ? "Online" : "Offline"}
                </span>
              </div>
            </div>
            <p className="text-slate-500 text-sm pb-2">
              Connect with your skill exchange partners
            </p>
          </div>

          <div className="h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-20 h-20 bg-gradient-to-r from-emerald-400/25 via-green-500/20 to-teal-600/25 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
                  <svg
                    className="w-10 h-10 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2 pb-1">
                  No conversations yet
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed pb-4">
                  Start connecting with other learners to begin your skill
                  exchange journey
                </p>
                <button
                  onClick={() => navigate("/matches")}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-500 hover:via-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/30"
                >
                  Find Matches
                </button>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {conversations.map((conversation) => {
                  const otherParticipant = conversation.participants.find(
                    (p) => p._id !== userId
                  );
                  const isSelected =
                    selectedConversation?._id === conversation._id;

                  return (
                    <div
                      key={conversation._id}
                      onClick={() => {
                        setSelectedConversation(conversation);
                        setError("");
                      }}
                      className={`group p-4 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-102 relative overflow-hidden ${
                        isSelected
                          ? "bg-gradient-to-r from-emerald-400/15 via-green-500/10 to-teal-600/15 border border-emerald-400/25 shadow-lg shadow-emerald-500/15"
                          : "bg-gray-900/25 backdrop-blur-sm border border-gray-800/25 hover:bg-gray-900/40 hover:border-gray-700/30 shadow-md"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/8 via-green-500/4 to-teal-600/8 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      )}

                      <div className="relative flex items-center gap-4">
                        <div className="relative">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold ${
                              isSelected
                                ? "bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 text-white shadow-emerald-500/20"
                                : "bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 text-white"
                            }`}
                          >
                            {otherParticipant?.name?.charAt(0)?.toUpperCase() ||
                              "U"}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-gray-950 animate-pulse shadow-md shadow-emerald-400/40"></div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p
                              className={`font-semibold truncate ${
                                isSelected ? "text-white" : "text-white"
                              }`}
                            >
                              {otherParticipant?.name || "Unknown User"}
                            </p>
                            {conversation.lastMessageAt && (
                              <span
                                className={`text-xs ${
                                  isSelected
                                    ? "text-emerald-200"
                                    : "text-slate-500"
                                }`}
                              >
                                {formatTime(conversation.lastMessageAt)}
                              </span>
                            )}
                          </div>
                          {conversation.lastMessage && (
                            <p
                              className={`text-sm truncate leading-relaxed pb-1 ${
                                isSelected
                                  ? "text-emerald-100"
                                  : "text-slate-500"
                              }`}
                            >
                              {conversation.lastMessage.messageType === "image"
                                ? "📷 Image"
                                : conversation.lastMessage.messageType === "video"
                                ? "🎬 Video"
                                : conversation.lastMessage.messageType === "document"
                                ? "📄 Document"
                                : conversation.lastMessage.text}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-gray-950/25 backdrop-blur-xl border border-gray-800/30 rounded-3xl flex flex-col overflow-hidden">
          {selectedConversation && !error ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-800/40 bg-gradient-to-r from-gray-900/30 via-gray-950/20 to-gray-900/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                        {selectedConversation.participants
                          .find((p) => p._id !== userId)
                          ?.name?.charAt(0)
                          ?.toUpperCase() || "U"}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-gray-950 animate-pulse shadow-md shadow-emerald-400/40"></div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white pb-1">
                        {selectedConversation.participants.find(
                          (p) => p._id !== userId
                        )?.name || "Unknown User"}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isConnected ? "bg-emerald-400" : "bg-red-400"
                          } animate-pulse`}
                        ></div>
                        <p className="text-sm text-slate-500">
                          {isConnected ? "Active now" : "Offline"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Video call button */}
                  <VideoCall
                    currentUser={JSON.parse(localStorage.getItem("user") || "{}")}
                    remoteUser={selectedConversation.participants.find((p) => p._id !== userId)}
                    conversationId={selectedConversation._id}
                    onCallMessage={(msg) => setMessages((prev) => [...prev, msg])}
                    onClose={() => setShowVideoCall(false)}
                  />
                </div>
              </div>

              {/* Messages */}
              <div ref={messagesContainerRef} className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                  {messages.map((message, index) => {
                    const isOwnMessage = message.sender?._id === userId;
                    const showDate =
                      index === 0 ||
                      formatDate(messages[index - 1].createdAt) !==
                        formatDate(message.createdAt);

                    return (
                      <div key={message._id}>
                        {showDate && (
                          <div className="text-center my-6">
                            <div className="inline-block bg-gray-900/50 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-800/30">
                              <span className="text-xs text-slate-400 font-medium">
                                {formatDate(message.createdAt)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* ── Call summary message — centered pill ── */}
                        {message.messageType === "call" && (
                          <div className="flex justify-center my-3">
                            <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-700/40 rounded-full px-4 py-2 shadow">
                              <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              <span className="text-xs text-slate-300 font-medium">
                                {message.text}
                              </span>
                              <span className="text-xs text-slate-500 ml-1">
                                {formatTime(message.createdAt)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* ── Regular message bubble (text / image / video / document) ── */}
                        {message.messageType !== "call" && (
                        <div
                          className={`flex ${
                            isOwnMessage ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`group flex items-end gap-3 max-w-[75%] ${
                              isOwnMessage ? "flex-row-reverse" : "flex-row"
                            }`}
                          >
                            {!isOwnMessage && (
                              <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                {message.sender?.name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "U"}
                              </div>
                            )}

                            <div
                              className={`relative px-5 py-3 rounded-2xl shadow-md ${
                                isOwnMessage
                                  ? "bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 text-white shadow-emerald-500/15"
                                  : "bg-gray-900/50 backdrop-blur-sm border border-gray-800/30 text-white shadow-gray-900/15"
                              } ${message.isTemporary ? "opacity-70" : ""}`}
                            >
                              {isOwnMessage && (
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/8 to-white/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              )}

                              {/* Image Message */}
                              {message.messageType === "image" && message.media && (
                                <div className="mb-2">
                                  <img
                                    src={message.media}
                                    alt="Shared image"
                                    className="max-w-[250px] max-h-[300px] rounded-lg border border-white/10 cursor-pointer object-cover"
                                    loading="lazy"
                                    crossOrigin="anonymous"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "";
                                      e.target.alt = "Failed to load image";
                                      e.target.className = "hidden";
                                      e.target.parentElement.innerHTML = '<div class="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg border border-white/10"><span class="text-sm text-slate-400">⚠️ Image failed to load</span></div>';
                                    }}
                                  />
                                </div>
                              )}

                              {/* Video Message */}
                              {message.messageType === "video" && message.media && (
                                <div className="mb-2">
                                  <video
                                    src={message.media}
                                    controls
                                    preload="metadata"
                                    crossOrigin="anonymous"
                                    className="max-w-[250px] max-h-[300px] rounded-lg border border-white/10"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      e.target.parentElement.innerHTML = '<div class="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg border border-white/10"><span class="text-sm text-slate-400">⚠️ Video failed to load</span></div>';
                                    }}
                                  />
                                </div>
                              )}

                              {/* Document Message */}
                              {message.messageType === "document" && message.media && (() => {
                                const isPdf = message.mimeType === "application/pdf"
                                  || message.fileName?.toLowerCase().endsWith(".pdf");
                                const ext = message.fileName?.split(".").pop()?.toUpperCase() || "FILE";

                                return (
                                  <div className="mb-2">
                                    {/* raw Cloudinary URL — direct navigation, no CORS issues */}
                                    <a
                                      href={message.media}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-white/10 hover:bg-gray-700/50 transition-colors cursor-pointer"
                                    >
                                      <div className={`w-10 h-10 ${isPdf ? "bg-red-500/20" : "bg-blue-500/20"} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                        <svg
                                          className={`w-5 h-5 ${isPdf ? "text-red-400" : "text-blue-400"}`}
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                          />
                                        </svg>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                          {message.fileName || "Document"}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                          {message.fileSize
                                            ? `${(message.fileSize / (1024 * 1024)).toFixed(2)} MB · `
                                            : ""}
                                          {ext} · Click to open
                                        </p>
                                      </div>
                                      <svg
                                        className="w-4 h-4 text-slate-400 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                        />
                                      </svg>
                                    </a>
                                  </div>
                                );
                              })()}

                              {/* Text Content — only show for text messages, not for files */}
                              {message.messageType === "text" && message.text && (
                                <p className="text-sm leading-relaxed relative pb-1">
                                  {message.text}
                                </p>
                              )}
                              <div className="flex items-center justify-end gap-2 mt-2">
                                <p
                                  className={`text-xs ${
                                    isOwnMessage
                                      ? "text-emerald-100"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {formatTime(message.createdAt)}
                                </p>
                                {message.isTemporary && (
                                  <div className="w-3 h-3 border border-current rounded-full animate-spin opacity-60"></div>
                                )}
                                {isOwnMessage && !message.isTemporary && (
                                  <svg
                                    className="w-4 h-4 text-emerald-100"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-gray-800/40 bg-gradient-to-r from-gray-900/40 via-gray-950/20 to-gray-900/40">
                {/* File Preview */}
                {selectedFile && (
                  <div className="mb-4 p-4 bg-gray-900/50 backdrop-blur-sm border border-gray-800/30 rounded-2xl">
                    <div className="flex items-center gap-4">
                      {filePreview ? (
                        selectedFile.type.startsWith("image/") ? (
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-xl border border-gray-700/30"
                          />
                        ) : selectedFile.type.startsWith("video/") ? (
                          <video
                            src={filePreview}
                            className="w-20 h-20 object-cover rounded-xl border border-gray-700/30"
                            controls
                          />
                        ) : null
                      ) : (
                        <div className="w-20 h-20 bg-gray-800/50 rounded-xl border border-gray-700/30 flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-slate-400 text-sm">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={clearSelectedFile}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors duration-300 rounded-lg hover:bg-gray-800/50"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleSendWithFile}
                      disabled={uploading}
                      className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-500 hover:via-green-600 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                          </svg>
                          Send File
                        </>
                      )}
                    </button>
                  </div>
                )}
                <form onSubmit={sendMessage}>
                  <div className="flex items-center gap-3">
                    {/* Attachment Button (+) */}
                    <button
                      type="button"
                      onClick={handleFileButtonClick}
                      className="flex-shrink-0 w-11 h-11 flex items-center justify-center hover:bg-gray-800/50 transition-all duration-300 rounded-2xl border border-gray-800/30 bg-gray-900/30"
                    >
                      <svg
                        className="w-6 h-6 text-slate-400 hover:text-emerald-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*,video/*,.pdf,.doc,.docx"
                      className="hidden"
                    />

                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage(e);
                          }
                        }}
                        placeholder="Type your message..."
                        rows={1}
                        className="w-full px-5 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-800/30 rounded-2xl text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-300 resize-none custom-scrollbar"
                        style={{
                          minHeight: "44px",
                          maxHeight: "120px",
                        }}
                        disabled={sending || !isConnected || error}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={
                        !newMessage.trim() || sending || !isConnected || error || selectedFile
                      }
                      className="flex-shrink-0 group relative w-12 h-12 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 hover:from-emerald-500 hover:via-green-600 hover:to-teal-700 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                    >
                      {sending ? (
                        <div className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                      ) : (
                        <svg
                          className="w-5 h-5 text-white relative transform group-hover:translate-x-0.5 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Status indicators */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      {!isConnected && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                          <span>Reconnecting...</span>
                        </div>
                      )}
                      {sending && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                          <span>Sending message...</span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-slate-600">
                      Press Enter to send
                    </div>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center px-6">
              <div>
                <div className="w-24 h-24 bg-gradient-to-r from-emerald-400/25 via-green-500/20 to-teal-600/25 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <svg
                    className="w-12 h-12 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-4 pb-2">
                  {error
                    ? "Please select another conversation"
                    : "Select a conversation"}
                </h3>
                <p className="text-slate-400 text-lg leading-relaxed max-w-md pb-6">
                  {error
                    ? "Choose from your available conversations to continue chatting"
                    : "Choose a conversation from the sidebar to start exchanging knowledge and building connections"}
                </p>
                {!error && conversations.length === 0 && (
                  <button
                    onClick={() => navigate("/matches")}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-500 hover:via-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-emerald-500/30"
                  >
                    Find Learning Partners
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #10b981, #059669);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #059669, #047857);
        }

        /* Auto-resize textarea */
        textarea {
          field-sizing: content;
        }
      `}</style>
    </div>
  );
}
