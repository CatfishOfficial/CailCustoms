export default function Ticker({ text }) {
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {Array.from({ length: 2 }).map((_, g) => (
          <div className="ticker-group" key={g}>
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i}>
                <b className="dot">●</b> {text}&nbsp;&nbsp;{" "}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
