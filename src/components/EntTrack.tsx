import { entBlocks, entTrack } from "../data/ent";
import { topicById } from "../data/curriculum";

interface EntTrackProps {
  onFocusTopic: (id: string) => void;
}

export function EntTrack({ onFocusTopic }: EntTrackProps) {
  return (
    <section className="section" id="track">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Трек к ЕНТ</p>
          <h2>От долей пятого класса до производной</h2>
          <p className="section-lead">
            ЕНТ — это не отдельный предмет, а итог семилетней цепочки. Ниже —
            опорные узлы программы: провал в любом из них просаживает
            соответствующие блоки экзамена.
          </p>
        </div>

        <ol className="track-line">
          {entTrack.map((step) => {
            const topic = topicById.get(step.topicId)!;
            return (
              <li key={step.topicId}>
                <button className="track-card" onClick={() => onFocusTopic(step.topicId)}>
                  <span className="track-milestone">{step.milestone}</span>
                  <b>{topic.title}</b>
                  <span className="track-weight">
                    влияние на ЕНТ {Math.round(topic.entWeight * 100)}%
                  </span>
                  <span className="track-open">открыть в графе →</span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="ent-blocks">
          {entBlocks.map((block) => (
            <article key={block.id} className="ent-block card">
              <div className="ent-block-head">
                <h3>{block.title}</h3>
                <b>{block.share}% заданий</b>
              </div>
              <div className="bar-track">
                <div className="bar-fill bar-fill-gold" style={{ width: `${block.share * 4}%` }} />
              </div>
              <p>{block.hint}</p>
              <p className="ent-block-foot">
                {block.topicIds.length} тем графа отвечают за блок
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
