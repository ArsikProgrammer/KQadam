export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="brand">
          <svg width="26" height="22" viewBox="0 0 26 22" fill="none" aria-hidden="true">
            <rect x="1" y="13" width="6" height="8" rx="1.5" fill="#E8B04B" />
            <rect x="10" y="8" width="6" height="13" rx="1.5" fill="#E8B04B" />
            <rect x="19" y="1" width="6" height="20" rx="1.5" fill="#E8B04B" />
          </svg>
          <span className="brand-name">KADAM</span>
        </div>
        <p>KADAM · «қадам» — «шаг». Математика не прощает пропусков — мы показываем, где они.</p>
        <p className="footer-meta">Хакатон Data-Driven Curriculum · Қазақстан · 2026</p>
      </div>
    </footer>
  );
}
