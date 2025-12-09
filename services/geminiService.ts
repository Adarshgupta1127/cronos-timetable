import { GoogleGenAI } from "@google/genai";
import { AppState, DAYS, TIME_SLOTS } from "../types";

// Helper to format the schedule for the LLM
const formatScheduleForPrompt = (state: AppState): string => {
  let text = "Current Schedule Data:\n";
  
  text += "Instructors:\n";
  state.instructors.forEach(i => text += `- ${i.name} (${i.specialty})\n`);
  
  text += "\nTimetable Assignments:\n";
  state.timetable.forEach(session => {
    const sub = state.subjects.find(s => s.id === session.subjectId);
    const room = state.rooms.find(r => r.id === session.roomId);
    const instructor = state.instructors.find(i => i.id === sub?.instructorId);
    const group = state.groups.find(g => g.id === sub?.groupId);
    const time = TIME_SLOTS.find(t => t.index === session.slotIndex);
    
    if (sub && room && instructor && group && time) {
      text += `[${session.day} ${time.label}] ${sub.name} in ${room.name} with ${instructor.name} for ${group.name}\n`;
    }
  });

  return text;
};

export const generateScheduleReport = async (state: AppState, query: string): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return "Error: API_KEY is missing in environment variables.";

    const ai = new GoogleGenAI({ apiKey });
    
    const context = formatScheduleForPrompt(state);
    const prompt = `
    You are an expert academic scheduler assistant. 
    Here is the generated timetable data:
    ${context}

    User Query: ${query}

    Please provide a concise, professional analysis or answer based on the data.
    If the user asks for suggestions, verify they don't conflict with existing slots.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate report. Please check your network or API key.";
  }
};