"use client";

import { useState, useRef, useEffect, ChangeEvent, FormEvent } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { useApiClient } from "@/lib/api-client";

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
  const { user } = useUser();
  const apiClient = useApiClient();
  const searchParams = useSearchParams();
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
  const [chatId, setChatId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat on page load or when user changes
  useEffect(() => {
    if (!user?.id) return; // Wait for user authentication

    const chatIdParam = searchParams.get("chatId");
    const isNewChat = searchParams.get("new") === "true";

    // If there's a chatId in URL, load that chat's messages
    if (chatIdParam && chatIdParam !== chatId) {
      // Load existing chat - fetch all messages for this chat
      setIsLoadingChat(true);
      setError(null);
      setChatId(chatIdParam);

      apiClient
        .getChatMessages(chatIdParam)
        .then((response) => {
          // Handle response structure: { success: true, data: { messages: [...] }, message: "..." }
          let messagesData: unknown[] = [];
          if (
            response?.data?.messages &&
            Array.isArray(response.data.messages)
          ) {
            messagesData = response.data.messages;
          } else if (Array.isArray(response?.messages)) {
            messagesData = response.messages;
          } else if (Array.isArray(response?.data)) {
            messagesData = response.data;
          } else if (Array.isArray(response)) {
            messagesData = response;
          }

          // Transform backend message format to frontend Message format
          const transformedMessages: Message[] = messagesData.map(
            (msg: unknown) => {
              const message = msg as {
                id?: string;
                chat_id?: string;
                sender?: string;
                role?: string;
                message?: string;
                content?: string;
                created_at?: string;
                timestamp?: string;
              };

              // Map sender/role: "user" -> "user", "assistant" -> "assistant"
              const role =
                (message.sender || message.role || "user") === "user"
                  ? "user"
                  : "assistant";

              // Get content from either "message" or "content" field
              const content = message.message || message.content || "";

              // Parse timestamp
              const timestamp =
                message.created_at || message.timestamp
                  ? new Date(message.created_at || message.timestamp || "")
                  : new Date();

              return {
                id: message.id || Date.now().toString() + Math.random(),
                role: role as "user" | "assistant",
                content: content,
                timestamp: timestamp,
              };
            }
          );

          // If no messages found, show welcome message
          if (transformedMessages.length === 0) {
            setMessages([
              {
                id: "1",
                role: "assistant",
                content: "Chat loaded. Continue the conversation below.",
                timestamp: new Date(),
              },
            ]);
          } else {
            setMessages(transformedMessages);
          }
        })
        .catch((error) => {
          console.error("Error loading chat messages:", error);
          setError("Failed to load chat messages. Please try again.");
          // Show welcome message as fallback
          setMessages([
            {
              id: "1",
              role: "assistant",
              content: "Chat loaded. Continue the conversation below.",
              timestamp: new Date(),
            },
          ]);
        })
        .finally(() => {
          setIsLoadingChat(false);
        });
    } else if (!chatId && !isNewChat) {
      // No chatId in URL and not explicitly creating new chat
      // Initialize with empty chat (reuses existing empty chat or creates new)
      setIsLoadingChat(true);
      setError(null);

      apiClient
        .getEmptyChat()
        .then((response) => {
          // Extract chat ID from response
          // Expected: { id: "chat-uuid", title: "..." } or { data: { id: "...", title: "..." } }
          let emptyChatId: string | null = null;
          if (response?.data?.id) {
            emptyChatId = response.data.id;
          } else if (response?.id) {
            emptyChatId = response.id;
          }

          if (emptyChatId) {
            setChatId(emptyChatId);
            // Update URL to include the chat ID
            window.history.replaceState({}, "", `/chat?chatId=${emptyChatId}`);
            // Show welcome message for empty chat
            setMessages([
              {
                id: "1",
                role: "assistant",
                content:
                  "Hello! I'm your AI startup ideation assistant. Share a real-world problem you've encountered, and I'll help you transform it into a viable startup idea. What problem would you like to explore?",
                timestamp: new Date(),
              },
            ]);
          } else {
            throw new Error("Failed to get chat ID from server");
          }
        })
        .catch((error) => {
          console.error("Error initializing chat:", error);
          setError("Failed to initialize chat. Please try again.");
        })
        .finally(() => {
          setIsLoadingChat(false);
        });
    } else if (isNewChat && !chatId) {
      // Explicitly creating new chat - call the empty chat endpoint
      setIsLoadingChat(true);
      setError(null);

      apiClient
        .getEmptyChat()
        .then((response) => {
          let newChatId: string | null = null;
          if (response?.data?.id) {
            newChatId = response.data.id;
          } else if (response?.id) {
            newChatId = response.id;
          }

          if (newChatId) {
            setChatId(newChatId);
            // Update URL to include the chat ID
            window.history.replaceState({}, "", `/chat?chatId=${newChatId}`);
            // Show welcome message
            setMessages([
              {
                id: "1",
                role: "assistant",
                content:
                  "Hello! I'm your AI startup ideation assistant. Share a real-world problem you've encountered, and I'll help you transform it into a viable startup idea. What problem would you like to explore?",
                timestamp: new Date(),
              },
            ]);
          } else {
            throw new Error("Failed to get chat ID from server");
          }
        })
        .catch((error) => {
          console.error("Error creating new chat:", error);
          setError("Failed to create new chat. Please try again.");
        })
        .finally(() => {
          setIsLoadingChat(false);
        });
    }
  }, [searchParams, chatId, apiClient, user?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Ensure we have a chat_id before sending messages
    if (!chatId) {
      setError("Chat not initialized. Please wait...");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = input.trim();
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Get user ID from Clerk
      const userId = user?.id;

      if (!userId) {
        throw new Error("You must be signed in to send messages");
      }

      // Always send chat_id with the message (required by backend)
      const response = await apiClient.sendChatMessage(messageText, chatId);

      // Debug: Log the response to see what we're getting
      console.log("Chat API Response:", response);

      // Handle response structure
      // Expected formats:
      // - { success: true, data: { reply: "..." }, message: "..." }
      // - { reply: "..." }
      // - { data: { reply: "..." } }
      let replyText = "";

      if (response) {
        if (response.data?.reply) {
          // Nested structure: { success: true, data: { reply: "..." } } or { data: { reply: "..." } }
          replyText = response.data.reply;
        } else if (response.reply) {
          // Flat structure: { reply: "..." }
          replyText = response.reply;
        } else {
          // Log the full response to help debug
          console.error("Unexpected response format:", response);
          throw new Error("Unexpected response format from server");
        }
      }

      if (!replyText) {
        console.error("No reply text found in response:", response);
        throw new Error("No reply received from server");
      }

      console.log("Extracted reply:", replyText);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: replyText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      console.error("Error sending chat message:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to send message. Please try again.";
      setError(errorMessage);

      // Show error message in chat
      const errorAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorAssistantMessage]);
    } finally {
      setIsLoading(false);
    }
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
          {error && (
            <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm text-yellow-100">
              {error}
            </div>
          )}
          {isLoadingChat && (
            <div className="rounded-lg border border-white/10 bg-slate-800/50 p-4 text-sm text-white/70">
              Loading chat...
            </div>
          )}
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
