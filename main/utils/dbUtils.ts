import dbConnect from "@/lib/db";
import Conversation from "@/models/Conversation";
// import { Message } from "@/datatypes/dataTypes";
import { Message } from "./types";

/**
 * Upserts a message into the conversation for the given user and session.
 * @param {string} user_id - The ID of the user.
 * @param {string} session_id - The ID of the session.
 * @param {Message} newMessage - The new message to insert.
 */
export async function upsertConversationMessage(
  user_id: string,
  session_id: string,
  newMessage: Message
): Promise<void> {
  const currentTime = new Date().toISOString(); // Get the current time for last_updated field

  try {
    // Connect to MongoDB
    await dbConnect();

    // Update or create the user's conversation document, and add the new message
    await Conversation.updateOne(
      { _id: user_id }, // Filter by user ID
      {
        $set: {
          [`sessions.${session_id}.last_updated`]: currentTime, // Update the last_updated timestamp
        },
        $push: { [`sessions.${session_id}.messages`]: newMessage }, // Add the new message to the session
      },
      { upsert: true } // Create a new document if it doesn't exist
    );

    console.log("Message inserted or updated successfully");
  } catch (error) {
    console.error("Error inserting or updating message:", error);
    throw new Error("Failed to upsert conversation message");
  }
}
