import { useState } from "react";
import { buildAnalysisPrompt, localAnalysis, type AiAnalysis } from "../lib/analytics";
import { analyzeTextbook } from "../lib/llm";
import { textbookById, textbooks, textbookStats } from "../data/textbooks";

const llmConfig = {
  baseUrl: "https://api.commandcode.ai/provider/v1",
  model: "Qwen/Qwen3.7-Flash",
};

type Source = "llm" | "local";

function ScoreRing({ score }: { score: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="score-ring">
      <svg viewBox="0 0 80 80">
        <circle className="score-ring-base" cx="40" cy="40" r={radius} />
        <circle
          className="score-ring-value"
          cx="40"
          cy="40"
          r={radius}
          strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
        />
      </svg>
      <b>{score}</b>
    </div>
  );
}

export function AiPanel() {
  const [bookId, setBookId] = useState("atamura");
  const [apiKey, setApiKey] = useState("");
  const [result, setResult] = useState<AiAnalysis | null>(null);
  const [source, setSource] = useState<Source>("local");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    const book = textbookById(bookId);
    const stats = textbookStats[bookId];

    if (apiKey.trim().length === 0) {
      setResult(localAnalysis(book, stats));
      setSource("local");
      setLoading(false);
      return;
    }

    try {
      const analysis = await analyzeTextbook(
        { ...llmConfig, apiKey },
        buildAnalysisPrompt(book, stats),
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
        Модель оценивает учебник по шести критериям: соответствие программе и
        ЕНТ, терминология, доступность изложения, структура глав, практика и
        распределение часов.
      </p>

      <div className="segmented ai-books">
        {textbooks.map((book) => (
          <button
            key={book.id}
            className={book.id === bookId ? "is-active" : ""}
            onClick={() => setBookId(book.id)}
          >
            {book.publisher}
            <span>{book.year}</span>
          </button>
        ))}
      </div>

      <div className="ai-run-row">
        <label className="ai-key">
          API-ключ
          <input
            type="password"
            placeholder="пусто — локальный расчёт"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
          />
        </label>
        <button className="btn btn-primary" onClick={run} disabled={loading}>
          {loading ? "Анализируем…" : "Запустить разбор"}
        </button>
      </div>
      <p className="ai-secure">
        Qwen 3.7 Flash · ключ хранится только во вкладке, без него работает
        локальный расчёт
      </p>

      {error && <p className="ai-error">{error}</p>}

      {result && (
        <div className="ai-report">
          <div className="report-head">
            <div>
              <p className="ai-badge">
                {source === "llm" ? "Разбор Qwen 3.7 Flash" : "Локальный расчёт (без LLM)"}
              </p>
              <p className="report-summary">{result.summary}</p>
            </div>
            <ScoreRing score={result.overallScore} />
          </div>

          <div className="report-criteria">
            {result.criteria.map((criterion) => (
              <div className="report-criterion" key={criterion.name}>
                <div className="factor-row">
                  <span>{criterion.name}</span>
                  <b>{criterion.score}/100</b>
                </div>
                <div className="bar-track">
                  <div className="bar-fill bar-fill-gold" style={{ width: `${criterion.score}%` }} />
                </div>
                <p>{criterion.verdict}</p>
              </div>
            ))}
          </div>

          <div className="report-columns">
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

          {result.recommendations.length > 0 && (
            <>
              <h4>Рекомендации</h4>
              <div className="report-reco">
                {result.recommendations.map((item) => (
                  <div className="report-reco-item" key={item.title}>
                    <b>{item.title}</b>
                    <p>{item.detail}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {result.hourPlan.length > 0 && (
            <>
              <h4>План часов</h4>
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
