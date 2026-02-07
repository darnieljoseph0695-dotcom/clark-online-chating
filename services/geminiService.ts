
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, MatchCompatibility } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBio = async (interests: string[]): Promise<string> => {
  const prompt = `Write a short, witty, and charming dating profile bio for someone with these interests: ${interests.join(", ")}. Keep it under 150 characters. Make it sound modern and approachable.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Just someone looking for a great connection!";
  } catch (error) {
    console.error("Error generating bio:", error);
    return "Exploring life one step at a time.";
  }
};

export const generateIcebreaker = async (userA: UserProfile, userB: UserProfile): Promise<string> => {
  const prompt = `
    Generate a unique, friendly, and catchy first message (icebreaker) from ${userA.name} to ${userB.name}.
    ${userA.name}'s interests: ${userA.interests.join(", ")}
    ${userB.name}'s interests: ${userB.interests.join(", ")}
    The message should be based on a common interest or something interesting in ${userB.name}'s profile. 
    Keep it short (max 2 sentences) and fun.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Hey! I noticed we both like similar things. How's it going?";
  } catch (error) {
    console.error("Error generating icebreaker:", error);
    return "Hey! I really liked your profile. How are you doing today?";
  }
};

export const analyzeCompatibility = async (userA: UserProfile, userB: UserProfile): Promise<MatchCompatibility> => {
  const prompt = `
    Analyze the dating compatibility between two people:
    User 1: ${userA.name}, Age ${userA.age}, Interests: ${userA.interests.join(", ")}, Bio: ${userA.bio}
    User 2: ${userB.name}, Age ${userB.age}, Interests: ${userB.interests.join(", ")}, Bio: ${userB.bio}

    Return a JSON object with:
    - score: (number 0-100)
    - reason: (string, one sentence explaining the compatibility)
    - commonVibe: (string, a catchy two-word vibe like 'Adventurous Duo' or 'Creative Souls')
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            reason: { type: Type.STRING },
            commonVibe: { type: Type.STRING }
          },
          required: ["score", "reason", "commonVibe"]
        }
      }
    });

    return JSON.parse(response.text.trim()) as MatchCompatibility;
  } catch (error) {
    console.error("Error analyzing compatibility:", error);
    return {
      score: 75,
      reason: "You both seem like great people with overlapping interests!",
      commonVibe: "Good Match"
    };
  }
};
