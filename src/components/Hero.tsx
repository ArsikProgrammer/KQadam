import { useMemo, useState } from "react";
import { BookScene } from "./BookScene";
import type { BookSpec } from "../three/bookScene";
import { entBlocks, entTrack } from "../data/ent";
import { clusterMeta, gradeLabels, topics, topicsByGrade, type Grade } from "../data/curriculum";

const grades: Grade[] = [5, 6, 7, 8, 9, 10, 11];

const coverBases = ["#21405F", "#2A4E70", "#1D3A57", "#26527A", "#21405F", "#2A4E70", "#1D3A57"];
const coverAccents = ["#E8B04B", "#4FB79D", "#D97757", "#5B9BD5", "#9B8EC4", "#E8B04B", "#4FB79D"];

type Selection = { kind: "grade"; grade: Grade } | { kind: "ent" };

function selectionOf(bookId: string): Selection {
  return bookId === "ent" ? { kind: "ent" } : { kind: "grade", grade: Number(bookId.slice(1)) as Grade };
}

function masteryDots(weight: number) {
  const filled = Math.max(1, Math.round(weight * 3));
  return "●".repeat(filled) + "○".repeat(3 - filled);
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Hero() {
  const [openId, setOpenId] = useState<string | null>("g8");

  const books = useMemo<BookSpec[]>(
    () => [
      ...grades.map((grade, index) => ({
        id: `g${grade}`,
        label: String(grade),
        caption: "МАТЕМАТИКА",
        base: coverBases[index],
        accent: coverAccents[index],
      })),
      {
        id: "ent",
        label: "ЕНТ",
        caption: "ПРОФИЛЬНАЯ",
        base: "#E8B04B",
        accent: "#1B3A5C",
        ink: "#1B3A5C",
      },
    ],
    [],
  );

  const selection = openId ? selectionOf(openId) : null;

  return (
    <section className="hero" id="hero">
      <div className="container hero-inner">
        <div className="hero-copy">
          <p className="eyebrow">EdTech · Data-Driven Curriculum · Қазақстан</p>
          <h1>
            Математика не прощает <span className="accent-text">пропусков</span>
          </h1>
          <p className="hero-lead">
            Навигатор школьной программы: граф тем, прогноз провалов до контрольной
            и трек от долей 5 класса до ЕНТ.
          </p>
          <p className="hero-sub">
            Решения о часах и темпах — не по интуиции, а по данным.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => scrollTo("graph")}>
              Исследовать граф тем
            </button>
            <button className="btn btn-ghost" onClick={() => scrollTo("diagnostics")}>
              Запустить диагностику
            </button>
          </div>
          <dl className="hero-stats">
            <div>
              <dt>{topics.length}</dt>
              <dd>тем в графе знаний</dd>
            </div>
            <div>
              <dt>{grades.length}</dt>
              <dd>классов в одной цепочке</dd>
            </div>
            <div>
              <dt>{entBlocks.length}</dt>
              <dd>блоков ЕНТ под наблюдением</dd>
            </div>
          </dl>
        </div>

        <div className="hero-shelf">
          <BookScene
            books={books}
            openId={openId}
            onSelect={(id) => setOpenId((prev) => (prev === id ? null : id))}
          />
          <p className="shelf-hint">Нажмите на книгу — откроется содержание класса</p>

          {selection?.kind === "grade" && (
            <div className="shelf-panel">
              <div className="shelf-panel-head">
                <h3>{gradeLabels[selection.grade]}</h3>
                <span>{topicsByGrade(selection.grade).length} тем · клик по книге закрывает её</span>
              </div>
              <ul className="topic-chips">
                {topicsByGrade(selection.grade).map((topic) => (
                  <li key={topic.id}>
                    <span
                      className="chip-dot"
                      style={{ background: clusterMeta[topic.cluster].color }}
                    />
                    {topic.title}
                    <span className="chip-weight" title="влияние на ЕНТ">
                      {masteryDots(topic.entWeight)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selection?.kind === "ent" && (
            <div className="shelf-panel">
              <div className="shelf-panel-head">
                <h3>Профильная математика · ЕНТ</h3>
                <span>{entTrack.length} опорных узлов от 5 до 11 класса</span>
              </div>
              <ul className="ent-mini-list">
                {entBlocks.map((block) => (
                  <li key={block.id}>
                    <div className="ent-mini-row">
                      <span>{block.title}</span>
                      <b>{block.share}%</b>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${block.share * 4}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
