import { Suspense } from "react";
import CompareContent from "./CompareContent";

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <section className="bg-[#000000] px-6 py-32 text-center text-white">
          Vergleich wird geladen…
        </section>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
