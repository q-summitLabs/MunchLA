import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Conversation from "@/models/Conversation";
import { Message, Session, SessionsDataToReturn, UserDocument } from "@/src/app/api/types";

/**
 * Handles GET requests to fetch all conversation sessions for a specific user.
 *
 * Input Format (Query Parameters):
 * - user_id (string, required): The ID of the user whose conversation sessions are being requested.
 * 
 * Output Format (Response):
 * - Success Response (200):
 *   {
 *     "sessions": [
 *       {
 *         "session_id": "12345",
 *         "conversation_preview": "No AI messages yet" (or AI's response),
 *         "last_updated": "2024-10-15T08:30:00Z"
 *       },
 *       ...
 *     ]
 *   }
 * - Error Responses:
 *   - 400: Missing user_id query parameter
 *     {
 *       "error": "user_id query parameter is required"
 *     }
 *   - 404: No sessions found for this user
 *     {
 *       "error": "No sessions found for this user"
 *     }
 *   - 500: Internal server error
 *     {
 *       "error": "Internal Server Error"
 *     }
 *
 * @param req - The incoming Next.js request object containing query parameters.
 * @returns JSON response with session data or error message.
 */

export async function GET(req: NextRequest): Promise<Response> {

  // Ensure the request method is GET
  if (req.method !== "GET") {
    return NextResponse.json(
      { error: "Only POST requests are allowed" },
      { status: 405 }
    );
  }

  try {
    // Extract query parameters from the request URL
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    // Check if the user_id parameter is missing
    if (!user_id) {
      return NextResponse.json(
        { error: "user_id query parameter is required" },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Fetch the user document from the database
    const userDocument = (await Conversation.findOne({
      _id: user_id,
    }).lean()) as UserDocument;

    // Check if the user document or sessions are missing
    if (!userDocument || !userDocument.sessions) {
      return NextResponse.json(
        { error: "No sessions found for this user" },
        { status: 404 }
      );
    }

    const sessions: SessionsDataToReturn[] = [];

    // Loop through each session and extract session data
    Object.entries(userDocument.sessions).forEach(
      ([sessionId, sessionData]: [string, Session]) => {
        // Find the AI message in the session, if available
        const aiMessage = sessionData.messages?.find(
          (msg: Message) => msg.message_type === "ai_message"
        );

        // Prepare the conversation preview from the AI message
        let generalResponse = "No AI messages yet";
        if (aiMessage && typeof aiMessage.content !== "string") {
          generalResponse =
            aiMessage.content.general_response || "No general response";
        }

        // Add session data to the sessions array
        sessions.push({
          session_id: sessionId,
          conversation_preview: generalResponse,
          last_updated: sessionData.last_updated || new Date().toISOString(),
        });
      }
    );

    // Sort the sessions by the last updated timestamp, in descending order
    sessions.sort(
      (a: SessionsDataToReturn, b: SessionsDataToReturn) =>
        new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
    );

    // Return the sorted sessions data
    return NextResponse.json({ sessions }, { status: 200 });
  } catch (error) {
    // Log and handle any server errors
    console.error("Error handling message data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}