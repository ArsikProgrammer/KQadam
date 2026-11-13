import { useLayoutEffect, useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { TopicGraph } from "./components/TopicGraph";
import { RiskLab } from "./components/RiskLab";
import { EntTrack } from "./components/EntTrack";
import { AiPanel } from "./components/AiPanel";
import { Footer } from "./components/Footer";

export default function App() {
  const [focusTopicId, setFocusTopicId] = useState<string | null>(null);

  useLayoutEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(".section .container > *"),
    );
    nodes.forEach((node) => node.classList.add("reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <TopicGraph focusTopicId={focusTopicId} />
        <RiskLab />
        <EntTrack onFocusTopic={setFocusTopicId} />
        <section className="section section-alt" id="ai">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">AI-разбор учебников</p>
              <h2>Реальные учебники — под лупой модели</h2>
              <p className="section-lead">
                Структура и содержание изданий Атамұры и Мектеп прочитаны из
                оригинальных PDF. Модель разбирает их по пяти критериям; готовые
                разборы сохранены заранее, кнопка ниже запускает свежий пересчёт.
              </p>
            </div>
            <AiPanel />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
