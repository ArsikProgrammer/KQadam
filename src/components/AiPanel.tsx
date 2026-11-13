import { useState } from "react";
import { buildAnalysisPrompt, type AiAnalysis } from "../lib/analytics";
import { analyzeTextbook } from "../lib/llm";
import { textbookById, textbooks, textbookStats } from "../data/textbooks";
import { textbookReports } from "../data/reports";

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
  const [result, setResult] = useState<AiAnalysis>(textbookReports["atamura"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectBook = (id: string) => {
    setBookId(id);
    setResult(textbookReports[id]);
    setError(null);
  };

  const rerun = async () => {
    setLoading(true);
    setError(null);
    try {
      const analysis = await analyzeTextbook(
        buildAnalysisPrompt(textbookById(bookId), textbookStats[bookId]),
      );
      setResult(analysis);
    } catch (cause) {
      setError(
        `Не удалось обновить разбор: ${cause instanceof Error ? cause.message : "ошибка связи"}. Показан сохранённый отчёт модели.`,
      );
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
            onClick={() => selectBook(book.id)}
          >
            {book.publisher}
            <span>{book.year}</span>
          </button>
        ))}
      </div>

      <div className="ai-run-row">
        <button className="btn btn-primary" onClick={rerun} disabled={loading}>
          {loading ? "Модель анализирует…" : "Пересчитать моделью"}
        </button>
        <p className="ai-secure">Проанализировано моделью Qwen 3.7 Flash</p>
      </div>

      {error && <p className="ai-error">{error}</p>}

      <div className="ai-report">
        <div className="report-head">
          <div>
            <p className="ai-badge">Проанализировано моделью Qwen 3.7 Flash</p>
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
    </div>
  );
}
