import { useState, useRef, useEffect, useContext } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { ThemeContext } from '../contexts/ThemeContext';
import { MessageSquare, X, Send, User, Bot, Sparkles } from 'lucide-react';

export default function SkillMentor() {
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === 'dark';
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: "Hi 👋 I'm your AI Skill Mentor.\n\nI can help you:\n• Find skill gaps\n• Plan your learning roadmap\n• Suggest skill exchanges\n\nTell me your current skills and your career goal."
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      // Format history to send all previous interactions except the greeting if needed,
      // but sending everything helps the model contextualize.
      const history = messages.filter((msg, idx) => idx > 0); 
      
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/mentor/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: userMessage,
          history: history
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(prev => [...prev, { role: 'model', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: `Error: ${data.message || 'Something went wrong.'}` }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: 'Connection failed. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Chat window styling based on theme
  const bgClass = isDarkMode ? 'bg-[#1e293b] border-slate-700 text-slate-100' : 'bg-white border-gray-200 text-gray-800';
  const headerClass = 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white';
  const inputBgClass = isDarkMode ? 'bg-[#0f172a] border-slate-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900';
  const userMsgClass = 'bg-emerald-500 text-white';
  const botMsgClass = isDarkMode ? 'bg-slate-700 text-slate-100' : 'bg-gray-100 text-gray-800';

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[9999] group flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-full shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.8)] transition-all duration-300 animate-chatbot-bounce"
          aria-label="Open AI Skill Mentor"
        >
          <Bot className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
          <Sparkles className="w-4 h-4 absolute top-3 right-3 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`fixed bottom-6 right-6 z-[9999] w-[350px] sm:w-[400px] h-[550px] max-h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border ${bgClass} transition-all duration-300 animate-in slide-in-from-bottom-5`}
        >
          {/* Header */}
          <div className={`p-4 flex items-center justify-between ${headerClass}`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-shadow-sm">AI Skill Mentor</h3>
                <p className="text-xs text-emerald-100">Powered by AI</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div key={index} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-emerald-600" />
                    </div>
                  )}
                  
                  <div 
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      isUser 
                        ? `max-w-[75%] whitespace-pre-wrap ${userMsgClass} rounded-br-sm` 
                        : `max-w-[85%] ${botMsgClass} rounded-bl-sm prose prose-sm ${isDarkMode ? 'prose-invert prose-p:text-slate-100 prose-li:text-slate-100 prose-headings:text-slate-100' : 'prose-p:text-gray-800 prose-li:text-gray-800 prose-headings:text-gray-900'} max-w-none`
                    }`}
                  >
                    {isUser ? (
                      msg.content
                    ) : (
                      <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-1 text-white">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-emerald-600" />
                </div>
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl rounded-bl-sm ${botMsgClass}`}>
                  <div className="flex gap-1.5 items-center h-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form 
            onSubmit={handleSend}
            className={`p-3 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}
          >
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className={`w-full pl-4 pr-12 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm ${inputBgClass}`}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
