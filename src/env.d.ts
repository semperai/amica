declare namespace NodeJS {
  interface ProcessEnv {
    // OpenRouter Configuration
    NEXT_PUBLIC_OPENROUTER_APIKEY?: string;
    NEXT_PUBLIC_OPENROUTER_URL?: string;
    NEXT_PUBLIC_OPENROUTER_MODEL?: string;

    // Existing environment variables (preserving for type safety)
    NEXT_PUBLIC_CHATBOT_BACKEND?: string;
    NEXT_PUBLIC_OPENAI_APIKEY?: string;
    NEXT_PUBLIC_OPENAI_URL?: string;
    NEXT_PUBLIC_OPENAI_MODEL?: string;
    NEXT_PUBLIC_LLAMACPP_URL?: string;
    NEXT_PUBLIC_LLAMACPP_STOP_SEQUENCE?: string;
    NEXT_PUBLIC_OLLAMA_URL?: string;
    NEXT_PUBLIC_OLLAMA_MODEL?: string;
    NEXT_PUBLIC_KOBOLDAI_URL?: string;
    NEXT_PUBLIC_KOBOLDAI_USE_EXTRA?: string;
    NEXT_PUBLIC_KOBOLDAI_STOP_SEQUENCE?: string;
  }
}
