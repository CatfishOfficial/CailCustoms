// Shared order/idea constants + pure helpers. Safe for client and server.

export const ORDER_STATUSES = ["new", "contacted", "confirmed", "shipped", "done", "cancelled"];
export const IDEA_STATUSES = ["new", "contacted", "done"];

// A cart line is identified by product + chosen size, so the same product in
// two sizes is two lines.
export const lineKey = (id, size) => `${id}::${size || ""}`;

// The human-readable order summary. Used verbatim in three places: the
// checkout preview, the mailto fallback body, and the staff orders page —
// so the customer, the email, and the inbox always say the same thing.
export const composeOrderText = (items) =>
  (items || [])
    .map(
      (it) =>
        `${it.qty}× ${(it.name || "").toLowerCase()}${it.size ? ` (size ${String(it.size).toLowerCase()})` : ""} — ${it.price}`
    )
    .join("\n");
