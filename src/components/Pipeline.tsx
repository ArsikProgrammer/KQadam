import { topics } from "../data/curriculum";

const steps = [
  {
    title: "Сбор сигналов",
    text: "Ошибки по темам, время на задание, результаты пробников, домашняя практика и темп класса.",
  },
  {
    title: "Граф знаний",
    text: `${topics.length} тем 5–11 классов связаны зависимостями: каждый пробел привязан к конкретным последствиям.`,
  },
  {
    title: "Модель риска",
    text: "Четыре фактора, веса и сигмоида. Учитель видит и процент, и вклад каждого фактора — без чёрного ящика.",
  },
  {
    title: "Решения",
    text: "Что повторить перед контрольной, где замедлиться, какие темы перенести — план на данных, а не на интуиции.",
  },
];

const signals = [
  "ошибки по темам",
  "время на задание",
  "результаты пробников",
  "домашняя практика",
  "темп класса",
];

export function Pipeline() {
  return (
    <section className="section section-alt" id="how">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Как это работает</p>
          <h2>От тетради до решения учителя</h2>
          <p className="section-lead">
            Платформа не заменяет учителя: она снимает с него догадки и
            показывает, где учебный час даст максимальный эффект.
          </p>
        </div>

        <div className="pipeline-grid">
          {steps.map((step, index) => (
            <article key={step.title} className="pipeline-step card">
              <span className="pipeline-num">{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>

        <div className="signals">
          <span>Данные, которые питают модель</span>
          <div className="chip-row">
            {signals.map((signal) => (
              <span key={signal} className="chip chip-static">{signal}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
