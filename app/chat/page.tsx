"use client";

import { useState, useRef, useEffect } from "react";
import Navigation from "@/components/Navigation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI startup ideation assistant. Share a real-world problem you've encountered, and I'll help you transform it into a viable startup idea. What problem would you like to explore?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I understand you're facing this problem: "${userMessage.content}". Let me analyze this and help you brainstorm some startup ideas. 

Based on your input, here are some potential startup concepts:
1. A platform that addresses the core issue
2. A service that simplifies the process
3. A solution that leverages technology to solve this problem

Would you like me to elaborate on any of these ideas or explore different angles?`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-900">
      <Navigation />

      {/* Chat Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="border-b border-slate-700 bg-slate-800 px-4 py-4 shadow-sm sm:px-6 lg:px-8 xl:px-12">
          <div className="w-full">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#0e3a5f] to-[#14b8a6]">
                <span className="text-lg">🤖</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">
                  AI Startup Ideation Assistant
                </h1>
                <p className="text-sm text-slate-400">
                  Share a problem to get started
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 xl:px-12">
          <div className="w-full max-w-5xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex animate-fade-in ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-[80%] flex-col space-y-2 sm:max-w-[70%] ${
                    message.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  {/* Avatar */}
                  <div className="flex items-center space-x-2">
                    {message.role === "assistant" && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#0e3a5f] to-[#14b8a6]">
                        <span className="text-sm">🤖</span>
                      </div>
                    )}
                    <span className="text-xs font-medium text-slate-400">
                      {message.role === "user" ? "You" : "AI Assistant"}
                    </span>
                    {message.role === "user" && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700">
                        <span className="text-sm">👤</span>
                      </div>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 shadow-sm ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-[#0e3a5f] to-[#14b8a6] text-white"
                        : "bg-slate-800 text-white border border-slate-700"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed sm:text-base">
                      {message.content}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <span className="text-xs text-slate-400">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex animate-fade-in justify-start">
                <div className="flex max-w-[70%] flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#0e3a5f] to-[#14b8a6]">
                      <span className="text-sm">🤖</span>
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                      AI Assistant
                    </span>
                  </div>
                  <div className="rounded-2xl bg-slate-800 px-4 py-3 shadow-sm border border-slate-700">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-[#14b8a6] [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-[#14b8a6] [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-[#14b8a6]"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-700 bg-slate-800 px-4 py-4 shadow-lg sm:px-6 lg:px-8 xl:px-12">
          <div className="w-full max-w-5xl mx-auto">
            <div className="flex items-end space-x-4">
              <div className="flex-1 rounded-xl border-2 border-slate-600 bg-slate-900 focus-within:border-[#14b8a6] focus-within:bg-slate-800 transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe a real-world problem you've encountered..."
                  rows={1}
                  className="w-full resize-none rounded-xl bg-transparent px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none sm:text-base"
                  style={{
                    maxHeight: "120px",
                    minHeight: "48px",
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = `${Math.min(
                      target.scrollHeight,
                      120
                    )}px`;
                  }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#0e3a5f] to-[#14b8a6] text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#14b8a6]/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                aria-label="Send message"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
