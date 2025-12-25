import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { AppProps } from './types';

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AssistantTip {
  text: string;
  icon?: React.ReactNode;
}

export interface AssistantConfig {
  name?: string;
  avatar?: string | React.ReactNode;
  tips?: AssistantTip[];
  responses?: string[];
  welcomeMessage?: string;
  modelUrl?: string;
}

const defaultTips: AssistantTip[] = [
  { text: "Hi! I'm your AI assistant. How can I help you today? 🚀" },
  { text: "Did you know? You can ask me about coding, writing, or anything else!" },
  { text: "Pro tip: I can help you brainstorm ideas and solve problems 💡" },
  { text: "I'm here to help! Just ask me anything 💬" },
];

const defaultResponses = [
  "That's a great question! Let me help you with that.",
  "Interesting! I'd be happy to explore that further with you.",
  "Great thinking! Here's what I know about that topic.",
  "Thanks for asking! I'll do my best to help.",
  "I love your curiosity! Let me share what I know.",
];

const ZAssistant: React.FC<AppProps & { config?: AssistantConfig }> = ({ className, config }) => {
  const [currentTip, setCurrentTip] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [chatMode, setChatMode] = useState(false);
  const [chatMessages, setChatMessages] = useState<AssistantMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const tips = config?.tips || defaultTips;
  const responses = config?.responses || defaultResponses;
  const name = config?.name || 'AI Assistant';
  const welcomeMessage = config?.welcomeMessage || `Hi! I'm ${name} 👋 Ask me anything!`;

  // Initialize with welcome message
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([{
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      }]);
    }
  }, [welcomeMessage, chatMessages.length]);

  // Cycle through tips
  useEffect(() => {
    if (!showBubble || chatMode) return;
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentTip((prev) => (prev + 1) % tips.length);
        setTimeout(() => setIsAnimating(false), 100);
      }, 400);
    }, 8000);
    return () => clearInterval(interval);
  }, [showBubble, chatMode, tips.length]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatMode && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatMode]);

  const handleSendMessage = useCallback(() => {
    if (!chatInput.trim()) return;

    const userMessage: AssistantMessage = {
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: AssistantMessage = {
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  }, [chatInput, responses]);

  const openChat = useCallback(() => {
    setChatMode(true);
    setShowBubble(false);
  }, []);

  const renderAvatar = (size: 'sm' | 'lg' = 'sm') => {
    const sizeClass = size === 'lg' ? 'w-12 h-12 text-xl' : 'w-8 h-8 text-sm';
    if (typeof config?.avatar === 'string') {
      return (
        <div className={`${sizeClass} rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium`}>
          {config.avatar}
        </div>
      );
    }
    if (config?.avatar) {
      return config.avatar;
    }
    return (
      <div className={`${sizeClass} rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium`}>
        🤖
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      {!chatMode ? (
        // Tips View
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-900 to-gray-800">
          {/* Avatar */}
          <div className="mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl shadow-2xl shadow-purple-500/30">
              {typeof config?.avatar === 'string' ? config.avatar : '🤖'}
            </div>
          </div>

          {/* Tip Bubble */}
          {showBubble && (
            <div
              className={`max-w-md bg-white rounded-2xl p-4 shadow-2xl mb-6 transition-all duration-300 ${
                isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  {tips[currentTip].icon || <span className="text-white text-sm">💡</span>}
                </div>
                <p className="text-gray-800 text-sm leading-relaxed">
                  {tips[currentTip].text}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  {name}
                </span>
                <div className="flex gap-1">
                  {tips.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                        i === currentTip ? 'bg-purple-500 scale-125' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Start Chat Button */}
          <button
            onClick={openChat}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Start Chat
          </button>

          {/* Model Viewer Placeholder */}
          {config?.modelUrl && (
            <div className="mt-6 text-center text-gray-500 text-sm">
              3D Model: {config.modelUrl}
            </div>
          )}
        </div>
      ) : (
        // Chat View
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              {renderAvatar()}
              <div>
                <span className="font-medium text-gray-800">{name}</span>
                <span className="block text-xs text-green-500">● Online</span>
              </div>
            </div>
            <button
              onClick={() => { setChatMode(false); setShowBubble(true); }}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-purple-500 text-white rounded-br-md'
                      : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 px-4 py-2 rounded-2xl rounded-bl-md border border-gray-200">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 placeholder-gray-400"
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim()}
                className="w-10 h-10 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZAssistant;
