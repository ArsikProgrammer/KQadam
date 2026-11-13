export interface EntBlock {
  id: string;
  title: string;
  /** Доля заданий профильной математики на ЕНТ, в процентах */
  share: number;
  topicIds: string[];
  hint: string;
}

export const entBlocks: EntBlock[] = [
  {
    id: "equations",
    title: "Уравнения и неравенства",
    share: 25,
    topicIds: ["linear-eq", "linear-sys", "fsu", "quadratic-eq", "interval-method", "trig-eq"],
    hint: "От линейных уравнений 6 класса до метода интервалов — самая плотная часть экзамена.",
  },
  {
    id: "functions",
    title: "Функции и графики",
    share: 20,
    topicIds: ["linear-fn", "quadratic-fn", "power-fn", "exp-log", "sequences"],
    hint: "Графики читаются только при полной цепочке: прямая → парабола → степенная → показательная.",
  },
  {
    id: "analysis",
    title: "Тригонометрия и анализ",
    share: 20,
    topicIds: ["trig", "trig-eq", "derivative", "integral"],
    hint: "Блок с самым высоким порогом входа — и с самым высоким потолком баллов.",
  },
  {
    id: "geometry",
    title: "Геометрия",
    share: 20,
    topicIds: ["geo-basics", "pythagoras", "polygons", "circle", "vectors", "stereo", "analytic-geo"],
    hint: "От площадей 5 класса до аналитической геометрии — чем ровнее база, тем стабильнее балл.",
  },
  {
    id: "data",
    title: "Данные и вероятность",
    share: 15,
    topicIds: ["stats-basics", "combinatorics", "probability"],
    hint: "Самый недооценённый блок: обычно решается быстрее всех, если закрыты доли и проценты.",
  },
];

/** Сквозная нить программы: первый пробел в цепочке даёт наибольшую просадку результата. */
export const entTrack: { topicId: string; milestone: string }[] = [
  { topicId: "fractions", milestone: "5 класс: доли" },
  { topicId: "rational", milestone: "6 класс: рациональные числа" },
  { topicId: "fsu", milestone: "7 класс: формулы сокращённого умножения" },
  { topicId: "quadratic-eq", milestone: "8 класс: квадратные уравнения" },
  { topicId: "power-fn", milestone: "9 класс: функции" },
  { topicId: "exp-log", milestone: "10 класс: показательные и логарифмы" },
  { topicId: "derivative", milestone: "11 класс: производная" },
  { topicId: "integral", milestone: "11 класс: интегралы" },
];
