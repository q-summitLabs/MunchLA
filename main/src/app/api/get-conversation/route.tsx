import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Conversation from "@/models/Conversation";
import { Message, UserDocument } from "@/src/app/api/types";

/**
 * Handles GET requests to fetch conversation messages for a specific user and session.
 *
 * Input Format (Query Parameters):
 * - user_id (string, required): The ID of the user whose conversation is being requested.
 * - session_id (string, required): The ID of the session for which messages are being fetched.
 * 
 * Output Format (Response):
 * - Success Response (200):
 *   {
 *     "conversation": [
 *       {
 *         "message_type": "human_message_no_prompt",
 *         "content": "User message content"
 *       },
 *       {
 *         "message_type": "ai_message",
 *         "content": {
 *           "general_response": "AI's general response",
 *           "restaurants": [ Array of restaurant objects ]
 *         }
 *       }
 *     ]
 *   }
 * - Error Responses:
 *   - 400: Missing user_id or session_id
 *     {
 *       "error": "Missing user_id or session_id"
 *     }
 *   - 404: No conversation history found
 *     {
 *       "error": "No conversation history found"
 *     }
 *   - 500: Internal server error
 *     {
 *       "error": "Internal Server Error"
 *     }
 *
 * @param req - The incoming Next.js request object containing query parameters.
 * @returns JSON response with the conversation messages or error message.
 */

export async function GET(req: NextRequest): Promise<Response> {
  
  // Ensure the request method is GET
  if (req.method !== "GET") {
    return NextResponse.json(
      { error: "Only GET requests are allowed" },
      { status: 405 }
    );
  }

  try {
    // Extract query parameters from the request URL
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    const session_id = searchParams.get("session_id");

    // Check if required parameters are missing
    if (!user_id || !session_id) {
      return NextResponse.json(
        { error: "Missing user_id or session_id" },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Fetch the conversation messages for the given user and session
    const userDocument = (await Conversation.findOne(
      { _id: user_id },
      { [`sessions.${session_id}.messages`]: 1 }
    ).lean()) as UserDocument;

    // Check if the conversation or session does not exist
    if (
      !userDocument ||
      !userDocument.sessions ||
      !userDocument.sessions[session_id]
    ) {
      return NextResponse.json(
        { error: "No conversation history found" },
        { status: 404 }
      );
    }

    // Extract messages from the session
    const messages: Message[] = userDocument.sessions[session_id].messages;

    // Filter and transform messages to only include human and AI messages
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
        return undefined;
      })
      .filter((message): message is Message => message !== undefined);

    // Return the filtered conversation as JSON
    return NextResponse.json(
      { conversation: filteredMessages },
      { status: 200 }
    );
  } catch (error) {
    // Log and handle any server errors
    console.error("Error fetching conversation data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}