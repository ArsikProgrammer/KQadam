import { topics } from "../data/curriculum";
import type { BookContext } from "../data/bookContext";

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
}

const analysisCriteria = [
  "Соответствие школьной программе и ЕНТ — полнота покрытия тем программы и подготовка к экзамену",
  "Терминология — раскрыты ли термины и определения, точность формулировок",
  "Доступность изложения — понятно ли школьнику, есть ли объяснения и примеры",
  "Структура и логика глав — последовательность подачи, опора на предыдущие темы",
  "Практика и закрепление — достаточно ли заданий разных уровней",
];

export function buildAnalysisPrompt(book: BookContext): string {
  const program = topics
    .filter((topic) => topic.grade === 5)
    .map(
      (topic) =>
        `5 класс, «${topic.title}»: ${topic.summary} (влияние на ЕНТ ${Math.round(topic.entWeight * 100)}%)`,
    );

  return [
    `Ты — методист. Дай разбор реального учебника «${book.title}» (${book.authors}, ${book.publisher}, ${book.year}${book.isbn ? `, ISBN ${book.isbn}` : ""}, ${book.pages}).`,
    "",
    "Разбор строится ТОЛЬКО на приведённых ниже данных: структуре и содержании реального издания и программе 5 класса. Ничего не выдумывай, не приписывай книге того, чего нет в данных.",
    "",
    "Критерии разбора:",
    ...analysisCriteria.map((criterion, index) => `${index + 1}. ${criterion}`),
    "",
    "Структура реального издания (прочитано из книги):",
    ...book.structure.map((line) => `- ${line}`),
    ...book.contents.map((line) => `- Содержание: ${line}`),
    "",
    "Программа 5 класса (для оценки полноты покрытия):",
    ...program,
    "",
    "Требования к ответу:",
    "- Пиши строго на русском языке, без иностранных слов и вставок.",
    "- В выводах ссылайся на конкретные разделы и особенности книги из данных.",
    "",
    "Верни СТРОГО JSON без пояснений по схеме:",
    '{"summary": "итог разбора на 3-4 предложения", "overallScore": 0, "criteria": [{"name": "критерий", "score": 0, "verdict": "вывод по критерию"}], "strengths": ["сильная сторона"], "weaknesses": ["слабое место"], "recommendations": [{"title": "заголовок", "detail": "что сделать"}]}',
    "overallScore и score — целые числа 0..100. criteria — все 5 критериев выше, по порядку. verdict — 1-2 предложения.",
  ].join("\n");
}
