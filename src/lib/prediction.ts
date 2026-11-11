export interface RiskInput {
  /** Доля усвоенных прямых предшественников темы, 0..1 */
  prerequisiteMastery: number;
  /** Покрытие всей цепочки предшественников, 0..1 */
  chainCoverage: number;
  /** Доля ошибок в работах последних недель, 0..1 */
  recentErrorRate: number;
  /** Выполнение плана практики, 0..1 */
  practiceCompletion: number;
}

export interface RiskFactor {
  id: string;
  label: string;
  /** Текущее значение фактора, 0..1 */
  value: number;
  /** Вклад фактора в итоговый скор риска */
  points: number;
}

export type RiskLevel = "low" | "medium" | "high";

export interface RiskReport {
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
}

const BASELINE = -1.85;

const factorDefs = [
  {
    id: "prerequisites",
    label: "Пробелы в прямых предшественниках",
    weight: 2.35,
    deficit: (input: RiskInput) => 1 - input.prerequisiteMastery,
  },
  {
    id: "chain",
    label: "Глубина пробела по цепочке",
    weight: 1.45,
    deficit: (input: RiskInput) => 1 - input.chainCoverage,
  },
  {
    id: "errors",
    label: "Ошибки в работах последних недель",
    weight: 1.6,
    deficit: (input: RiskInput) => input.recentErrorRate,
  },
  {
    id: "practice",
    label: "Недобор практики",
    weight: 1.15,
    deficit: (input: RiskInput) => 1 - input.practiceCompletion,
  },
] as const;

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

export function assessRisk(input: RiskInput): RiskReport {
  const factors: RiskFactor[] = factorDefs.map((def) => ({
    id: def.id,
    label: def.label,
    value: def.deficit(input),
    points: def.weight * def.deficit(input),
  }));

  const score = sigmoid(BASELINE + factors.reduce((sum, factor) => sum + factor.points, 0));

  return {
    score,
    level: score >= 0.66 ? "high" : score >= 0.38 ? "medium" : "low",
    factors,
  };
}
