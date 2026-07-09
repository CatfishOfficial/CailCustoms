export default function Field({ label, value, onChange, ph, area }) {
  return (
    <label className="adm-field">
      <span>{label}</span>
      {area ? (
        <textarea className="adm-area" value={value} onChange={(e) => onChange(e.target.value)} placeholder={ph} />
      ) : (
        <input className="adm-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={ph} />
      )}
    </label>
  );
}
