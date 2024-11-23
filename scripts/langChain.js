import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-pro", 
  apiKey: "AIzaSyCIF2YEDm0Vyzq_9IgeACJ-d3Wov8p1p2c", 
});

export async function getAnswer(question) {
  let answer = "";
  try {
    answer = await llm.predict(question);
  } catch (e) {
    console.error(e);
  }
  return answer;
}