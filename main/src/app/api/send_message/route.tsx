import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import {
  RunnableConfig,
  RunnableWithMessageHistory,
} from "@langchain/core/runnables";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import dbConnect from "@/lib/db";
import Conversation from "@/models/Conversation";
import middleware from "../../middleware";
import { RequestBody, AIMessageContent, Message } from "@/datatypes/dataTypes";

// Define the Zod schema for the structured output
const restaurantSchema = z.object({
  general_response: z
    .string()
    .describe("A general response from the bot to the user"),
  restaurants: z
    .array(
      z.object({
        name: z.string().describe("The name of the restaurant"),
        address: z.string().describe("The address of the restaurant"),
        rating: z.number().describe("The rating of the restaurant"),
        price: z.string().describe("The price range of the restaurant"),
        summary: z.string().describe("A summary of reviews for the restaurant"),
      })
    )
    .describe("An array of restaurant objects with detailed information"),
});

// Set up your model and prompt
const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4o-mini",
});

// Bind the model with function calling
const functionCallingModel = model.bind({
  functions: [
    {
      name: "output_formatter",
      description: "Format output to structured JSON",
      parameters: zodToJsonSchema(restaurantSchema),
    },
  ],
  function_call: { name: "output_formatter" },
});

const prompt = new ChatPromptTemplate({
  promptMessages: [
    SystemMessagePromptTemplate.fromTemplate(
      `You are a friendly and knowledgeable guide specializing in restaurants in Los Angeles. Your main role is to assist users 
      by answering questions about restaurants and food in the area. Use the restaurant information from the conversation history 
      as your primary source for responses. 

      If the history doesn't provide relevant information, feel free to engage in normal conversation and answer questions 
      related to food and dining in Los Angeles using your expertise. Always aim to make the conversation pleasant and informative. 
      Avoid discussing topics unrelated to food and restaurants, but remember to maintain a friendly and engaging demeanor as a 
      conversational partner.`
    ),
    new MessagesPlaceholder("history"),
    HumanMessagePromptTemplate.fromTemplate("{inputText}"),
  ],
  inputVariables: ["inputText", "history"],
});

const outputParser = new JsonOutputFunctionsParser();
const chain = prompt.pipe(functionCallingModel).pipe(outputParser);

async function upsertConversationMessage(
  user_id: string,
  session_id: string,
  newMessage: Message
) {
  const currentTime = new Date().toISOString();

  try {
    // Connect to MongoDB
    await dbConnect();

    // Update or create the user's document and set the last_updated field
    await Conversation.updateOne(
      { _id: user_id },
      {
        $set: {
          [`sessions.${session_id}.last_updated`]: currentTime, // Set last_updated to the current time
        },
        $push: { [`sessions.${session_id}.messages`]: newMessage },
      },
      { upsert: true }
    );

    console.log("Message inserted or updated successfully");
  } catch (error) {
    console.error("Error inserting or updating message:", error);
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  const success = await middleware(req);
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again after a cooldown." },
      { status: 429 }
    );
  }

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