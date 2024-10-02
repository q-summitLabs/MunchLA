import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import middleware from "../../middleware";


interface Restaurant {
  name: string;
  address: string;
  rating: number;
  price: string;
  summary: string;
}

interface AIMessageContent {
  general_response: string;
  restaurants: Restaurant[];
}

interface Message {
  message_type: string;
  content: string | AIMessageContent;
}

interface Session {
  last_updated: string;
  messages: Message[];
}

interface Sessions {
  [sessionId: string]: Session;
}

interface SessionsDataToReturn {
  session_id: string;
  conversation_preview: string;
  last_updated: string;
}

interface UserDocument {
  _id: string;
  sessions: Sessions; 
}

export async function GET(req: NextRequest): Promise<Response> {
  const success = await middleware(req);
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again after a cooldown." },
      { status: 429}
    )
  }
  try {
    // Get the URL and search parameters
    const { searchParams } = new URL(req.url);

    // Retrieve the user_id from the query parameters
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id query parameter is required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await dbConnect();

    // Retrieve the user document to get the current sessions using `.lean()`
    const userDocument = await Conversation.findOne({ _id: user_id }).lean() as UserDocument;

    if (!userDocument || !userDocument.sessions) {
      return NextResponse.json(
        { error: "No sessions found for this user" },
        { status: 404 }
      );
    }


    // Process each session to return the session_id and the general_response as the conversation_preview
    const sessions: SessionsDataToReturn[] = [];

    Object.entries(userDocument.sessions).forEach(([sessionId, sessionData]: [string, Session]) => {
      // Find the first AI message
      const aiMessage = sessionData.messages?.find(
        (msg: Message) => msg.message_type === "ai_message"
      );

      // Check if the content is AIMessageContent and extract the general_response
      let generalResponse = "No AI messages yet";
      if (aiMessage && typeof aiMessage.content !== 'string') {
        generalResponse = aiMessage.content.general_response || "No general response";
      }

      // Push the session details into the sessions array
      sessions.push({
        session_id: sessionId,
        conversation_preview: generalResponse,
        last_updated: sessionData.last_updated || new Date().toISOString(),
      });
    });

    // Sort the sessions by last_updated, newest first
    sessions.sort((a: SessionsDataToReturn, b: SessionsDataToReturn) =>
      new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
    );

    // Return the list of sessions with their conversation previews
    return NextResponse.json({ sessions }, { status: 200 });
  } catch (error) {
    console.error("Error handling message data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
