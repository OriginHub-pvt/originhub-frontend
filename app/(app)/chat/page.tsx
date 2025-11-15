"use client";

import { useState, useRef, useEffect, ChangeEvent, FormEvent } from "react";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const inputPlaceholders = [
  "Pitch an AI solution for urban heat islands",
  "Find a startup idea for food waste",
  "How can we fix commuting for nurses?",
  "Help me disrupt college dining",
  "Suggest a B2B tool for remote teams",
];

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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handlePlaceholderSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-transparent">
      <div className="border-b border-white/10 bg-transparent px-4 py-4 sm:px-6 lg:px-8 xl:px-12">
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

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto w-full max-w-5xl space-y-6">
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

                <div
                  className={`rounded-2xl px-4 py-3 shadow-sm ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-[#0e3a5f] to-[#14b8a6] text-white"
                      : "border border-slate-700 bg-slate-800 text-white"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed sm:text-base">
                    {message.content}
                  </p>
                </div>

                <span className="text-xs text-slate-400">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

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
                <div className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 shadow-sm">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-[#14b8a6] [animation-delay:-0.3s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-[#14b8a6] [animation-delay:-0.15s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-[#14b8a6]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-white/10 bg-transparent px-4 py-6 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto w-full max-w-4xl">
          <PlaceholdersAndVanishInput
            placeholders={inputPlaceholders}
            onChange={handleInputChange}
            onSubmit={handlePlaceholderSubmit}
          />
          <p className="mt-3 text-xs text-slate-400">
            Hit Enter to send or tap the arrow. We’ll animate your prompt into
            orbit.
          </p>
        </div>
      </div>
    </div>
  );
}
