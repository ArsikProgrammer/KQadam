import { topicById } from "../data/curriculum";
import {
  hourGain,
  statsByTopic,
  targetMastery,
  textbooks,
  textbookStats,
  type Textbook,
  type TopicStat,
} from "../data/textbooks";

export interface HardTopic {
  topicId: string;
  title: string;
  index: number;
  mastery: number;
  errorRate: number;
  students: number;
}

export interface CompareRow {
  topicId: string;
  title: string;
  a: number;
  b: number;
}

export interface CompareReport {
  rows: CompareRow[];
  avgDiff: number;
  winsA: number;
  winsB: number;
  leadA: CompareRow | null;
  leadB: CompareRow | null;
}

export interface HourPlanRow {
  topicId: string;
  title: string;
  factHours: number;
  recHours: number;
  delta: number;
  projected: number;
}

export interface AiHourAdvice {
  topic: string;
  change: string;
  reason: string;
}

export interface AiAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  hourPlan: AiHourAdvice[];
}

const titleOf = (topicId: string) => topicById.get(topicId)?.title ?? topicId;
const entWeightOf = (topicId: string) => topicById.get(topicId)?.entWeight ?? 0.5;

function averageStats(): TopicStat[] {
  return [...statsByTopic().entries()].map(([topicId, stats]) => ({
    topicId,
    mastery: stats.reduce((sum, stat) => sum + stat.mastery, 0) / stats.length,
    errorRate: stats.reduce((sum, stat) => sum + stat.errorRate, 0) / stats.length,
    students: stats.reduce((sum, stat) => sum + stat.students, 0),
    hours: stats.reduce((sum, stat) => sum + stat.hours, 0) / stats.length,
  }));
}

/** Индекс сложности усвоения: вес освоения 0.6, ошибок 0.4 */
export function difficultyIndex(stat: Pick<TopicStat, "mastery" | "errorRate">): number {
  return Math.round(((1 - stat.mastery) * 0.6 + stat.errorRate * 0.4) * 100);
}

export function hardTopics(limit = 5): HardTopic[] {
  return averageStats()
    .map((stat) => ({
      topicId: stat.topicId,
      title: titleOf(stat.topicId),
      index: difficultyIndex(stat),
      mastery: stat.mastery,
      errorRate: stat.errorRate,
      students: stat.students,
    }))
    .sort((a, b) => b.index - a.index)
    .slice(0, limit);
}

export function compareTextbooks(aId: string, bId: string): CompareReport {
  const statsA = textbookStats[aId];
  const statsB = textbookStats[bId];
  const rows: CompareRow[] = statsA.map((statA) => {
    const statB = statsB.find((stat) => stat.topicId === statA.topicId);
    return {
      topicId: statA.topicId,
      title: titleOf(statA.topicId),
      a: statA.mastery,
      b: statB?.mastery ?? 0,
    };
  });

  const winsA = rows.filter((row) => row.a > row.b).length;
  const leadA = [...rows].sort((x, y) => y.a - y.b - (x.a - x.b))[0] ?? null;
  const leadB = [...rows].sort((x, y) => x.a - x.b - (y.a - y.b))[0] ?? null;

  return {
    rows,
    avgDiff: rows.reduce((sum, row) => sum + (row.a - row.b), 0) / rows.length,
    winsA,
    winsB: rows.length - winsA,
    leadA: leadA && leadA.a - leadA.b > 0 ? leadA : null,
    leadB: leadB && leadB.b - leadB.a > 0 ? leadB : null,
  };
}

export function hourPlan(stats: TopicStat[] = averageStats()): HourPlanRow[] {
  const rows = stats.map((stat) => {
    const deficit = targetMastery - stat.mastery;
    const delta = Math.round(deficit * (0.5 + entWeightOf(stat.topicId)) * 3);
    const factHours = Math.round(stat.hours);
    return {
      topicId: stat.topicId,
      title: titleOf(stat.topicId),
      mastery: stat.mastery,
      factHours,
      recHours: Math.min(factHours + 3, Math.max(factHours - 2, factHours + delta)),
    };
  });

  let drift = rows.reduce((sum, row) => sum + (row.recHours - row.factHours), 0);
  [...rows]
    .sort((a, b) => b.mastery - a.mastery)
    .forEach((row) => {
      while (drift > 0 && row.recHours > row.factHours - 2) {
        row.recHours -= 1;
        drift -= 1;
      }
    });

  return rows
    .map(({ mastery, ...row }) => ({
      ...row,
      delta: row.recHours - row.factHours,
      projected: Math.min(0.95, Math.max(0, mastery + (row.recHours - row.factHours) * hourGain)),
    }))
    .sort((a, b) => b.delta - a.delta);
}

