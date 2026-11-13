import type { AiAnalysis } from "./analytics";

const provider = {
  baseUrl: "https://api.commandcode.ai/provider/v1",
  model: "Qwen/Qwen3.7-Flash",
};

const KEY_STORAGE = "kadam:llm-key";

/** Ключ API: из переменной окружения VITE_LLM_API_KEY или из ввода во вкладке (sessionStorage). */
export function getApiKey(): string {
  const fromEnv = (import.meta.env.VITE_LLM_API_KEY ?? "").trim();
  if (fromEnv) return fromEnv;
  return (sessionStorage.getItem(KEY_STORAGE) ?? "").trim();
}

export function setApiKey(key: string): void {
  sessionStorage.setItem(KEY_STORAGE, key.trim());
}

const clampScore = (value: unknown) => Math.min(100, Math.max(0, Math.round(Number(value) || 0)));

function parseAnalysis(content: string): AiAnalysis {
  const json = content.replace(/```[a-z]*\n?/gi, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(json) as Partial<AiAnalysis>;
  if (!parsed.summary) throw new Error("Модель вернула ответ без итога");
  return {
    summary: String(parsed.summary),
    overallScore: clampScore(parsed.overallScore),
    criteria: Array.isArray(parsed.criteria)
      ? parsed.criteria.map((item) => ({
          name: String(item.name ?? ""),
          score: clampScore(item.score),
          verdict: String(item.verdict ?? ""),
        }))
      : [],
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.map(String) : [],
    recommendations: Array.isArray(parsed.recommendations)
      ? parsed.recommendations.map((item) => ({
          title: String(item.title ?? ""),
          detail: String(item.detail ?? ""),
        }))
      : [],
  };
}

export async function analyzeTextbook(prompt: string): Promise<AiAnalysis> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      "Не задан ключ API: введите его в поле выше или задайте VITE_LLM_API_KEY в .env.local",
    );
  }

  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      temperature: 0.2,
      reasoning_effort: "low",
      max_tokens: 4000,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "Ты аналитик учебных программ. Отвечай только строгим JSON по схеме из запроса.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) throw new Error(`Ошибка API: ${response.status}`);
  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Пустой ответ модели");
  return parseAnalysis(content);
}
