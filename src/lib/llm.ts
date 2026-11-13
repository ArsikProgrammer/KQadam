import type { AiAnalysis } from "./analytics";

export interface LlmConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
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
    hourPlan: Array.isArray(parsed.hourPlan)
      ? parsed.hourPlan.map((item) => ({
          topic: String(item.topic ?? ""),
          change: String(item.change ?? ""),
          reason: String(item.reason ?? ""),
        }))
      : [],
  };
}

export async function analyzeTextbook(config: LlmConfig, prompt: string): Promise<AiAnalysis> {
  const endpoint = `${config.baseUrl.replace(/\/+$/, "")}/chat/completions`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.2,
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
