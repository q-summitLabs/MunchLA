import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Conversation from "@/models/Conversation";
import { Message, UserDocument } from "@/datatypes/dataTypes";

export async function GET(req: NextRequest): Promise<Response> {
  // GET request check
  if (req.method !== "GET") {
    return NextResponse.json(
      { error: "Only POST requests are allowed" },
      { status: 405 }
    );
  }

  try {
    // Parse query parameters from the URL
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    const session_id = searchParams.get("session_id");

    // Validate that user_id and session_id are provided
    if (!user_id || !session_id) {
      return NextResponse.json(
        { error: "Missing user_id or session_id" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await dbConnect();

    // Retrieve the conversation history using Mongoose and use `.lean()` to return a plain JS object
    const userDocument = (await Conversation.findOne(
      { _id: user_id },
      { [`sessions.${session_id}.messages`]: 1 }
    ).lean()) as UserDocument;

    if (
      !userDocument ||
      !userDocument.sessions ||
      !userDocument.sessions[session_id] // Change to array/object syntax with `.lean()`
    ) {
      return NextResponse.json(
        { error: "No conversation history found" },
        { status: 404 }
      );
    }

    // Extract messages from the session
    const messages: Message[] = userDocument.sessions[session_id].messages;

    // Filter and transform messages based on the type
    const filteredMessages: Message[] = messages
      .filter(
        (message: Message) =>
          message.message_type === "human_message_no_prompt" ||
          message.message_type === "ai_message"
      )
      .map((message: Message) => {
        if (message.message_type === "human_message_no_prompt") {
          return {
            message_type: "human_message_no_prompt",
            content: message.content,
          };
        } else if (message.message_type === "ai_message") {
          if (message.content && typeof message.content === "object") {
            return {
              message_type: "ai_message",
              content: {
                general_response: message.content.general_response || "",
                restaurants: message.content.restaurants || [],
              },
            };
          }
        }
        return undefined; // Ensure we always return a value
      })
      .filter((message): message is Message => message !== undefined); // Filter out any undefined values

    // Return the filtered conversation
    return NextResponse.json(
      { conversation: filteredMessages },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching conversation data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}