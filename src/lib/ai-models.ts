export interface AIModel {
  value: string;
  label: string;
  badge: "new" | "maintenance" | null;
}

export const AI_MODELS: AIModel[] = [
  // Google Gemini
  { value: "google/gemini-3-flash-preview", label: "Gemini 3 Flash", badge: null },
  { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro", badge: null },
  { value: "google/gemini-3.1-pro-preview", label: "Gemini 3.1 Pro", badge: "new" },
  { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", badge: null },
  { value: "google/gemini-2.5-flash-lite", label: "Gemini Flash Lite", badge: null },
  // OpenAI
  { value: "openai/gpt-5", label: "GPT-5", badge: null },
  { value: "openai/gpt-5-mini", label: "GPT-5 Mini", badge: null },
  { value: "openai/gpt-5-nano", label: "GPT-5 Nano", badge: null },
  { value: "openai/gpt-5.2", label: "GPT-5.2", badge: "new" },
  // Anthropic
  { value: "anthropic/claude-sonnet-4", label: "Claude Sonnet 4", badge: "new" },
  { value: "anthropic/claude-haiku", label: "Claude Haiku", badge: null },
  // Meta
  { value: "meta/llama-4-maverick", label: "Llama 4 Maverick", badge: "new" },
  // Mistral
  { value: "mistral/mistral-large", label: "Mistral Large", badge: null },
  // NVIDIA (self-hosted)
  { value: "minimax", label: "MiniMax M2.5", badge: "maintenance" },
  { value: "google-phi", label: "Phi-4 Mini", badge: "maintenance" },
];
