import asyncHandler from "../utils/asyncHandler.js";
import APIError from "../utils/APIError.js";
import APIResponse from "../utils/APIResponse.js";
import { handleTripChat } from "../services/chat.service.js";

export const postTripChat = asyncHandler(async (req, res) => {
  const { message, plannerData, chatHistory } = req.body ?? {};

  if (!message || typeof message !== "string" || !message.trim()) {
    throw new APIError(400, "Message is required");
  }

  const data = await handleTripChat({
    message: message.trim(),
    plannerData: plannerData ?? {},
    chatHistory: Array.isArray(chatHistory) ? chatHistory : [],
  });

  res.status(200).json(
    new APIResponse(200, data, "Chat response generated")
  );
});
