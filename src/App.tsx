import { useLayoutEffect, useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { TopicGraph } from "./components/TopicGraph";
import { RiskLab } from "./components/RiskLab";
import { MethodistDesk } from "./components/MethodistDesk";
import { EntTrack } from "./components/EntTrack";
import { Pipeline } from "./components/Pipeline";
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
        <MethodistDesk />
        <EntTrack onFocusTopic={setFocusTopicId} />
        <Pipeline />
      </main>
      <Footer />
    </>
  );
}
