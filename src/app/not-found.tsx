import "@/style/page/not-found.css";
export default function NotFound() {
  return (
    <section className="not-found-section">
      <div className="container">
        <div className="not-found-content">
          <span className="eyebrow">A LITTLE OFF THE MAP</span>
          <div className="not-found-number">
            4<span>◒</span>4
          </div>
          <h1>This encounter got away.</h1>
          <p>
            We couldn’t find that page. Your next discovery is still out there.
          </p>
          <div>
            <a className="button button-gold" href="/">
              Back to Home →
            </a>
            <a className="button button-blue" href="/pokedex">
              Explore Pokédex
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
