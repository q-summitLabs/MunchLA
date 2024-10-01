import { useState, useEffect } from "react";
import {
    fetchUserSessions,
    fetchNextAvailableChatSession,
    fetchConversation,
} from "@/api_callers/getters";
import { sendMessage } from "@/api_callers/setters";
import { Conversation, Session, MessageData, Restaurant, Message, SessionData } from "../types";

export function useChatState(userId: string | null | undefined) {
    const [prompt, setPrompt] = useState("");
    const [isFirstInput, setIsFirstInput] = useState(true);
    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [userSessions, setUserSessions] = useState<Session[]>([]);
    const [currentChatSession, setCurrentChatSession] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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
            console.log(`data: ${JSON.stringify(data)}`);
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
        console.log(sessionId, userId);
    if (!sessionId || !userId) return;
    setCurrentChatSession(sessionId);
    try {
        const conversation = (await fetchConversation(
        userId,
        sessionId
        )) as MessageData[];
        console.log(`convo: ${JSON.stringify(conversation)}`);
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
        setUserSessions((prevSessions) =>
            prevSessions.filter((session) => session.id !== sessionId)
        );

        if (currentChatSession === sessionId) {
            setCurrentConversation(null);
            setCurrentChatSession(null);
            setIsFirstInput(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!prompt.trim() || !userId || !currentChatSession) return;

        setCurrentConversation((prevConversation) => ({
            id: prevConversation?.id || currentChatSession,
            title: prevConversation?.title || "New Conversation",
            messages: [
                ...(prevConversation?.messages || []),
                { text: prompt, isBot: false },
            ],
        }));

        setIsLoading(true);
        setPrompt("");
        setIsFirstInput(false);

        try {
            const response = await sendMessage(userId, currentChatSession, prompt);
            const { general_response, restaurants } = response["aiResponse"];

            setCurrentConversation((prevConversation) => ({
                id: prevConversation?.id || currentChatSession,
                title: prevConversation?.title || "New Conversation",
                messages: [
                    ...(prevConversation?.messages || []),
                    { text: general_response, isBot: true, restaurants: restaurants },
                ],
            }));
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const startNewConversation = async () => {
        setCurrentConversation(null);
        setIsFirstInput(true);

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
        handleSubmit,
        startNewConversation,
        toggleSidebar,
        handleSessionClick,
        handleRemoveSession,
    };
}