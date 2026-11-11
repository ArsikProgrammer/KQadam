export interface Textbook {
  id: string;
  title: string;
  publisher: string;
  year: number;
}

export interface TopicStat {
  topicId: string;
  /** Средний процент освоения темы по тестам, 0..1 */
  mastery: number;
  /** Доля ошибок в заданиях по теме, 0..1 */
  errorRate: number;
  /** Размер выборки школьников */
  students: number;
  /** Фактические учебные часы по рабочей программе */
  hours: number;
}

export const textbooks: Textbook[] = [
  { id: "atamura", title: "Математика, 5–11", publisher: "Атамұра", year: 2023 },
  { id: "mektep", title: "Математика, 5–11", publisher: "Мектеп", year: 2022 },
  { id: "nurlan", title: "Математика, 5–11", publisher: "Нұрлан", year: 2024 },
];

export const textbookStats: Record<string, TopicStat[]> = {
  atamura: [
    { topicId: "fractions", mastery: 0.78, errorRate: 0.18, students: 242, hours: 12 },
    { topicId: "decimals", mastery: 0.74, errorRate: 0.22, students: 242, hours: 10 },
    { topicId: "rational", mastery: 0.62, errorRate: 0.29, students: 238, hours: 14 },
    { topicId: "linear-eq", mastery: 0.71, errorRate: 0.24, students: 236, hours: 12 },
    { topicId: "fsu", mastery: 0.55, errorRate: 0.38, students: 231, hours: 8 },
    { topicId: "linear-fn", mastery: 0.69, errorRate: 0.26, students: 229, hours: 10 },
    { topicId: "roots", mastery: 0.58, errorRate: 0.35, students: 224, hours: 8 },
    { topicId: "quadratic-eq", mastery: 0.47, errorRate: 0.44, students: 222, hours: 12 },
    { topicId: "quadratic-fn", mastery: 0.52, errorRate: 0.41, students: 218, hours: 8 },
    { topicId: "exp-log", mastery: 0.44, errorRate: 0.47, students: 212, hours: 10 },
    { topicId: "trig", mastery: 0.41, errorRate: 0.49, students: 209, hours: 12 },
    { topicId: "derivative", mastery: 0.38, errorRate: 0.52, students: 205, hours: 14 },
  ],
  mektep: [
    { topicId: "fractions", mastery: 0.81, errorRate: 0.16, students: 214, hours: 11 },
    { topicId: "decimals", mastery: 0.79, errorRate: 0.19, students: 212, hours: 10 },
    { topicId: "rational", mastery: 0.68, errorRate: 0.26, students: 210, hours: 13 },
    { topicId: "linear-eq", mastery: 0.66, errorRate: 0.28, students: 208, hours: 12 },
    { topicId: "fsu", mastery: 0.61, errorRate: 0.33, students: 205, hours: 9 },
    { topicId: "linear-fn", mastery: 0.73, errorRate: 0.22, students: 203, hours: 10 },
    { topicId: "roots", mastery: 0.54, errorRate: 0.39, students: 198, hours: 7 },
    { topicId: "quadratic-eq", mastery: 0.51, errorRate: 0.41, students: 196, hours: 11 },
    { topicId: "quadratic-fn", mastery: 0.57, errorRate: 0.36, students: 194, hours: 9 },
    { topicId: "exp-log", mastery: 0.46, errorRate: 0.45, students: 190, hours: 10 },
    { topicId: "trig", mastery: 0.44, errorRate: 0.46, students: 188, hours: 11 },
    { topicId: "derivative", mastery: 0.42, errorRate: 0.48, students: 186, hours: 13 },
  ],
  nurlan: [
    { topicId: "fractions", mastery: 0.72, errorRate: 0.24, students: 188, hours: 12 },
    { topicId: "decimals", mastery: 0.7, errorRate: 0.25, students: 186, hours: 11 },
    { topicId: "rational", mastery: 0.59, errorRate: 0.33, students: 185, hours: 14 },
    { topicId: "linear-eq", mastery: 0.74, errorRate: 0.21, students: 184, hours: 13 },
    { topicId: "fsu", mastery: 0.52, errorRate: 0.41, students: 182, hours: 7 },
    { topicId: "linear-fn", mastery: 0.64, errorRate: 0.3, students: 181, hours: 11 },
    { topicId: "roots", mastery: 0.63, errorRate: 0.31, students: 179, hours: 9 },
    { topicId: "quadratic-eq", mastery: 0.56, errorRate: 0.37, students: 178, hours: 12 },
    { topicId: "quadratic-fn", mastery: 0.49, errorRate: 0.43, students: 176, hours: 8 },
    { topicId: "exp-log", mastery: 0.52, errorRate: 0.39, students: 174, hours: 11 },
    { topicId: "trig", mastery: 0.47, errorRate: 0.44, students: 172, hours: 12 },
    { topicId: "derivative", mastery: 0.36, errorRate: 0.55, students: 170, hours: 15 },
  ],
};

/** Целевой уровень освоения, который стремится вывести перераспределение часов */
export const targetMastery = 0.75;

/** Отдача одного дополнительного часа, в долях освоения */
export const hourGain = 0.045;

export function textbookById(id: string): Textbook {
  return textbooks.find((book) => book.id === id) ?? textbooks[0];
}

export function statsByTopic(): Map<string, TopicStat[]> {
  const grouped = new Map<string, TopicStat[]>();
  Object.values(textbookStats).forEach((stats) => {
    stats.forEach((stat) => {
      grouped.set(stat.topicId, [...(grouped.get(stat.topicId) ?? []), stat]);
    });
  });
  return grouped;
}
