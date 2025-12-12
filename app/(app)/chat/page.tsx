"use client";

import {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  FormEvent,
  Suspense,
} from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { useApiClient } from "@/lib/api-client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

function ChatPageContent() {
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
  const [isConvertingToIdea, setIsConvertingToIdea] = useState(false);
  const router = useRouter();
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

    // Create placeholder assistant message for streaming
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Get user ID from Clerk
      const userId = user?.id;

      if (!userId) {
        throw new Error("You must be signed in to send messages");
      }

      // Try streaming first, fallback to regular if not supported
      try {
        await apiClient.sendChatMessageStream(
          messageText,
          chatId,
          // onToken callback - update message content as tokens arrive
          (token: string) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: msg.content + token }
                  : msg
              )
            );
          },
          // onComplete callback
          (fullText: string) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: fullText }
                  : msg
              )
            );
            setIsLoading(false);
          },
          // onError callback - fallback to regular API
          async (error: Error) => {
            console.warn(
              "Streaming not supported, falling back to regular API:",
              error
            );
            // Fallback to regular API call
            try {
              const response = await apiClient.sendChatMessage(
                messageText,
                chatId
              );
              let replyText = "";

              if (response) {
                if (response.data?.reply) {
                  replyText = response.data.reply;
                } else if (response.reply) {
                  replyText = response.reply;
                } else {
                  throw new Error("Unexpected response format from server");
                }
              }

              if (!replyText) {
                throw new Error("No reply received from server");
              }

              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: replyText }
                    : msg
                )
              );
            } catch (fallbackError) {
              console.error("Error in fallback API call:", fallbackError);
              const errorMessage =
                fallbackError instanceof Error
                  ? fallbackError.message
                  : "Failed to send message. Please try again.";
              setError(errorMessage);
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? {
                        ...msg,
                        content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
                      }
                    : msg
                )
              );
            } finally {
              setIsLoading(false);
            }
          }
        );
      } catch (streamError) {
        // If streaming fails immediately, fallback to regular API
        console.warn("Streaming failed, using regular API:", streamError);
        const response = await apiClient.sendChatMessage(messageText, chatId);
        let replyText = "";

        if (response) {
          if (response.data?.reply) {
            replyText = response.data.reply;
          } else if (response.reply) {
            replyText = response.reply;
          } else {
            throw new Error("Unexpected response format from server");
          }
        }

        if (!replyText) {
          throw new Error("No reply received from server");
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: replyText } : msg
          )
        );
        setIsLoading(false);
      }
    } catch (err: unknown) {
      console.error("Error sending chat message:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to send message. Please try again.";
      setError(errorMessage);

      // Update error message in chat
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
              }
            : msg
        )
      );
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

  const handleConvertToIdea = async () => {
    if (!chatId || !user?.id || isConvertingToIdea) return;

    setIsConvertingToIdea(true);
    setError(null);

    try {
      const response = await apiClient.convertChatToIdea(chatId);

      // Handle response structure - extract idea ID
      let ideaId: string | null = null;
      if (response) {
        if (response.data?.id) {
          ideaId = String(response.data.id);
        } else if (response.id) {
          ideaId = String(response.id);
        } else if (response.data?.idea_id) {
          ideaId = String(response.data.idea_id);
        } else if (response.idea_id) {
          ideaId = String(response.idea_id);
        }
      }

      if (ideaId) {
        // Redirect to the new idea page
        router.push(`/ideas/${ideaId}`);
      } else {
        // If no idea ID, redirect to marketplace
        console.warn("No idea ID in response, redirecting to marketplace");
        router.push("/marketplace");
      }
    } catch (err: unknown) {
      console.error("Error converting chat to idea:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to convert chat to idea. Please try again.";
      setError(errorMessage);
    } finally {
      setIsConvertingToIdea(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-transparent">
      <div className="border-b border-white/10 bg-transparent px-4 py-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="w-full">
          <div className="flex items-center justify-between">
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
            {chatId && user?.id && (
              <button
                onClick={handleConvertToIdea}
                disabled={isConvertingToIdea}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0e3a5f] to-[#14b8a6] px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#14b8a6]/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConvertingToIdea ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Converting...
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    Convert to Idea
                  </>
                )}
              </button>
            )}
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
                <div
                  className={`rounded-2xl px-4 py-3 shadow-sm ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-[#0e3a5f] to-[#14b8a6] text-white"
                      : "border border-slate-700 bg-slate-800 text-white"
                  }`}
                >
                  {message.content ? (
                    message.role === "assistant" ? (
                      // Render markdown for assistant messages
                      <div className="markdown-content text-sm leading-relaxed sm:text-base">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Style code blocks
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            code: ({ className, children, ...props }: any) => {
                              const inline =
                                !className || !className.includes("language-");
                              return inline ? (
                                <code
                                  className="px-1.5 py-0.5 rounded bg-slate-900/50 text-[#14b8a6] text-sm font-mono"
                                  {...props}
                                >
                                  {children}
                                </code>
                              ) : (
                                <code
                                  className="block p-3 rounded-lg bg-slate-900/50 text-sm font-mono overflow-x-auto"
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            },
                            // Style pre blocks
                            pre: ({ children }) => {
                              return (
                                <pre className="p-3 rounded-lg bg-slate-900/50 border border-slate-700 overflow-x-auto my-3">
                                  {children}
                                </pre>
                              );
                            },
                            // Style headings
                            h1: ({ children }) => (
                              <h1 className="text-xl font-bold mt-4 mb-2 text-white">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-lg font-semibold mt-3 mb-2 text-white">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-base font-semibold mt-2 mb-1 text-white">
                                {children}
                              </h3>
                            ),
                            // Style lists
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside my-2 space-y-1 text-white">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside my-2 space-y-1 text-white">
                                {children}
                              </ol>
                            ),
                            // Style links
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#14b8a6] hover:underline"
                              >
                                {children}
                              </a>
                            ),
                            // Style blockquotes
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-slate-600 pl-4 my-2 italic text-slate-300">
                                {children}
                              </blockquote>
                            ),
                            // Style paragraphs
                            p: ({ children }) => (
                              <p className="my-2 text-white leading-relaxed">
                                {children}
                              </p>
                            ),
                            // Style strong/bold
                            strong: ({ children }) => (
                              <strong className="font-semibold text-white">
                                {children}
                              </strong>
                            ),
                            // Style emphasis/italic
                            em: ({ children }) => (
                              <em className="italic text-white">{children}</em>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      // Plain text for user messages
                      <p className="whitespace-pre-wrap text-sm leading-relaxed sm:text-base">
                        {message.content}
                      </p>
                    )
                  ) : (
                    // Show typing indicator if message is empty (streaming)
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-[#14b8a6] [animation-delay:-0.3s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-[#14b8a6] [animation-delay:-0.15s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-[#14b8a6]" />
                    </div>
                  )}
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

          {isLoading &&
            // Only show separate loading indicator if we're not currently streaming into an assistant message
            !(
              messages.length > 0 &&
              messages[messages.length - 1].role === "assistant" &&
              messages[messages.length - 1].content.trim() === ""
            ) && (
              <div className="flex animate-fade-in justify-start">
                <div className="flex max-w-[70%] flex-col space-y-2">
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

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
