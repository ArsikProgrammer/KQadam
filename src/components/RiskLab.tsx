import { useMemo, useState } from "react";
import {
  clusterMeta,
  gradeLabels,
  prerequisiteClosure,
  topicById,
  type Grade,
  type Topic,
} from "../data/curriculum";
import { assessRisk, type RiskInput } from "../lib/prediction";

const targetIds = ["quadratic-eq", "exp-log", "derivative"];

const gapPresets: Record<string, string[]> = {
  "quadratic-eq": ["fsu", "roots"],
  "exp-log": ["int-powers"],
  derivative: ["power-fn", "quadratic-fn"],
};

const levelCopy = {
  low: "Риск под контролем: текущего темпа хватает, чтобы закрыть тему к контрольной.",
  medium: "Окно риска: повторите опоры до контрольной — иначе тема ляжет на пробелы.",
  high: "Контрольная под угрозой: нужен возврат к опорным темам, а не новый материал.",
} as const;

function sortByEntWeight(topics: Topic[]) {
  return [...topics].sort((a, b) => b.entWeight - a.entWeight);
}

function groupedByGrade(topics: Topic[]) {
  const groups = new Map<Grade, Topic[]>();
  topics.forEach((topic) => {
    groups.set(topic.grade, [...(groups.get(topic.grade) ?? []), topic]);
  });
  return [...groups.entries()].sort((a, b) => a[0] - b[0]);
}

export function RiskLab() {
  const [targetId, setTargetId] = useState("quadratic-eq");
  const [gaps, setGaps] = useState<Set<string>>(new Set(gapPresets["quadratic-eq"]));
  const [errorRate, setErrorRate] = useState(22);
  const [practice, setPractice] = useState(65);

  const target = topicById.get(targetId)!;
  const closure = useMemo(() => prerequisiteClosure(targetId), [targetId]);

  const toggleGap = (id: string) => {
    setGaps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const changeTarget = (id: string) => {
    setTargetId(id);
    setGaps(new Set(gapPresets[id]));
  };

  const input: RiskInput = {
    prerequisiteMastery:
      target.prerequisites.filter((id) => !gaps.has(id)).length / target.prerequisites.length,
    chainCoverage: (closure.length - closure.filter((topic) => gaps.has(topic.id)).length) / closure.length,
    recentErrorRate: errorRate / 100,
    practiceCompletion: practice / 100,
  };
  const report = assessRisk(input);
  const scorePercent = Math.round(report.score * 100);

  const gapTopics = closure.filter((topic) => gaps.has(topic.id));
  const weakest = sortByEntWeight(gapTopics).slice(0, 3);
  const chainEntWeight = sortByEntWeight(closure).reduce((sum, topic) => sum + topic.entWeight, 0);
  const gapEntShare = chainEntWeight === 0
    ? 0
    : Math.round((gapTopics.reduce((sum, topic) => sum + topic.entWeight, 0) / chainEntWeight) * 100);

  return (
    <section className="section section-alt" id="diagnostics">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Диагностика</p>
          <h2>Прогноз провала — до контрольной, а не после</h2>
          <p className="section-lead">
            Модель складывает четыре фактора: пробелы в прямых опорах, глубину
            пробела по цепочке, ошибки последних недель и недобор практики.
            Взвешенная сумма пропускается через сигмоиду — каждый прогноз
            раскладывается на понятные вклады.
          </p>
        </div>

        <div className="risk-layout">
          <div className="risk-controls card">
            <h3>Что проверяем</h3>
            <div className="segmented">
              {targetIds.map((id) => (
                <button
                  key={id}
                  className={id === targetId ? "is-active" : ""}
                  onClick={() => changeTarget(id)}
                >
                  {topicById.get(id)?.title}
                </button>
              ))}
            </div>

            <div className="risk-target-meta">
              <span>
                {gradeLabels[target.grade]} · сложность {"●".repeat(target.difficulty)}
                {"○".repeat(3 - target.difficulty)}
              </span>
              <span>влияние на ЕНТ: {Math.round(target.entWeight * 100)}%</span>
            </div>

            <h4>Опоры темы — отметьте пробелы</h4>
            {groupedByGrade(closure).map(([grade, gradeTopics]) => (
              <div className="closure-group" key={grade}>
                <span className="closure-grade">{gradeLabels[grade]}</span>
                <div className="chip-row">
                  {gradeTopics.map((topic) => {
                    const isGap = gaps.has(topic.id);
                    return (
                      <button
                        key={topic.id}
                        className={`chip chip-toggle ${isGap ? "chip--gap" : "chip--ok"}`}
                        aria-pressed={isGap}
                        onClick={() => toggleGap(topic.id)}
                        title={topic.summary}
                      >
                        <i style={{ background: clusterMeta[topic.cluster].color }} />
                        {topic.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="slider-row">
              <label>
                Ошибки в работах последних недель
                <b>{errorRate}%</b>
              </label>
              <input
                type="range"
                min={0}
                max={60}
                value={errorRate}
                onChange={(event) => setErrorRate(Number(event.target.value))}
              />
            </div>
            <div className="slider-row">
              <label>
                Выполнение плана практики
                <b>{practice}%</b>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={practice}
                onChange={(event) => setPractice(Number(event.target.value))}
              />
            </div>
          </div>

          <div className="risk-report card">
            <div className="gauge" role="img" aria-label={`Риск ${scorePercent}%`}>
              <svg viewBox="0 0 220 130">
                <path className="gauge-base" d="M 20 115 A 90 90 0 0 1 200 115" />
                <path
                  className={`gauge-value gauge-${report.level}`}
                  d="M 20 115 A 90 90 0 0 1 200 115"
                  strokeDasharray={`${report.score * Math.PI * 90} ${Math.PI * 90}`}
                />
              </svg>
              <div className="gauge-label">
                <b>{scorePercent}%</b>
                <span>риск провала</span>
              </div>
            </div>

            <p className={`risk-verdict risk-verdict-${report.level}`}>{levelCopy[report.level]}</p>

            <div className="factor-list">
              {report.factors.map((factor) => (
                <div className="factor" key={factor.id}>
                  <div className="factor-row">
                    <span>{factor.label}</span>
                    <b>+{factor.points.toFixed(2)}</b>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${Math.round(factor.value * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="risk-reco">
              <h4>Что делать</h4>
              {weakest.length === 0 ? (
                <p>
                  Пробелов в опорах нет — держите текущую практику, чтобы
                  контрольная не стала точкой пробела.
                </p>
              ) : (
                <>
                  <p>
                    Повторить в первую очередь — темы с наибольшим влиянием на ЕНТ:
                  </p>
                  <div className="chip-row">
                    {weakest.map((topic) => (
                      <span key={topic.id} className="chip chip-static">
                        {topic.title} · {gradeLabels[topic.grade]}
                      </span>
                    ))}
                  </div>
                  <p className="risk-reco-foot">
                    Пробелы перекрывают {gapEntShare}% опорной базы темы, {gaps.size} из {closure.length} узлов
                    цепочки под вопросом.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
