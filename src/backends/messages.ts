export type Role = "assistant" | "system" | "user";

export type Message = {
  role: Role;
  content: string;
};

