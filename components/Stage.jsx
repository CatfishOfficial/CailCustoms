"use client";

import { usePathname } from "next/navigation";

// Persistent center stage. Keying by pathname re-mounts on navigation so the
// `moduleIn` CSS animation replays — preserving the prototype's module-swap feel
// between storefront pages while URLs stay real and shareable.
export default function Stage({ children }) {
  const pathname = usePathname();
  return (
    <main className="stage" key={pathname}>
      {children}
    </main>
  );
}
