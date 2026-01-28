import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ChatResponse {
  response: string;
}

export const sendMessageToAI = async (message: string, userId?: string): Promise<ChatResponse> => {
  try {
    const { data } = await axios.post<ChatResponse>(`${API_URL}/AIChat`, {
      message,
      userId
    });
    return data;
  } catch (error) {
    console.error('Error sending message to AI:', error);
    throw error;
  }
};
