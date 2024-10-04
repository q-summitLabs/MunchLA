import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Define the Zod schema for the structured output
const restaurantSchema = z.object({
  general_response: z
    .string()
    .describe("A general response from the bot to the user"),
  restaurants: z
    .array(
      z.object({
        name: z.string().describe("The name of the restaurant"),
        summary_of_restaurant: z.string().describe("A summary of the restaurant"),
        summary_of_reviews: z.string().describe("A summary of the reviews"),
      })
    )
    .describe("An array of restaurant objects with detailed information"),
});

// Set up your OpenAI model with the specified API key
const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4o-mini",  // You can replace this with the correct model name if needed
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

// Define the prompt template
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

// Set up the output parser to handle structured output
const outputParser = new JsonOutputFunctionsParser();

// Combine prompt, model, and output parser into a chain
export const chain = prompt.pipe(functionCallingModel).pipe(outputParser);
