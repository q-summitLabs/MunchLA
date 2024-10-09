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
        place_id: z.string().describe("Google Place ID of the restaurant"),
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
    new MessagesPlaceholder("history"),
    SystemMessagePromptTemplate.fromTemplate(
      `
      You are a friendly and knowledgeable guide specializing in food and restaurants in the Los Angeles area. You only answer questions and engage in conversations related to restaurants and food.

      Your goal is to help users by suggesting restaurants, discussing food options, and answering food-related questions about Los Angeles. If a user asks about non-food-related topics, gently redirect the conversation back to food and restaurant topics.

      In this conversation, there will be a history of chat messages that may include important restaurant information provided by you (the AI) in previous responses. You must use this restaurant data from the chat history to answer any questions about restaurants or food in Los Angeles.

      Important Rules:
      1. Always ensure that the "place_id" provided for each restaurant is valid and correctly formatted. If a "place_id" is found to be invalid, do not include that restaurant in your response.
      
      2. Format your responses as structured JSON, matching the schema provided:
          - "general_response": A friendly and helpful message for the user.
          - "restaurants": An array of restaurants, each containing:
              - "place_id": The Google Place ID of the restaurant.
              - "summary_of_restaurant": A short summary of the restaurant.
              - "summary_of_reviews": A summary of the reviews.
        
      3. If no relevant restaurant information is provided in the chat history, focus on giving general food and restaurant advice related to Los Angeles.

      4. Avoid using any pre-trained data that isn't directly from the chat history. You must rely **only** on the restaurant data present in the chat history to give specific suggestions.

      5. Ensure your responses are always engaging, friendly, and helpful, keeping the conversation light but informative. If the user drifts away from restaurant or food-related topics, politely bring the conversation back to Los Angeles food and restaurant options.

      Here's some extra restaurant info: {restaurantInfo}
      `
    ),
    HumanMessagePromptTemplate.fromTemplate("{inputText}"),
  ],
  inputVariables: ["inputText", "history", "restaurantInfo"],
});


// Set up the output parser to handle structured output
const outputParser = new JsonOutputFunctionsParser();

// Combine prompt, model, and output parser into a chain
export const chain = prompt.pipe(functionCallingModel).pipe(outputParser);
