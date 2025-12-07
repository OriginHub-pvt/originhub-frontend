"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import {
  IconMessageCircle,
  IconBulb,
  IconUser,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useApiClient } from "@/lib/api-client";

const navLinks = [
  {
    label: "Marketplace",
    href: "/marketplace",
    icon: <IconBulb className="h-5 w-5 shrink-0 text-white" />,
  },
  {
    label: "Chat",
    href: "/chat",
    icon: <IconMessageCircle className="h-5 w-5 shrink-0 text-white" />,
  },
];

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center space-x-2 text-neutral-900 dark:text-neutral-50"
    >
      <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-[#0e3a5f] to-[#14b8a6]" />
      <span className="text-sm font-semibold">OriginHub</span>
    </Link>
  );
}

function LogoIcon() {
  return (
    <Link href="/" className="flex items-center">
      <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-[#0e3a5f] to-[#14b8a6]" />
    </Link>
  );
}

interface ChatHistoryItem {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  last_message_at: string;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { isSignedIn, user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const apiClient = useApiClient();
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const isChatPage = pathname === "/chat";

  // Extract bio from metadata with proper type checking
  const userBio = user?.publicMetadata?.bio;
  const bio = typeof userBio === "string" ? userBio : null;

  // Fetch chat history when on chat page and user is signed in
  useEffect(() => {
    if (!isChatPage || !isSignedIn || !user?.id) {
      setChatHistory([]);
      return;
    }

    let isMounted = true;

    const fetchChats = async () => {
      setIsLoadingChats(true);
      try {
        const response = await apiClient.getChatHistory();
        if (!isMounted) return;

        // Handle response structure: { success: true, data: { chats: [...] }, message: "..." }
        let chats: ChatHistoryItem[] = [];
        if (response?.data?.chats && Array.isArray(response.data.chats)) {
          chats = response.data.chats;
        } else if (Array.isArray(response?.data)) {
          chats = response.data;
        } else if (Array.isArray(response)) {
          chats = response;
        } else if (response?.chats) {
          chats = response.chats;
        }
        setChatHistory(chats);
      } catch (error: unknown) {
        // Silently handle 404 errors (endpoint might not be implemented yet)
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 404) {
            // Endpoint not implemented yet - silently fail
            console.log("Chat history endpoint not available yet");
            if (isMounted) {
              setChatHistory([]);
            }
            return;
          }
        }
        console.error("Error fetching chat history:", error);
        if (isMounted) {
          setChatHistory([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingChats(false);
        }
      }
    };

    fetchChats();

    return () => {
      isMounted = false;
    };
  }, [isChatPage, isSignedIn, user?.id, apiClient]);

  const handleNewChat = () => {
    // Navigate to chat page - it will automatically get/create empty chat on load
    router.push("/chat?new=true");
    // Scroll to top
    window.scrollTo(0, 0);
  };

  const handleChatClick = (chatId: string) => {
    // Navigate to chat page with the chat ID
    router.push(`/chat?chatId=${chatId}`);
    // Scroll to top
    window.scrollTo(0, 0);
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting chat when clicking delete

    // Confirmation dialog
    if (
      !window.confirm(
        "Are you sure you want to delete this chat? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingChatId(chatId);
    try {
      await apiClient.deleteChat(chatId);

      // Remove from chat list
      setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId));

      // If deleted chat is currently active, navigate to new chat
      const currentChatId = new URLSearchParams(window.location.search).get(
        "chatId"
      );
      if (currentChatId === chatId) {
        router.push("/chat?new=true");
      }

      // Refresh chat history to ensure consistency
      if (isChatPage && isSignedIn && user?.id) {
        const response = await apiClient.getChatHistory();
        let chats: ChatHistoryItem[] = [];
        if (response?.data?.chats && Array.isArray(response.data.chats)) {
          chats = response.data.chats;
        } else if (Array.isArray(response?.data)) {
          chats = response.data;
        } else if (Array.isArray(response)) {
          chats = response;
        } else if (response?.chats) {
          chats = response.chats;
        }
        setChatHistory(chats);
      }
    } catch (error: unknown) {
      console.error("Error deleting chat:", error);
      alert("Failed to delete chat. Please try again.");
    } finally {
      setDeletingChatId(null);
    }
  };

  return (
    <div className="relative h-screen overflow-hidden bg-neutral-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <ShootingStars />
        <StarsBackground />
      </div>
      <div className="relative z-10 flex h-screen">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10 rounded-e-3xl bg-slate-900/90 px-5 py-6 text-slate-100 shadow-2xl">
            <div className="flex flex-1 flex-col overflow-hidden">
              {open ? <Logo /> : <LogoIcon />}
              <div className="mt-8 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <SidebarLink key={link.label} link={link} />
                ))}
                {isSignedIn && (
                  <SidebarLink
                    link={{
                      label: "Profile",
                      href: "/profile",
                      icon: (
                        <IconUser className="h-5 w-5 shrink-0 text-white" />
                      ),
                    }}
                  />
                )}
              </div>

              {/* Chat History Section - Only show on chat page */}
              {isChatPage && isSignedIn && (
                <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                      {open ? "Chats" : ""}
                    </span>
                    {open && (
                      <button
                        onClick={handleNewChat}
                        className="flex items-center gap-1 rounded-lg bg-[#14b8a6] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#0d9488] transition-colors"
                        title="New Chat"
                      >
                        <IconPlus className="h-4 w-4" />
                        New
                      </button>
                    )}
                    {!open && (
                      <button
                        onClick={handleNewChat}
                        className="flex items-center justify-center rounded-lg bg-[#14b8a6] p-1.5 text-white hover:bg-[#0d9488] transition-colors"
                        title="New Chat"
                      >
                        <IconPlus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="mt-2 flex flex-col gap-1 overflow-y-auto max-h-[400px]">
                    {isLoadingChats ? (
                      <div className="px-2 py-4 text-center">
                        <div className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[#14b8a6]" />
                      </div>
                    ) : chatHistory.length === 0 ? (
                      <div className="px-2 py-4 text-center text-xs text-white/40">
                        {open ? "No chats yet" : ""}
                      </div>
                    ) : (
                      chatHistory.map((chat) => {
                        const displayTitle = chat.title || "New Chat";
                        const truncatedTitle =
                          displayTitle.length > 30
                            ? displayTitle.substring(0, 30) + "..."
                            : displayTitle;
                        const isDeleting = deletingChatId === chat.id;

                        return (
                          <div
                            key={chat.id}
                            className="group flex items-center gap-2 rounded-lg hover:bg-white/5 transition-colors"
                          >
                            <button
                              onClick={() => handleChatClick(chat.id)}
                              className="flex flex-1 items-center gap-2 px-2 py-2 text-left text-sm text-white/70 hover:text-white transition-colors"
                              title={displayTitle}
                              disabled={isDeleting}
                            >
                              <IconMessageCircle className="h-4 w-4 shrink-0 text-white/50 group-hover:text-[#14b8a6] transition-colors" />
                              {open && (
                                <span className="truncate flex-1">
                                  {truncatedTitle}
                                </span>
                              )}
                            </button>
                            {open && (
                              <button
                                onClick={(e) => handleDeleteChat(chat.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-all"
                                title="Delete chat"
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
                                ) : (
                                  <IconTrash className="h-3.5 w-3.5" />
                                )}
                              </button>
                            )}
                            {!open && (
                              <button
                                onClick={(e) => handleDeleteChat(chat.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-all"
                                title="Delete chat"
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
                                ) : (
                                  <IconTrash className="h-3 w-3" />
                                )}
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center gap-4">
              {isSignedIn ? (
                <>
                  <div className="flex items-center gap-3">
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "h-8 w-8",
                        },
                      }}
                    />
                    {open && (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">
                          {user?.firstName ||
                            user?.emailAddresses[0]?.emailAddress}
                        </span>
                        <span className="text-xs text-slate-400">
                          {user?.emailAddresses[0]?.emailAddress}
                        </span>
                        {bio && (
                          <span className="mt-1 text-xs text-slate-500 line-clamp-2">
                            {bio.substring(0, 50)}
                            {bio.length > 50 && "..."}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <SignInButton mode="modal">
                  <button className="w-full rounded-lg bg-gradient-to-r from-[#0e3a5f] to-[#14b8a6] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity">
                    Sign In
                  </button>
                </SignInButton>
              )}
            </div>
          </SidebarBody>
        </Sidebar>
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
