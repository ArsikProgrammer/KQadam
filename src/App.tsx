import { useState } from "react";
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
