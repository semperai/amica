import { createContext } from "react";
import { Chat } from "./chat";

const chat = new Chat();

export const ChatContext = createContext({ chat });