const navItems = [
  { id: "graph", label: "Граф тем" },
  { id: "diagnostics", label: "Диагностика" },
  { id: "methodist", label: "Методистам" },
  { id: "track", label: "Трек к ЕНТ" },
  { id: "how", label: "Как это работает" },
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <button className="brand" onClick={() => scrollTo("hero")} aria-label="KADAM — в начало">
          <svg width="26" height="22" viewBox="0 0 26 22" fill="none" aria-hidden="true">
            <rect x="1" y="13" width="6" height="8" rx="1.5" fill="#E8B04B" />
            <rect x="10" y="8" width="6" height="13" rx="1.5" fill="#E8B04B" />
            <rect x="19" y="1" width="6" height="20" rx="1.5" fill="#E8B04B" />
          </svg>
          <span className="brand-name">KADAM</span>
        </button>
        <nav className="header-nav">
          {navItems.map((item) => (
            <button key={item.id} className="nav-link" onClick={() => scrollTo(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>
        <button className="btn btn-primary header-cta" onClick={() => scrollTo("graph")}>
          Открыть демо
        </button>
      </div>
    </header>
  );
}
