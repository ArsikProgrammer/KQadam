import { useEffect, useMemo, useRef, useState } from "react";
import {
  clusterMeta,
  dependentsOf,
  gradeLabels,
  topicById,
  topics,
  type Grade,
  type Topic,
} from "../data/curriculum";

interface TopicGraphProps {
  focusTopicId: string | null;
}

const GRADES: Grade[] = [5, 6, 7, 8, 9, 10, 11];
const COLUMN_W = 168;
const ROW_H = 66;
const NODE_W = 148;
const NODE_H = 50;
const PAD_X = 28;
const PAD_Y = 24;

const graphWidth = GRADES.length * COLUMN_W + PAD_X * 2;
const maxRows = Math.max(...GRADES.map((grade) => topics.filter((topic) => topic.grade === grade).length));
const graphHeight = (maxRows + 1) * ROW_H + PAD_Y * 2;

function layout() {
  const positions = new Map<string, { x: number; y: number }>();
  GRADES.forEach((grade, columnIndex) => {
    const column = topics.filter((topic) => topic.grade === grade);
    column.forEach((topic, rowIndex) => {
      positions.set(topic.id, {
        x: PAD_X + columnIndex * COLUMN_W,
        y: PAD_Y + (rowIndex + 1) * ROW_H,
      });
    });
  });
  return positions;
}

