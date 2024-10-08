import { useState, useEffect, useCallback } from "react";
import {
    fetchUserSessions,
    fetchNextAvailableChatSession,
    fetchConversation,
} from "@/middlewareHelpers/getters";
import { sendMessage, deleteConversation } from "@/middlewareHelpers/setters";
import { Conversation, Session, MessageData, Restaurant, Message, SessionData } from "../types";

export function useChatState(userId: string | null | undefined) {
    const [prompt, setPrompt] = useState("");
    const [isFirstInput, setIsFirstInput] = useState(true);
    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [userSessions, setUserSessions] = useState<Session[]>([]);
    const [currentChatSession, setCurrentChatSession] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

    useEffect(() => {
        const fetchChatSession = async (userId: string) => {
            try {
                const session = await fetchNextAvailableChatSession(userId);
                setCurrentChatSession(session);
            } catch (error) {
                console.error("Failed to fetch chat session", error);
            }
        };

        if (userId) {
            fetchChatSession(userId);
        }
    }, [userId]);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                if (!userId) {
                    return;
                }

                const response = await fetchUserSessions(userId);

                if (!response) {
                    throw new Error(`Error: ${response.status}`);
                }

                const data: SessionData[] = response["sessions"];
                let sessions: Session[] = [];

                sessions = data.map((item) => ({
                    id: item.session_id,
                    conversation_preview: item.conversation_preview,
                    last_updated: item.last_updated,
                }));
                setUserSessions(sessions);
            } catch (error) {
                console.error("Failed to fetch sessions", error);
            }
        };

        fetchSessions();
    }, [userId]);

    useEffect(() => {
        if (currentConversation) {
            setIsFirstInput(false);
        }
    }, [currentConversation]);

    const handleSessionClick = async (sessionId: string) => {
        if (!sessionId || !userId) return;
        setCurrentChatSession(sessionId);
        try {
            const conversation = (await fetchConversation(
                userId,
                sessionId
            )) as MessageData[];
            const messages: Message[] = [];

            conversation.forEach((message) => {
                let text = "";
                let isBot = false;
                let restaurants: Restaurant[] | undefined;

                if (message.message_type === "ai_message") {
                    if (typeof message.content === "object") {
                        text = message.content.general_response;
                        isBot = true;
                        restaurants = message.content.restaurants;
                    }
                } else {
                    if (typeof message.content === "string") {
                        text = message.content;
                        isBot = false;
                        restaurants = [];
                    }
                }
                messages.push({
                    text,
                    isBot,
                    restaurants,
                });
            });

            const conversationData: Conversation = {
                id: sessionId,
                title: `Chat Session ${sessionId}`,
                messages,
            };

            setCurrentConversation(conversationData);
        } catch (error) {
            console.error("Error fetching conversation:", error);
        }
    };

    const handleRemoveSession = async (sessionId: string) => {
        if (!userId) {
            console.error("Invalid user ID");
            return;
        }

        try {
            const status = await deleteConversation(userId, sessionId);

            if (!status) {
                console.error("Failed to delete conversation");
                return;
            }

            setUserSessions((prevSessions) =>
                prevSessions.filter((session) => session.id !== sessionId)
            );

            if (currentChatSession === sessionId) {
                const newSession = await fetchNextAvailableChatSession(userId);
                setCurrentChatSession(newSession);
                setCurrentConversation(null);
                setIsFirstInput(true);
            }
        } catch (error) {
            console.error("Error occurred while removing session:", error);
        }
    };

    const appendMessage = useCallback((message: Message) => {
        setCurrentConversation((prevConversation) => {
            if (!prevConversation) {
                return {
                    id: currentChatSession || '',
                    title: "New Conversation",
                    messages: [message],
                };
            }
            return {
                ...prevConversation,
                messages: [...prevConversation.messages, message],
            };
        });
    }, [currentChatSession]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!prompt.trim() || !userId || !currentChatSession) return;

        const userMessage: Message = { text: prompt, isBot: false };
        
        appendMessage(userMessage);

        setIsLoading(true);
        setPrompt("");
        setIsFirstInput(false);

        try {
            const response = await sendMessage(userId, currentChatSession, prompt);
            const { general_response, restaurants } = response["combinedResponse"];

            if (!currentConversation) {
                if (!userId) {
                    return;
                }

                const response = await fetchUserSessions(userId);

                if (!response) {
                    throw new Error(`Error: ${response.status}`);
                }

                const data: SessionData[] = response["sessions"];
                let sessions: Session[] = [];

                sessions = data.map((item) => ({
                    id: item.session_id,
                    conversation_preview: item.conversation_preview,
                    last_updated: item.last_updated,
                }));
                setUserSessions(sessions);
            }

            const botMessage: Message = { text: general_response, isBot: true, restaurants };
            
            // Append the bot's response
            appendMessage(botMessage);
        } catch (error) {
            console.error("Error sending message:", error);
            // Optionally, you can add an error message to the conversation here
        } finally {
            setIsLoading(false);
        }
    };

    const startNewConversation = async () => {
        setCurrentConversation(null);
        setIsFirstInput(true);
        setSelectedSessionId(null);

        if (!userId) {
            console.error("Invalid user ID");
            return;
        }

        try {
            const response = await fetchNextAvailableChatSession(userId);
            if (!response) {
                throw new Error(`Error fetching next session: ${response.status}`);
            }
            setCurrentChatSession(response);
        } catch (error) {
            console.error("Failed to fetch next chat session", error);
        }
    };

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    return {
        prompt,
        setPrompt,
        isFirstInput,
        currentConversation,
        isSidebarExpanded,
        userSessions,
        currentChatSession,
        isLoading,
        selectedSessionId,
        setSelectedSessionId,
        handleSubmit,
        startNewConversation,
        toggleSidebar,
        handleSessionClick,
        handleRemoveSession,
    };
}