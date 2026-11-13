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

export interface AiCriterion {
  name: string;
  score: number;
  verdict: string;
}

export interface AiRecommendation {
  title: string;
  detail: string;
}

export interface AiAnalysis {
  summary: string;
  overallScore: number;
  criteria: AiCriterion[];
  strengths: string[];
  weaknesses: string[];
  recommendations: AiRecommendation[];
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
  const winsB = rows.filter((row) => row.b > row.a).length;
  const leadA = [...rows].sort((x, y) => y.a - y.b - (x.a - x.b))[0] ?? null;
  const leadB = [...rows].sort((x, y) => x.a - x.b - (y.a - y.b))[0] ?? null;

  return {
    rows,
    avgDiff: rows.reduce((sum, row) => sum + (row.a - row.b), 0) / rows.length,
    winsA,
    winsB,
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

const analysisCriteria = [
  "Соответствие школьной программе и ЕНТ — покрытие ключевых тем и влияние на результат экзамена",
  "Терминология — раскрыты ли термины и определения, точность формулировок",
  "Доступность изложения — понятно ли школьнику, есть ли объяснения и примеры",
  "Структура и логика глав — последовательность подачи, опора на предыдущие темы",
  "Практика и закрепление — достаточно ли заданий разных уровней",
  "Распределение часов — соответствует ли объём трудоёмкости тем",
];

export function buildAnalysisPrompt(book: Textbook, stats: TopicStat[]): string {
  const content = stats.map((stat) => {
    const topic = topicById.get(stat.topicId);
    return `${topic?.grade ?? "?"} класс, «${titleOf(stat.topicId)}» (сложность ${topic?.difficulty ?? "?"}/3): ${stat.hours} ч, освоение ${Math.round(stat.mastery * 100)}%, ошибки ${Math.round(stat.errorRate * 100)}%, влияние на ЕНТ ${Math.round(entWeightOf(stat.topicId) * 100)}%, выборка ${stat.students} уч.`;
  });

  return [
    `Ты — методист и аналитик учебных программ. Дай полноценный разбор учебника «${book.title}» (${book.publisher}, ${book.year}) как кандидата на внедрение в школе.`,
    "",
    "Разбор строится ТОЛЬКО на приведённых ниже результатах тестирования школьников по темам программы 5–11 классов. Ничего не выдумывай: все цифры в выводах бери из данных.",
    "",
    "Критерии разбора:",
    ...analysisCriteria.map((criterion, index) => `${index + 1}. ${criterion}`),
    "",
    `Результаты тестирования по всем ${stats.length} темам программы (данные школ):`,
    ...content,
    "",
    "Требования к ответу:",
    "- Пиши строго на русском языке, без иностранных слов и вставок.",
    "- В verdict, strengths, weaknesses и hourPlan ссылайся на конкретные темы и числа из данных.",
    "- hourPlan — от 4 до 7 пунктов по темам с наибольшим дефицитом освоения при высоком влиянии на ЕНТ; change в формате «+N ч».",
    "- Итоговая оценка отражает реальные показатели: низкое освоение и высокие ошибки снижают баллы.",
    "",
    "Верни СТРОГО JSON без пояснений по схеме:",
    '{"summary": "итог разбора на 3-4 предложения", "overallScore": 0, "criteria": [{"name": "критерий", "score": 0, "verdict": "вывод по критерию"}], "strengths": ["сильная сторона"], "weaknesses": ["слабое место"], "recommendations": [{"title": "заголовок", "detail": "что сделать"}], "hourPlan": [{"topic": "тема", "change": "+2 ч", "reason": "почему"}]}',
    "overallScore и score — целые числа 0..100. criteria — все 6 критериев выше, по порядку. verdict — 1-2 предложения. Работай только с темами из списка.",
  ].join("\n");
}
