/**
 * Long, deliberate colour transition from the bright shop above into the
 * dark premium section below — white → mint → green → petrol → near-black.
 * A single tall gradient (no JS/scroll listeners) is the cheapest possible
 * way to make the shift feel scroll-linked: different stops simply enter
 * view as the user scrolls past.
 */
export function ColorTransition() {
  return (
    <div
      aria-hidden="true"
      className="relative h-[38vh] min-h-[260px] w-full md:h-[46vh]"
      style={{
        background:
          "linear-gradient(180deg, #f5f5f7 0%, #eefdf6 14%, #d9f5e7 28%, #a9e8cf 42%, #4fae86 58%, #1c5a48 72%, #0c2622 86%, #06110f 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(60% 50% at 30% 70%, rgba(22,198,106,0.25), transparent 70%), radial-gradient(50% 40% at 75% 40%, rgba(94,234,212,0.18), transparent 70%)",
        }}
      />
    </div>
  );
}
