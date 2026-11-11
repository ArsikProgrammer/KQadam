import { useMemo, useState } from "react";
import { AiPanel } from "./AiPanel";
import { compareTextbooks, hardTopics, hourPlan } from "../lib/analytics";
import {
  textbookById,
  textbooks,
  textbookStats,
  targetMastery,
} from "../data/textbooks";

function pct(value: number) {
  return Math.round(value * 100);
}

function HardTopicsCard() {
  const ranked = useMemo(() => hardTopics(5), []);

  return (
    <div className="card desk-card">
      <h3>Сложные для усвоения разделы</h3>
      <p className="card-note">
        Ранжирование по индексу сложности: 60% — пробел освоения, 40% — доля
        ошибок, по трём учебникам суммарно.
      </p>
      <ol className="rank-list">
        {ranked.map((topic, index) => (
          <li key={topic.topicId}>
            <span className="rank-num">{index + 1}</span>
            <div className="rank-body">
              <div className="rank-head">
                <b>{topic.title}</b>
                <span className="rank-index">{topic.index} / 100</span>
              </div>
              <div className="bar-track">
                <div className="bar-fill bar-fill-danger" style={{ width: `${topic.index}%` }} />
              </div>
              <p className="rank-meta">
                освоение {pct(topic.mastery)}% · ошибки {pct(topic.errorRate)}% · выборка{" "}
                {topic.students}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function HoursCard() {
  const plan = useMemo(() => hourPlan(), []);
  const changed = plan.filter((row) => row.delta !== 0);
  const totals = plan.reduce(
    (acc, row) => ({ fact: acc.fact + row.factHours, rec: acc.rec + row.recHours }),
    { fact: 0, rec: 0 },
  );

  return (
    <div className="card desk-card">
      <h3>Распределение учебных часов</h3>
      <p className="card-note">
        Цель — {pct(targetMastery)}% освоения; прогноз прозрачной модели: +4.5
        п.п. освоения за дополнительный час на слабой теме.
      </p>
      <ul className="hours-list">
        {changed.map((row) => (
          <li key={row.topicId}>
            <b>{row.title}</b>
            <div className="hours-figures">
              <span>
                {row.factHours} ч → <b>{row.recHours} ч</b>
              </span>
              <span className={`delta-chip ${row.delta > 0 ? "delta-up" : "delta-down"}`}>
                {row.delta > 0 ? `+${row.delta}` : row.delta} ч
              </span>
              <span className="hours-projected">прогноз {pct(row.projected)}%</span>
            </div>
          </li>
        ))}
      </ul>
      <p className="card-foot">
        План по программе: {totals.fact} ч → {totals.rec} ч (переброска внутри
        объёма, а не сверх него).
      </p>
    </div>
  );
}

function ComparisonCard() {
  const [aId, setAId] = useState("atamura");
  const [bId, setBId] = useState("mektep");
  const report = useMemo(() => compareTextbooks(aId, bId), [aId, bId]);
  const bookA = textbookById(aId);
  const bookB = textbookById(bId);
  const diffPoints = Math.round(report.avgDiff * 1000) / 10;
  const aLeads = diffPoints >= 0;
  const leader = aLeads ? bookA : bookB;
  const runnerUp = aLeads ? bookB : bookA;
  const leaderWins = aLeads ? report.winsA : report.winsB;

  return (
    <div className="card desk-card compare-card">
      <div className="compare-head">
        <div>
          <h3>Сравнение эффективности учебников</h3>
          <p className="card-note">
            Сопоставимые выборки по одинаковым темам — сравнение результатов, а
            не мнений.
          </p>
        </div>
        <div className="compare-selects">
          <label>
            Учебник А
            <select value={aId} onChange={(event) => setAId(event.target.value)}>
              {textbooks.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.publisher}, {book.year}
                </option>
              ))}
            </select>
          </label>
          <label>
            Учебник Б
            <select value={bId} onChange={(event) => setBId(event.target.value)}>
              {textbooks.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.publisher}, {book.year}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <p className="compare-verdict">
        «{leader.publisher}» в среднем на {Math.abs(diffPoints)} п.п. выше по
        освоению, чем «{runnerUp.publisher}»: побед в темах {leaderWins} из{" "}
        {report.rows.length}.{" "}
        {report.leadA && report.leadB
          ? `У «${bookA.publisher}» сильнее всего отрыв в теме «${report.leadA.title}», у «${bookB.publisher}» — в теме «${report.leadB.title}».`
          : "Разрыв по темам ровный — статистически значимого лидера по отдельным разделам нет."}
      </p>

      <div className="compare-table">
        <div className="compare-row compare-row-head">
          <span>Тема</span>
          <span>А · {bookA.publisher}</span>
          <span>Б · {bookB.publisher}</span>
          <span>Лидер</span>
        </div>
        {report.rows.map((row) => {
          const winnerKey = row.a === row.b ? "tie" : row.a > row.b ? "a" : "b";
          const winnerLabel = winnerKey === "tie" ? "—" : winnerKey === "a" ? "А" : "Б";
          return (
            <div className="compare-row" key={row.topicId}>
              <span className="compare-topic">{row.title}</span>
              <span className="compare-bar">
                <span className="bar-track">
                  <span className="bar-fill bar-fill-gold" style={{ width: `${row.a * 100}%` }} />
                </span>
                <b>{pct(row.a)}%</b>
              </span>
              <span className="compare-bar">
                <span className="bar-track">
                  <span className="bar-fill" style={{ width: `${row.b * 100}%` }} />
                </span>
                <b>{pct(row.b)}%</b>
              </span>
              <span className={`compare-winner compare-winner-${winnerKey}`}>{winnerLabel}</span>
            </div>
          );
        })}
      </div>

      <p className="card-foot">
        Методика: индекс сложности темы = 0.6·(1−освоение) + 0.4·ошибки. Выборки:
        {" "}
        {textbookStats[aId].reduce((sum, stat) => sum + stat.students, 0)} и{" "}
        {textbookStats[bId].reduce((sum, stat) => sum + stat.students, 0)} работ.
      </p>
    </div>
  );
}

export function MethodistDesk() {
  return (
    <section className="section" id="methodist">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Кабинет методиста</p>
          <h2>От субъективных решений — к измеримым результатам</h2>
          <p className="section-lead">
            Платформа анализирует результаты тестирования по темам, выявляет
            сложные для усвоения разделы, сравнивает эффективность учебников и
            формирует обоснованные рекомендации по распределению учебных часов.
          </p>
        </div>

        <div className="methodist-grid">
          <HardTopicsCard />
          <HoursCard />
        </div>

        <ComparisonCard />

        <AiPanel />
      </div>
    </section>
  );
}
