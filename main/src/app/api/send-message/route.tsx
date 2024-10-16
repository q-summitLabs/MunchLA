import { NextRequest, NextResponse } from "next/server";
import {
  RunnableConfig,
  RunnableWithMessageHistory,
} from "@langchain/core/runnables";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import Conversation from "@/models/Conversation";
import { RequestBody, AIMessageContent, Message } from "@/datatypes/dataTypes";
import { chain } from "@/utils/langchainUtils";
import { upsertConversationMessage } from "@/utils/dbUtils";

/**
 * Handles POST requests to send a user's message, retrieve relevant restaurant data from Pinecone, 
 * and generate an AI response based on both the user's input and the conversation history.
 *
 * Input Format (Request Body):
 * - user_id (string, required): The unique identifier for the user.
 * - session_id (string, required): The session ID for the current conversation.
 * - message (string, required): The message content sent by the user.
 *
 * Output Format (Response):
 * - Success Response (200):
 *   {
 *     "combinedResponse": {
 *         "message_type": "ai_message/human_message_no_prompt",
 *         "content": {
 *           "general_response": "AI's general response",
 *           "restaurants": [ Array of restaurant objects ]
 *         }
 *     }
 *   }
 * - Error Responses:
 *   - 400: Missing user_id, session_id, or message
 *     {
 *       "error": "Missing user_id, session_id, or message"
 *     }
 *   - 405: Invalid request method (not POST)
 *     {
 *       "error": "Only POST requests are allowed"
 *     }
 *   - 500: Internal server error
 *     {
 *       "error": "Internal Server Error"
 *     }
 * 
 * @param req - The incoming Next.js request object containing the user's message, user_id, and session_id.
 * @returns JSON response with AI-generated content and restaurant details or error messages.
 */
export async function POST(req: NextRequest): Promise<Response> {
  // Ensure that the request is a POST request, return an error if not.
  if (req.method !== "POST") {
    return NextResponse.json(
      { error: "Only POST requests are allowed" },
      { status: 405 }
    );
  }

  try {
    // Parse the request body to get user_id, session_id, and message.
    const { user_id, session_id, message }: RequestBody = await req.json();

    // Validate if user_id, session_id, and message are provided in the request.
    if (!user_id || !session_id || !message) {
      return NextResponse.json(
        { error: "Missing user_id, session_id, or message" },
        { status: 400 }
      );
    }

    // Initialize Pinecone index for vector similarity search.
    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

    // Create a Pinecone store using OpenAI embeddings.
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({ modelName: "text-embedding-3-small" }),
      { pineconeIndex }
    );

    // Perform similarity search with the message to get restaurant data.
    const results = await vectorStore.similaritySearch(message, 3);

    // Format the restaurant data as a string for MongoDB.
    const combinedContent = results
      .map((result) => JSON.stringify(result, null, 2))
      .join("\n\n");

    // Extract metadata from the search results for further processing.
    const metadata = results.map((result) => ({
      metadata: result.metadata,
    }));

    // Create a new message object for storing restaurant data.
    const newMessage: Message = {
      message_type: "restaurant_data",
      content: combinedContent,
    };

    // Insert the restaurant data into MongoDB.
    await upsertConversationMessage(user_id, session_id, newMessage);

    // Retrieve the conversation history from MongoDB.
    const conversation = await Conversation.findOne(
      { _id: user_id },
      { [`sessions.${session_id}.messages`]: 1, _id: 0 }
    ).exec();

    // Extract messages from the conversation history, if available.
    const dbMessages: Message[] = conversation
      ? conversation.sessions.get(session_id)?.messages || []
      : [];

    // Initialize a message history object for LangChain.
    const messageHistory = new ChatMessageHistory();

    // Limit the conversation history to the last 5 messages.
    const recentMessages = dbMessages.slice(-5);

    // Add messages to LangChain's message history for further processing.
    for (const dbMessage of recentMessages) {
      if (dbMessage.message_type === "human_message_no_prompt") {
        await messageHistory.addMessage(
          new HumanMessage(dbMessage.content as string)
        );
      } else if (
        dbMessage.message_type === "ai_message" ||
        dbMessage.message_type === "restaurant_data"
      ) {
        await messageHistory.addMessage(
          new AIMessage(JSON.stringify(dbMessage.content))
        );
      }
    }

    // Format restaurant information for inclusion in the AI response.
    const restaurantInfo = results
      .map(result => `Restaurant Name: ${result.metadata.name}, Place ID: ${result.metadata.place_id}, Summary: ${result.metadata.summary}`)
      .join("\n");

    // Create a new RunnableWithMessageHistory instance for processing the message.
    const withHistory = new RunnableWithMessageHistory({
      runnable: chain,
      getMessageHistory: () => messageHistory,
      inputMessagesKey: "input",
      historyMessagesKey: "history",
    });

    // Configure the runnable with session-specific settings.
    const config: RunnableConfig = { configurable: { sessionId: session_id } };

    // Invoke the LangChain runnable to generate an AI response.
    const aiResponse = (await withHistory.invoke(
      { inputText: message, history: messageHistory, restaurantInfo: restaurantInfo },
      config
    )) as AIMessageContent;

    // Combine the general AI response with restaurant details.
    const combinedResponse = {
      general_response: aiResponse.general_response,
      restaurants: aiResponse.restaurants.map((restaurant) => {
        const matchingMetadata = metadata.find(
          (item) => item.metadata.place_id === restaurant.place_id
        );
        return matchingMetadata
          ? { ...restaurant, ...matchingMetadata.metadata }
          : restaurant;
      }),
    };

    // Create and insert the user's message into MongoDB.
    const humanMessage: Message = {
      message_type: "human_message_no_prompt",
      content: message,
    };
    await upsertConversationMessage(user_id, session_id, humanMessage);

    // Create and insert the AI's response into MongoDB.
    const aiMessage: Message = {
      message_type: "ai_message",
      content: combinedResponse,
    };
    await upsertConversationMessage(user_id, session_id, aiMessage);

    // Return the combined AI response to the client.
    return NextResponse.json({ combinedResponse }, { status: 200 });
  } catch (error) {
    // Handle any errors that occur during message processing.
    console.error("Error handling message data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}