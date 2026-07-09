import { TONES, TONE_BG } from "@/lib/data";

export default function ToneField({ value, onChange }) {
  return (
    <label className="adm-field">
      <span>placeholder color (used when no image)</span>
      <div className="adm-tones">
        {TONES.map((t) => (
          <button
            key={t}
            type="button"
            className={`adm-tone ${value === t ? "on" : ""}`}
            style={{ backgroundImage: TONE_BG[t] }}
            onClick={() => onChange(t)}
            aria-label={t}
          />
        ))}
      </div>
    </label>
  );
}
