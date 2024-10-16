import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Conversation from "@/models/Conversation";
import { UserDocument } from "@/datatypes/dataTypes";

/**
 * Handles GET requests to fetch the next available session ID for a user.
 *
 * Input Format (Query Parameters):
 * - user_id (string, required): The ID of the user for whom the next session ID is being requested.
 * 
 * Output Format (Response):
 * - Success Response (200):
 *   {
 *     "next_session_id": "1" (or another ID if the user has sessions)
 *   }
 * - Error Responses:
 *   - 400: Missing user_id
 *     {
 *       "error": "Missing user_id"
 *     }
 *   - 500: Internal server error
 *     {
 *       "error": "Internal Server Error"
 *     }
 *
 * @param req - The incoming Next.js request object containing query parameters.
 * @returns JSON response with the next session ID or error message.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  
  // Ensure the request method is GET, otherwise return a 405 (Method Not Allowed) error.
  if (req.method !== "GET") {
    return NextResponse.json(
      { error: "Only GET requests are allowed" },
      { status: 405 }
    );
  }

  try {
    // Extract query parameters, specifically user_id
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    // If user_id is missing in the query parameters, return a 400 (Bad Request) error
    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    // Connect to the database
    await dbConnect();

    // Find the user document by user_id
    const userDocument = (await Conversation.findOne({
      _id: user_id,
    }).lean()) as UserDocument;

    // If no sessions exist for the user, return next_session_id as "1"
    if (
      !userDocument ||
      !userDocument.sessions ||
      Object.keys(userDocument.sessions).length === 0
    ) {
      return NextResponse.json({ next_session_id: 1 }, { status: 200 });
    }

    // Get the list of existing session IDs
    const sessionIds = Object.keys(userDocument.sessions);

    // Determine the next available session ID by finding the smallest unused session ID
    let nextSessionId = 1;
    while (sessionIds.includes(nextSessionId.toString())) {
      nextSessionId++;
    }

    // Return the next available session ID
    return NextResponse.json(
      { next_session_id: String(nextSessionId) },
      { status: 200 }
    );
  } catch (error) {
    // Catch and handle any errors, returning a 500 (Internal Server Error)
    console.error("Error fetching next session ID:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}