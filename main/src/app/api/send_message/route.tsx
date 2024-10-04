import { NextRequest, NextResponse } from "next/server";
import { RunnableConfig, RunnableWithMessageHistory } from "@langchain/core/runnables";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import Conversation from "@/models/Conversation";
import { RequestBody, AIMessageContent, Message } from "@/datatypes/dataTypes";
import { chain } from "@/utils/langchainUtils";
import { upsertConversationMessage } from "@/utils/dbUtils";

export async function POST(req: NextRequest): Promise<Response> {
  // POST request check
  if (req.method !== "POST") {
    return NextResponse.json(
      { error: "Only POST requests are allowed" },
      { status: 405 }
    );
  }

  try {
    const { user_id, session_id, message }: RequestBody = await req.json();

    if (!user_id || !session_id || !message) {
      return NextResponse.json(
        { error: "Missing user_id, session_id, or message" },
        { status: 400 }
      );
    }

    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({ modelName: "text-embedding-3-small" }),
      { pineconeIndex }
    );
    const results = await vectorStore.similaritySearch(message, 8);

    // Insert formatted restaurant data into MongoDB
    const combinedContent = results
      .map((result) => JSON.stringify(result, null, 2))
      .join("\n\n");

    const newMessage: Message = {
      message_type: "restaurant_data",
      content: combinedContent,
    };

    // Insert the combined message into MongoDB
    await upsertConversationMessage(user_id, session_id, newMessage);

    // Retrieve the updated conversation history from MongoDB
    const conversation = await Conversation.findOne(
      { _id: user_id },
      { [`sessions.${session_id}.messages`]: 1, _id: 0 }
    ).exec();

    const dbMessages: Message[] = conversation
      ? conversation.sessions.get(session_id)?.messages || []
      : [];

    // Create a new message history instance for the current session
    const messageHistory = new ChatMessageHistory();

    for (const dbMessage of dbMessages) {
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

    const withHistory = new RunnableWithMessageHistory({
      runnable: chain,
      getMessageHistory: () => messageHistory,
      inputMessagesKey: "input",
      historyMessagesKey: "history",
    });

    const config: RunnableConfig = { configurable: { sessionId: session_id } };
    const aiResponse = (await withHistory.invoke(
      { inputText: message, history: messageHistory },
      config
    )) as AIMessageContent;

    const humanMessage: Message = {
      message_type: "human_message_no_prompt",
      content: message,
    };
    await upsertConversationMessage(user_id, session_id, humanMessage);

    const aiMessage: Message = {
      message_type: "ai_message",
      content: aiResponse,
    };
    await upsertConversationMessage(user_id, session_id, aiMessage);

    return NextResponse.json({ aiResponse }, { status: 200 });
  } catch (error) {
    console.error("Error handling message data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}