// Drops a JSON-LD <script> block into the page <head>.
// Server-component safe — no client JS needed.
export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
