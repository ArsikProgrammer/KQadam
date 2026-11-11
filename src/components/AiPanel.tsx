import { useState } from "react";
import { buildAnalysisPrompt, localAnalysis, type AiAnalysis } from "../lib/analytics";
import { analyzeTextbook, type LlmConfig } from "../lib/llm";
import { textbookById, textbooks, textbookStats } from "../data/textbooks";

const sampleChapters = [
  "Глава 1. Доли и обыкновенные дроби (12 ч): сравнение дробей, действия, смешанные задачи.",
  "Глава 2. Десятичные числа и проценты (10 ч): перевод форм, проценты в задачах.",
  "Глава 3. Рациональные числа (14 ч): свойства действий, порядок выполнения.",
  "Глава 4. Алгебраические выражения и формулы сокращённого умножения (8 ч).",
  "Глава 5. Уравнения: линейные и квадратные (12 ч): дискриминант, теорема Виета.",
  "Глава 6. Функции и графики (18 ч): линейная, квадратичная, показательная.",
  "Глава 7. Тригонометрия (12 ч): единичная окружность, основные тождества.",
  "Глава 8. Производная и применение (14 ч): монотонность, экстремумы.",
].join("\n");

type Source = "llm" | "local";

export function AiPanel() {
  const [config, setConfig] = useState<LlmConfig>({
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    apiKey: "",
  });
  const [bookId, setBookId] = useState("atamura");
  const [chapters, setChapters] = useState(sampleChapters);
  const [result, setResult] = useState<AiAnalysis | null>(null);
  const [source, setSource] = useState<Source>("local");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    const book = textbookById(bookId);
    const stats = textbookStats[bookId];

    if (config.apiKey.trim().length === 0) {
      setResult(localAnalysis(book, stats));
      setSource("local");
      setLoading(false);
      return;
    }

    try {
      const analysis = await analyzeTextbook(
        config,
        buildAnalysisPrompt(book, stats, chapters),
      );
      setResult(analysis);
      setSource("llm");
    } catch (cause) {
      setError(
        `AI-разбор не выполнен: ${cause instanceof Error ? cause.message : "неизвестная ошибка"}. Показан локальный расчёт.`,
      );
      setResult(localAnalysis(book, stats));
      setSource("local");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card ai-card">
      <h3>AI-разбор учебника</h3>
      <p className="card-note">
        Вставьте структуру или фрагмент реального учебника — модель сопоставит
        его с графом тем и статистикой тестов. Работает с любым
        OpenAI-совместимым API (OpenAI, локальный Ollama через
        OLLAMA_ORIGINS). Без ключа запускается детерминированный локальный
        расчёт, ключ хранится только в этой вкладке.
      </p>

      <div className="ai-config">
        <label>
          API endpoint
          <input
            value={config.baseUrl}
            onChange={(event) => setConfig({ ...config, baseUrl: event.target.value })}
          />
        </label>
        <label>
          Модель
          <input
            value={config.model}
            onChange={(event) => setConfig({ ...config, model: event.target.value })}
          />
        </label>
        <label>
          API-ключ
          <input
            type="password"
            placeholder="пусто — локальный расчёт"
            value={config.apiKey}
            onChange={(event) => setConfig({ ...config, apiKey: event.target.value })}
          />
        </label>
        <label>
          Учебник
          <select value={bookId} onChange={(event) => setBookId(event.target.value)}>
            {textbooks.map((book) => (
              <option key={book.id} value={book.id}>
                {book.publisher}, {book.year}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="ai-chapters">
        Структура или фрагмент учебника
        <textarea
          rows={7}
          value={chapters}
          onChange={(event) => setChapters(event.target.value)}
        />
      </label>

      <button className="btn btn-primary" onClick={run} disabled={loading}>
        {loading ? "Анализируем…" : "Запустить разбор"}
      </button>

      {error && <p className="ai-error">{error}</p>}

      {result && (
        <div className="ai-result">
          <p className="ai-badge">
            {source === "llm" ? "Разбор LLM-моделью" : "Локальный детерминированный расчёт (без LLM)"}
          </p>
          <p className="ai-summary">{result.summary}</p>

          <div className="ai-columns">
            <div>
              <h4>Сильные стороны</h4>
              <ul>
                {result.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Слабые места</h4>
              <ul>
                {result.weaknesses.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {result.hourPlan.length > 0 && (
            <>
              <h4>План часов от модели</h4>
              <ul className="ai-hours">
                {result.hourPlan.map((item) => (
                  <li key={item.topic}>
                    <b>{item.topic}</b>
                    <span className="delta-chip delta-up">{item.change}</span>
                    <span className="ai-hours-reason">{item.reason}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
