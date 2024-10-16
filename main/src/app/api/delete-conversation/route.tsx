import { NextRequest, NextResponse } from "next/server"; 
import dbConnect from "@/lib/db"; 
import Conversation from "@/models/Conversation"; 
import { RequestBody } from "@/datatypes/dataTypes";

/**
 * Handles POST requests to delete a specific conversation session for a user.
 *
 * Input Format (Request Body):
 * - user_id (string, required): The ID of the user.
 * - session_id (string, required): The ID of the session to delete.
 * 
 * Output Format (Response):
 * - Success Response (200):
 *   {
 *     "message": "Message history deleted successfully"
 *   }
 * - Error Responses:
 *   - 400: Missing required fields (user_id, session_id)
 *     {
 *       "error": "Missing user_id, session_id, or message"
 *     }
 *   - 404: No session found for the provided user_id and session_id
 *     {
 *       "error": "No session found for the provided user_id and session_id"
 *     }
 *   - 500: Internal server error
 *     {
 *       "error": "Internal Server Error"
 *     }
 *
 * @param req - The incoming Next.js request object containing the request body.
 * @returns JSON response with success or error message.
 */
export async function POST (req: NextRequest): Promise<Response> {
  
  // Check if the request method is POST, otherwise return a 405 (Method Not Allowed) error.
  if (req.method !== "POST") {
    return NextResponse.json(
      { error: "Only POST requests are allowed" },
      { status: 405 }
    );
  }

  try {
    // Parse request body to extract user_id and session_id
    const { user_id, session_id }: RequestBody = await req.json();

    // Return error if user_id or session_id is missing in the request
    if (!user_id || !session_id) {
      return NextResponse.json(
        { error: "Missing user_id, session_id, or message" },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Update the conversation document for the user by removing the session with the provided session_id
    const updatedDB = await Conversation.updateOne(
      { _id: user_id },
      { $unset: { [`sessions.${session_id}`]: "" } }
    );

    // If no session was found to delete, return a 404 (Not Found) error
    if (updatedDB && updatedDB.modifiedCount === 0) {
      return NextResponse.json(
        { error: "No session found for the provided user_id and session_id" },
        { status: 404 }
      );
    }

    // Return success message if session was deleted successfully
    return NextResponse.json(
      { message: "Message history deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    // Catch any errors during execution and return a 500 (Internal Server Error)
    console.error("Error deleting message history: ", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }  // Internal error code
    );
  }
}