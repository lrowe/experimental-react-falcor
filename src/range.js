// @flow
export default function range(start: number, stop?: number): number[] {
  if (stop === undefined) {
    stop = start;
    start = 0;
  }
  return Array(stop - start)
    .fill(start)
    .map((x, i) => x + i);
}