function wrapTitle(title: string, maxChars: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of title.split(" ")) {
    if (line.length + word.length + 1 > maxChars && line.length > 0) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
    if (lines.length === 3) break;
  }
  if (line && lines.length < 3) lines.push(line);
  return lines;
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function TopicGraph({ focusTopicId }: TopicGraphProps) {
  const positions = useMemo(layout, []);
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });

  useEffect(() => {
    if (!focusTopicId || !positions.has(focusTopicId)) return;
    setSelectedId(focusTopicId);
    const pos = positions.get(focusTopicId)!;
    setView({
      x: graphWidth / 2 - (pos.x + NODE_W / 2) * 1.15,
      y: graphHeight / 2 - (pos.y + NODE_H / 2) * 1.15,
      k: 1.15,
    });
    scrollTo("graph");
  }, [focusTopicId, positions]);

  const activeId = hoveredId ?? selectedId;
  const relatedIds = useMemo(() => {
    if (!activeId) return null;
    const topic = topicById.get(activeId);
    if (!topic) return null;
    return new Set([activeId, ...topic.prerequisites, ...dependentsOf(activeId).map((t) => t.id)]);
  }, [activeId]);

  const toLocalPoint = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const matrix = svg.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };
    const point = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
    return { x: point.x, y: point.y };
  };

  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const onWheel = (event: React.WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const cursor = toLocalPoint(event.clientX, event.clientY);
    const k = Math.min(2.4, Math.max(0.55, view.k * Math.exp(-event.deltaY * 0.0012)));
    setView({
      k,
      x: cursor.x - ((cursor.x - view.x) / view.k) * k,
      y: cursor.y - ((cursor.y - view.y) / view.k) * k,
    });
  };

  const onPointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    (event.target as Element).setPointerCapture?.(event.pointerId);
    dragRef.current = toLocalPoint(event.clientX, event.clientY);
  };

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current) return;
    const point = toLocalPoint(event.clientX, event.clientY);
    setView((prev) => ({
      ...prev,
      x: prev.x + point.x - dragRef.current!.x,
      y: prev.y + point.y - dragRef.current!.y,
    }));
    dragRef.current = point;
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  const zoomBy = (factor: number) => {
    setView((prev) => {
      const k = Math.min(2.4, Math.max(0.55, prev.k * factor));
      const cx = graphWidth / 2;
      const cy = graphHeight / 2;
      return {
        k,
        x: cx - ((cx - prev.x) / prev.k) * k,
        y: cy - ((cy - prev.y) / prev.k) * k,
      };
    });
  };

  const resetView = () => setView({ x: 0, y: 0, k: 1 });

  const selected = selectedId ? topicById.get(selectedId) ?? null : null;

  return (
    <section className="section" id="graph">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Граф знаний</p>
          <h2>Каждая тема держится на предыдущих</h2>
          <p className="section-lead">
            {topics.length} тем программы 5–11 классов связаны зависимостями. Пробел
            в узле разваливает всё, что стоит на нём дальше, — вплоть до заданий
            ЕНТ. Выберите тему, чтобы увидеть её опоры и последствия.
          </p>
        </div>

        <div className="graph-layout">
          <div className="graph-stage">
            <svg
              ref={svgRef}
              className="graph-svg"
              viewBox={`0 0 ${graphWidth} ${graphHeight}`}
              onWheel={onWheel}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerLeave={endDrag}
            >
              <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
                {GRADES.map((grade, index) => (
                  <text
                    key={grade}
                    className="graph-column-label"
                    x={PAD_X + index * COLUMN_W + NODE_W / 2}
                    y={PAD_Y + 4}
                    textAnchor="middle"
                  >
                    {gradeLabels[grade]}
                  </text>
                ))}

                {topics.flatMap((topic) =>
                  topic.prerequisites.map((prereqId) => {
                    const from = positions.get(prereqId);
                    const to = positions.get(topic.id);
                    if (!from || !to) return null;
                    const x1 = from.x + NODE_W;
                    const y1 = from.y + NODE_H / 2;
                    const x2 = to.x;
                    const y2 = to.y + NODE_H / 2;
                    const mid = (x1 + x2) / 2;
                    const lit = relatedIds?.has(topic.id) && relatedIds?.has(prereqId);
                    return (
                      <path
                        key={`${prereqId}-${topic.id}`}
                        className={`graph-edge${lit ? " is-lit" : ""}`}
                        d={`M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`}
                      />
                    );
                  }),
                )}

                {topics.map((topic) => {
                  const pos = positions.get(topic.id)!;
                  const isSelected = topic.id === selectedId;
                  const isDimmed = relatedIds !== null && !relatedIds.has(topic.id);
                  const meta = clusterMeta[topic.cluster];
                  return (
                    <g
                      key={topic.id}
                      className={`graph-node${isSelected ? " is-selected" : ""}${isDimmed ? " is-dimmed" : ""}`}
                      transform={`translate(${pos.x},${pos.y})`}
                      onPointerEnter={() => setHoveredId(topic.id)}
                      onPointerLeave={() => setHoveredId(null)}
                      onClick={() => setSelectedId(topic.id)}
                    >
                      <rect
                        width={NODE_W}
                        height={NODE_H}
                        rx={10}
                        fill={meta.color}
                        fillOpacity={isSelected ? 0.3 : 0.13}
                        stroke={isSelected ? "#E8B04B" : meta.color}
                        strokeOpacity={isSelected ? 1 : 0.55}
                        strokeWidth={isSelected ? 2 : 1}
                      />
                      <circle cx={14} cy={NODE_H / 2} r={3.5} fill={meta.color} />
                      {wrapTitle(topic.title, 20).map((line, lineIndex, lines) => (
                        <text
                          key={line}
                          className="graph-node-text"
                          x={26}
                          y={NODE_H / 2 - ((lines.length - 1) * 11) / 2 + lineIndex * 11 + 3.5}
                        >
                          {line}
                        </text>
                      ))}
                    </g>
                  );
                })}
              </g>
            </svg>

            <div className="graph-zoom">
              <button onClick={() => zoomBy(1.2)} aria-label="Приблизить">+</button>
              <button onClick={() => zoomBy(1 / 1.2)} aria-label="Отдалить">−</button>
              <button onClick={resetView} aria-label="Сбросить вид">⌂</button>
            </div>

            <div className="graph-legend">
              {Object.values(clusterMeta).map((meta) => (
                <span key={meta.label}>
                  <i style={{ background: meta.color }} />
                  {meta.label}
                </span>
              ))}
            </div>
          </div>

          <aside className="graph-detail">
            {selected ? (
              <TopicDetail topic={selected} onSelect={setSelectedId} />
            ) : (
              <div className="graph-detail-empty">
                <h3>Выберите тему</h3>
                <p>
                  Кликните на узел графа: увидите, на чём тема держится, что
                  ломается при пробеле и как сильно она бьёт по ЕНТ.
                </p>
                <p className="graph-detail-hint">
                  Колесо мыши — масштаб, перетаскивание — перемещение.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}

function TopicDetail({ topic, onSelect }: { topic: Topic; onSelect: (id: string) => void }) {
  const meta = clusterMeta[topic.cluster];
  const dependents = dependentsOf(topic.id);

  return (
    <div className="topic-detail">
      <p className="topic-detail-meta">
        <i style={{ background: meta.color }} /> {meta.label} · {gradeLabels[topic.grade]} · сложность{" "}
        {"●".repeat(topic.difficulty)}
        {"○".repeat(3 - topic.difficulty)}
      </p>
      <h3>{topic.title}</h3>
      <p className="topic-detail-summary">{topic.summary}</p>

      <div className="ent-weight">
        <div className="ent-weight-row">
          <span>Влияние на ЕНТ</span>
          <b>{Math.round(topic.entWeight * 100)}%</b>
        </div>
        <div className="bar-track">
          <div className="bar-fill" style={{ width: `${topic.entWeight * 100}%` }} />
        </div>
      </div>

      <div className="gap-callout">
        <span className="gap-callout-label">Если пробел</span>
        <p>{topic.gapCost}</p>
      </div>

      <div className="topic-links">
        <h4>Держится на</h4>
        {topic.prerequisites.length === 0 ? (
          <p className="topic-detail-hint">Стартовая тема — опор нет.</p>
        ) : (
          <div className="chip-row">
            {topic.prerequisites.map((id) => (
              <button key={id} className="chip chip-button" onClick={() => onSelect(id)}>
                {topicById.get(id)?.title}
              </button>
            ))}
          </div>
        )}

        <h4>На что влияет</h4>
        {dependents.length === 0 ? (
          <p className="topic-detail-hint">Финальная тема — дальше только экзамен.</p>
        ) : (
          <div className="chip-row">
            {dependents.map((dependent) => (
              <button
                key={dependent.id}
                className="chip chip-button"
                onClick={() => onSelect(dependent.id)}
              >
                {dependent.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
