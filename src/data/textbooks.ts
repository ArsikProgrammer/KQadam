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
    { topicId: "nat-ops", mastery: 0.82, errorRate: 0.15, students: 242, hours: 14 },
    { topicId: "fractions", mastery: 0.78, errorRate: 0.18, students: 242, hours: 12 },
    { topicId: "decimals", mastery: 0.74, errorRate: 0.22, students: 242, hours: 10 },
    { topicId: "negatives", mastery: 0.76, errorRate: 0.2, students: 241, hours: 8 },
    { topicId: "geo-basics", mastery: 0.73, errorRate: 0.22, students: 241, hours: 10 },
    { topicId: "divisibility", mastery: 0.68, errorRate: 0.27, students: 240, hours: 8 },
    { topicId: "powers", mastery: 0.66, errorRate: 0.28, students: 239, hours: 8 },
    { topicId: "rational", mastery: 0.62, errorRate: 0.29, students: 238, hours: 14 },
    { topicId: "proportions", mastery: 0.7, errorRate: 0.25, students: 237, hours: 8 },
    { topicId: "algebra-expr", mastery: 0.64, errorRate: 0.3, students: 237, hours: 10 },
    { topicId: "linear-eq", mastery: 0.71, errorRate: 0.24, students: 236, hours: 12 },
    { topicId: "parallel-angles", mastery: 0.63, errorRate: 0.31, students: 234, hours: 8 },
    { topicId: "int-powers", mastery: 0.6, errorRate: 0.33, students: 233, hours: 7 },
    { topicId: "fsu", mastery: 0.55, errorRate: 0.38, students: 231, hours: 8 },
    { topicId: "linear-sys", mastery: 0.63, errorRate: 0.31, students: 230, hours: 10 },
    { topicId: "linear-fn", mastery: 0.69, errorRate: 0.26, students: 229, hours: 10 },
    { topicId: "inequalities", mastery: 0.59, errorRate: 0.34, students: 228, hours: 8 },
    { topicId: "stats-basics", mastery: 0.72, errorRate: 0.23, students: 228, hours: 6 },
    { topicId: "roots", mastery: 0.58, errorRate: 0.35, students: 224, hours: 8 },
    { topicId: "quadratic-eq", mastery: 0.47, errorRate: 0.44, students: 222, hours: 12 },
    { topicId: "pythagoras", mastery: 0.62, errorRate: 0.32, students: 219, hours: 10 },
    { topicId: "quadratic-fn", mastery: 0.52, errorRate: 0.41, students: 218, hours: 8 },
    { topicId: "polygons", mastery: 0.57, errorRate: 0.36, students: 217, hours: 10 },
    { topicId: "circle", mastery: 0.53, errorRate: 0.39, students: 216, hours: 8 },
    { topicId: "similar", mastery: 0.52, errorRate: 0.4, students: 215, hours: 8 },
    { topicId: "irrational", mastery: 0.51, errorRate: 0.41, students: 215, hours: 8 },
    { topicId: "interval-method", mastery: 0.49, errorRate: 0.42, students: 214, hours: 8 },
    { topicId: "rational-eq", mastery: 0.5, errorRate: 0.42, students: 214, hours: 7 },
    { topicId: "sine-law", mastery: 0.46, errorRate: 0.45, students: 213, hours: 8 },
    { topicId: "vectors", mastery: 0.58, errorRate: 0.35, students: 213, hours: 7 },
    { topicId: "power-fn", mastery: 0.54, errorRate: 0.38, students: 213, hours: 8 },
    { topicId: "stereo-basics", mastery: 0.55, errorRate: 0.37, students: 213, hours: 10 },
    { topicId: "sequences", mastery: 0.57, errorRate: 0.36, students: 212, hours: 7 },
    { topicId: "exp-log", mastery: 0.44, errorRate: 0.47, students: 212, hours: 10 },
    { topicId: "trig", mastery: 0.41, errorRate: 0.49, students: 209, hours: 12 },
    { topicId: "combinatorics", mastery: 0.59, errorRate: 0.34, students: 208, hours: 8 },
    { topicId: "stereo", mastery: 0.45, errorRate: 0.46, students: 207, hours: 10 },
    { topicId: "trig-eq", mastery: 0.4, errorRate: 0.5, students: 206, hours: 10 },
    { topicId: "derivative", mastery: 0.38, errorRate: 0.52, students: 205, hours: 14 },
    { topicId: "integral", mastery: 0.37, errorRate: 0.52, students: 204, hours: 8 },
    { topicId: "analytic-geo", mastery: 0.43, errorRate: 0.47, students: 203, hours: 10 },
    { topicId: "complex", mastery: 0.48, errorRate: 0.43, students: 202, hours: 6 },
    { topicId: "probability", mastery: 0.56, errorRate: 0.37, students: 201, hours: 7 },
  ],
  mektep: [
    { topicId: "nat-ops", mastery: 0.85, errorRate: 0.12, students: 215, hours: 13 },
    { topicId: "fractions", mastery: 0.81, errorRate: 0.16, students: 214, hours: 11 },
    { topicId: "decimals", mastery: 0.79, errorRate: 0.19, students: 212, hours: 10 },
    { topicId: "negatives", mastery: 0.79, errorRate: 0.17, students: 212, hours: 8 },
    { topicId: "geo-basics", mastery: 0.75, errorRate: 0.21, students: 211, hours: 9 },
    { topicId: "divisibility", mastery: 0.72, errorRate: 0.23, students: 211, hours: 8 },
    { topicId: "powers", mastery: 0.69, errorRate: 0.26, students: 210, hours: 7 },
    { topicId: "rational", mastery: 0.68, errorRate: 0.26, students: 210, hours: 13 },
    { topicId: "proportions", mastery: 0.73, errorRate: 0.22, students: 209, hours: 8 },
    { topicId: "algebra-expr", mastery: 0.66, errorRate: 0.28, students: 209, hours: 9 },
    { topicId: "linear-eq", mastery: 0.66, errorRate: 0.28, students: 208, hours: 12 },
    { topicId: "parallel-angles", mastery: 0.65, errorRate: 0.29, students: 207, hours: 7 },
    { topicId: "int-powers", mastery: 0.64, errorRate: 0.3, students: 206, hours: 7 },
    { topicId: "fsu", mastery: 0.61, errorRate: 0.33, students: 205, hours: 9 },
    { topicId: "linear-sys", mastery: 0.62, errorRate: 0.32, students: 204, hours: 10 },
    { topicId: "linear-fn", mastery: 0.73, errorRate: 0.22, students: 203, hours: 10 },
    { topicId: "inequalities", mastery: 0.58, errorRate: 0.35, students: 203, hours: 8 },
    { topicId: "stats-basics", mastery: 0.74, errorRate: 0.22, students: 202, hours: 6 },
    { topicId: "roots", mastery: 0.54, errorRate: 0.39, students: 198, hours: 7 },
    { topicId: "quadratic-eq", mastery: 0.51, errorRate: 0.41, students: 196, hours: 11 },
    { topicId: "pythagoras", mastery: 0.6, errorRate: 0.33, students: 195, hours: 9 },
    { topicId: "quadratic-fn", mastery: 0.57, errorRate: 0.36, students: 194, hours: 9 },
    { topicId: "polygons", mastery: 0.59, errorRate: 0.34, students: 193, hours: 10 },
    { topicId: "circle", mastery: 0.55, errorRate: 0.37, students: 192, hours: 8 },
    { topicId: "similar", mastery: 0.54, errorRate: 0.38, students: 192, hours: 7 },
    { topicId: "irrational", mastery: 0.5, errorRate: 0.42, students: 191, hours: 7 },
    { topicId: "interval-method", mastery: 0.48, errorRate: 0.43, students: 191, hours: 8 },
    { topicId: "rational-eq", mastery: 0.49, errorRate: 0.42, students: 190, hours: 7 },
    { topicId: "sine-law", mastery: 0.47, errorRate: 0.44, students: 190, hours: 7 },
    { topicId: "vectors", mastery: 0.6, errorRate: 0.33, students: 190, hours: 7 },
    { topicId: "power-fn", mastery: 0.56, errorRate: 0.37, students: 190, hours: 8 },
    { topicId: "stereo-basics", mastery: 0.53, errorRate: 0.39, students: 190, hours: 10 },
    { topicId: "sequences", mastery: 0.58, errorRate: 0.35, students: 190, hours: 7 },
    { topicId: "exp-log", mastery: 0.46, errorRate: 0.45, students: 190, hours: 10 },
    { topicId: "trig", mastery: 0.44, errorRate: 0.46, students: 188, hours: 11 },
    { topicId: "combinatorics", mastery: 0.61, errorRate: 0.32, students: 188, hours: 8 },
    { topicId: "stereo", mastery: 0.44, errorRate: 0.46, students: 188, hours: 9 },
    { topicId: "trig-eq", mastery: 0.41, errorRate: 0.49, students: 187, hours: 9 },
    { topicId: "derivative", mastery: 0.42, errorRate: 0.48, students: 186, hours: 13 },
    { topicId: "integral", mastery: 0.39, errorRate: 0.51, students: 185, hours: 7 },
    { topicId: "analytic-geo", mastery: 0.42, errorRate: 0.48, students: 185, hours: 9 },
    { topicId: "complex", mastery: 0.46, errorRate: 0.45, students: 184, hours: 5 },
    { topicId: "probability", mastery: 0.58, errorRate: 0.35, students: 183, hours: 7 },
  ],
  nurlan: [
    { topicId: "nat-ops", mastery: 0.77, errorRate: 0.19, students: 188, hours: 15 },
    { topicId: "fractions", mastery: 0.72, errorRate: 0.24, students: 188, hours: 12 },
    { topicId: "decimals", mastery: 0.7, errorRate: 0.25, students: 186, hours: 11 },
    { topicId: "negatives", mastery: 0.74, errorRate: 0.22, students: 186, hours: 9 },
    { topicId: "geo-basics", mastery: 0.71, errorRate: 0.24, students: 186, hours: 10 },
    { topicId: "divisibility", mastery: 0.65, errorRate: 0.29, students: 185, hours: 8 },
    { topicId: "powers", mastery: 0.64, errorRate: 0.3, students: 185, hours: 8 },
    { topicId: "rational", mastery: 0.59, errorRate: 0.33, students: 185, hours: 14 },
    { topicId: "proportions", mastery: 0.67, errorRate: 0.27, students: 185, hours: 9 },
    { topicId: "algebra-expr", mastery: 0.62, errorRate: 0.32, students: 184, hours: 10 },
    { topicId: "linear-eq", mastery: 0.74, errorRate: 0.21, students: 184, hours: 13 },
    { topicId: "parallel-angles", mastery: 0.64, errorRate: 0.3, students: 183, hours: 8 },
    { topicId: "int-powers", mastery: 0.58, errorRate: 0.35, students: 183, hours: 7 },
    { topicId: "fsu", mastery: 0.52, errorRate: 0.41, students: 182, hours: 7 },
    { topicId: "linear-sys", mastery: 0.66, errorRate: 0.28, students: 182, hours: 11 },
    { topicId: "linear-fn", mastery: 0.64, errorRate: 0.3, students: 181, hours: 11 },
    { topicId: "inequalities", mastery: 0.61, errorRate: 0.32, students: 181, hours: 8 },
    { topicId: "stats-basics", mastery: 0.69, errorRate: 0.26, students: 180, hours: 7 },
    { topicId: "roots", mastery: 0.63, errorRate: 0.31, students: 179, hours: 9 },
    { topicId: "quadratic-eq", mastery: 0.56, errorRate: 0.37, students: 178, hours: 12 },
    { topicId: "pythagoras", mastery: 0.66, errorRate: 0.28, students: 177, hours: 10 },
    { topicId: "quadratic-fn", mastery: 0.49, errorRate: 0.43, students: 176, hours: 8 },
    { topicId: "polygons", mastery: 0.55, errorRate: 0.37, students: 176, hours: 10 },
    { topicId: "circle", mastery: 0.51, errorRate: 0.41, students: 175, hours: 8 },
    { topicId: "similar", mastery: 0.5, errorRate: 0.42, students: 175, hours: 8 },
    { topicId: "irrational", mastery: 0.54, errorRate: 0.38, students: 175, hours: 8 },
    { topicId: "interval-method", mastery: 0.53, errorRate: 0.39, students: 175, hours: 9 },
    { topicId: "rational-eq", mastery: 0.52, errorRate: 0.4, students: 174, hours: 8 },
    { topicId: "sine-law", mastery: 0.45, errorRate: 0.46, students: 174, hours: 8 },
    { topicId: "vectors", mastery: 0.56, errorRate: 0.37, students: 174, hours: 7 },
    { topicId: "power-fn", mastery: 0.5, errorRate: 0.42, students: 174, hours: 8 },
    { topicId: "stereo-basics", mastery: 0.52, errorRate: 0.4, students: 173, hours: 9 },
    { topicId: "sequences", mastery: 0.55, errorRate: 0.37, students: 173, hours: 8 },
    { topicId: "exp-log", mastery: 0.52, errorRate: 0.39, students: 174, hours: 11 },
    { topicId: "trig", mastery: 0.47, errorRate: 0.44, students: 172, hours: 12 },
    { topicId: "combinatorics", mastery: 0.56, errorRate: 0.37, students: 172, hours: 8 },
    { topicId: "stereo", mastery: 0.43, errorRate: 0.47, students: 171, hours: 10 },
    { topicId: "trig-eq", mastery: 0.42, errorRate: 0.48, students: 171, hours: 11 },
    { topicId: "derivative", mastery: 0.36, errorRate: 0.55, students: 170, hours: 15 },
    { topicId: "integral", mastery: 0.34, errorRate: 0.55, students: 169, hours: 9 },
    { topicId: "analytic-geo", mastery: 0.41, errorRate: 0.49, students: 169, hours: 10 },
    { topicId: "complex", mastery: 0.5, errorRate: 0.42, students: 168, hours: 6 },
    { topicId: "probability", mastery: 0.53, errorRate: 0.39, students: 168, hours: 7 },
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
