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
import dbConnect from "@/lib/mongodb";
import Conversation from "@/models/Conversation";

// Type definitions for the request body and database message
interface RequestBody {
  user_id: string;
  session_id: string;
  message: string;
}

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

// interface Session {
//   messages: Message[]; // An array of messages
// }

// interface Sessions {
//   [sessionId: string]: Session; // Dynamic keys for session IDs
// }

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
      `You are a knowledgeable guide specializing in restaurants in Los Angeles. Your sole responsibility is to assist users 
      by answering their queries about restaurants mentioned in the conversation history. Only use the information from the 
      restaurant data provided in the chat history to respond to user queries. 

      If the information in the chat history doesn't provide an answer, politely let the user know that you don't have 
      relevant information at the moment. Avoid using any knowledge outside of the restaurant data and avoid discussing 
      topics unrelated to food or restaurants in Los Angeles.`
    ),
    new MessagesPlaceholder("history"),
    HumanMessagePromptTemplate.fromTemplate("{inputText}"),
  ],
  inputVariables: ["inputText", "history"],
});

const outputParser = new JsonOutputFunctionsParser();
const chain = prompt.pipe(functionCallingModel).pipe(outputParser);

async function upsertConversationMessage(user_id: string, session_id: string, newMessage: Message) {
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
  if (req.method !== "POST") {
    return NextResponse.json(
      { error: "Only POST requests are allowed" },
      { status: 405 }
    );
  }

  try {
    console.time("Total execution time");
    console.time("Parse request body");
    const { user_id, session_id, message }: RequestBody = await req.json();
    console.log(user_id, session_id, message);
    console.timeEnd("Parse request body");

    if (!user_id || !session_id || !message) {
      return NextResponse.json(
        { error: "Missing user_id, session_id, or message" },
        { status: 400 }
      );
    }

    console.time("Pinecone similarity search");
    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({ modelName: "text-embedding-3-small" }),
      { pineconeIndex }
    );
    const results = await vectorStore.similaritySearch(message, 8);
    console.timeEnd("Pinecone similarity search");

    // Insert formatted restaurant data into MongoDB
    console.time("Insert restaurant data into MongoDB");
    const combinedContent = results
      .map((result) => JSON.stringify(result, null, 2))
      .join("\n\n");

    const newMessage: Message = {
      message_type: "restaurant_data",
      content: combinedContent,
    };

    // Insert the combined message into MongoDB
    await upsertConversationMessage(user_id, session_id, newMessage);
    console.timeEnd("Insert restaurant data into MongoDB");

    // Retrieve the updated conversation history from MongoDB
    console.time("Retrieve conversation from MongoDB");
    const conversation = await Conversation.findOne(
      { _id: user_id },
      { [`sessions.${session_id}.messages`]: 1, _id: 0 }
    ).exec();

    const dbMessages: Message[] = conversation ? conversation.sessions.get(session_id)?.messages || [] : [];
    console.timeEnd("Retrieve conversation from MongoDB");

    // Create a new message history instance for the current session
    const messageHistory = new ChatMessageHistory();

    console.time("Load messages into history");
    for (const dbMessage of dbMessages) {
      if (dbMessage.message_type === "human_message_no_prompt") {
        await messageHistory.addMessage(new HumanMessage(dbMessage.content as string));
      } else if (dbMessage.message_type === "ai_message" || dbMessage.message_type === "restaurant_data") {
        await messageHistory.addMessage(new AIMessage(JSON.stringify(dbMessage.content)));
      }
      // console.log(`db message content: ${dbMessage.content}`);
    }
    console.timeEnd("Load messages into history");

    console.log(`message history: ${JSON.stringify(messageHistory)}`);


    console.time("Generate AI response");
    const withHistory = new RunnableWithMessageHistory({
      runnable: chain,
      getMessageHistory: () => messageHistory,
      inputMessagesKey: "input",
      historyMessagesKey: "history",
    });

    const config: RunnableConfig = { configurable: { sessionId: session_id } };
    const aiResponse = await withHistory.invoke(
      { inputText: message, history: messageHistory },
      config
    ) as AIMessageContent;
    console.timeEnd("Generate AI response");

    console.time("Insert human message into MongoDB");
    const humanMessage: Message = {
      message_type: "human_message_no_prompt",
      content: message,
    };
    await upsertConversationMessage(user_id, session_id, humanMessage);
    console.timeEnd("Insert human message into MongoDB");

    console.time("Insert AI message into MongoDB");
    const aiMessage: Message = {
      message_type: "ai_message",
      content: aiResponse,
    };
    await upsertConversationMessage(user_id, session_id, aiMessage);
    console.timeEnd("Insert AI message into MongoDB");

    console.timeEnd("Total execution time");
    return NextResponse.json({ aiResponse }, { status: 200 });
  } catch (error) {
    console.error("Error handling message data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
