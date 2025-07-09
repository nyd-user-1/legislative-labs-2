import { Message } from "../types";

export const parseMessages = (messagesJson: any): Message[] => {
  try {
    return Array.isArray(messagesJson) ? messagesJson : JSON.parse(messagesJson || "[]");
  } catch {
    return [];
  }
};