export const ACCENT_PALETTES = [
  ["#315EFB", "#17358F"],
  ["#7656E8", "#392078"],
  ["#E24A73", "#7D183A"],
  ["#F0753B", "#87330F"],
  ["#D79A12", "#725000"],
  ["#2AA76B", "#115B39"],
  ["#168FA5", "#0A4D5A"],
  ["#3F7CDB", "#193E78"],
  ["#A65DDF", "#55247E"],
  ["#C85A42", "#6D271C"],
] as const satisfies ReadonlyArray<readonly [string, string]>;

export function randomAccent(previous?: readonly [string, string]): [string, string] {
  const candidates = previous
    ? ACCENT_PALETTES.filter(([start, end]) => start !== previous[0] || end !== previous[1])
    : ACCENT_PALETTES;
  const palette = candidates[Math.floor(Math.random() * candidates.length)] ?? ACCENT_PALETTES[0];
  return [palette[0], palette[1]];
}