export interface SelectionWeights {
  mastery: number;
  weakCoverage: number;
  efficiency: number;
}

export interface RankedTextbook {
  textbook: Textbook;
  score: number;
  mastery: number;
  weakCoverage: number;
  efficiency: number;
}

export function rankTextbooks(weights: SelectionWeights): RankedTextbook[] {
  const weakIds = new Set(hardTopics(5).map((topic) => topic.topicId));
  const metrics = textbooks.map((textbook) => {
    const stats = textbookStats[textbook.id];
    const mastery = stats.reduce((sum, stat) => sum + stat.mastery, 0) / stats.length;
    const weakStats = stats.filter((stat) => weakIds.has(stat.topicId));
    const weakCoverage = weakStats.reduce((sum, stat) => sum + stat.mastery, 0) / weakStats.length;
    const perHour = stats.reduce((sum, stat) => sum + stat.mastery / stat.hours, 0) / stats.length;
    return { textbook, mastery, weakCoverage, perHour };
  });

  const bestPerHour = Math.max(...metrics.map((metric) => metric.perHour));
  const totalWeight = weights.mastery + weights.weakCoverage + weights.efficiency || 1;

  return metrics
    .map((metric) => {
      const efficiency = metric.perHour / bestPerHour;
      return {
        textbook: metric.textbook,
        mastery: metric.mastery,
        weakCoverage: metric.weakCoverage,
        efficiency,
        score:
          (weights.mastery * metric.mastery +
            weights.weakCoverage * metric.weakCoverage +
            weights.efficiency * efficiency) /
          totalWeight,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function buildAnalysisPrompt(
  book: Textbook,
  stats: TopicStat[],
  chapters: string,
): string {
  const payload = stats.map((stat) => ({
    тема: titleOf(stat.topicId),
    освоение: `${Math.round(stat.mastery * 100)}%`,
    ошибки: `${Math.round(stat.errorRate * 100)}%`,
    выборка: stat.students,
    часов: stat.hours,
    влияниеНаЕнт: `${Math.round(entWeightOf(stat.topicId) * 100)}%`,
  }));

  return [
    `Ты — аналитик учебных программ. Проанализируй учебник «${book.title}» (${book.publisher}, ${book.year}).`,
    "Сначала сопоставь структуру или фрагмент учебника с темами учебного плана, затем учти статистику тестов.",
    "",
    "Структура или фрагмент учебника:",
    chapters.trim(),
    "",
    "Статистика тестирования по темам:",
    JSON.stringify(payload, null, 2),
    "",
    "Верни СТРОГО JSON без пояснений по схеме:",
    '{"summary": "итог разбора в 2-3 предложениях", "strengths": ["сильные стороны", "..."], "weaknesses": ["слабые места", "..."], "hourPlan": [{"topic": "тема", "change": "+2 ч", "reason": "почему"}]}',
  ].join("\n");
}

export function localAnalysis(book: Textbook, stats: TopicStat[]): AiAnalysis {
  const ranked = [...stats].sort((a, b) => difficultyIndex(b) - difficultyIndex(a));
  const strong = [...stats].sort((a, b) => b.mastery - a.mastery).slice(0, 3);
  const weak = ranked.slice(0, 3);
  const avgMastery = stats.reduce((sum, stat) => sum + stat.mastery, 0) / stats.length;

  return {
    summary: `Локальный расчёт по «${book.publisher}»: среднее освоение ${Math.round(avgMastery * 100)}% при ${stats.reduce((sum, stat) => sum + stat.students, 0)} проверенных работах. Пики сложности — ${weak.map((stat) => titleOf(stat.topicId)).join(", ")}.`,
    strengths: strong.map(
      (stat) => `${titleOf(stat.topicId)} — освоение ${Math.round(stat.mastery * 100)}%`,
    ),
    weaknesses: weak.map(
      (stat) =>
        `${titleOf(stat.topicId)} — ошибки ${Math.round(stat.errorRate * 100)}%, освоение ${Math.round(stat.mastery * 100)}%`,
    ),
    hourPlan: hourPlan(stats)
      .filter((row) => row.delta !== 0)
      .slice(0, 4)
      .map((row) => ({
        topic: row.title,
        change: row.delta > 0 ? `+${row.delta} ч` : `${row.delta} ч`,
        reason:
          row.delta > 0
            ? `освоение ниже цели ${Math.round(targetMastery * 100)}%, тема опирается на цепочку зависимостей`
            : `освоение ${Math.round(row.projected * 100)}% — часы можно перебросить на пробелы`,
      })),
  };
}
