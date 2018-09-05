// @flow
import range from "./range.js";
import {
  type JsonGraph,
  type JsonGraphEnvelope,
  mergeJsonGraphEnvelope
} from "falcor-json-graph";

export function mockLolomo(
  rows: number = 2,
  cols: number = 2,
  id: string = "ABC"
): JsonGraphEnvelope {
  const lolomo = { $type: "ref", value: ["lolomos", id] };
  const lolomos = {
    [id]: range(rows)
      .map(i => ({ $type: "ref", value: ["lists", `${id}${i}`] }))
      .reduce((acc, v, i) => ({ ...acc, [i]: v }), {})
  };
  const lists = range(rows)
    .map(i =>
      range(cols)
        .map(j => ({
          match: 0.95,
          artwork: {
            $type: "atom",
            value: { url: `url${i}.${j}`, key: "key" }
          },
          video: { $type: "ref", value: ["videos", i * cols + j] }
        }))
        .reduce((acc, v, j) => ({ ...acc, [j]: v }), {})
    )
    .reduce((acc, v, i) => ({ ...acc, [`${id}${i}`]: v }), {});
  const videos = range(rows * cols)
    .map(x => ({
      title: `title${Math.trunc(x / cols)} ${x % cols}`
    }))
    .reduce((acc, v, x) => ({ ...acc, [x]: v }), {});
  const jsonGraph = { lolomo, lolomos, lists, videos };
  const paths = [["lolomo", { length: rows }, { length: cols }, "title"]];
  return { jsonGraph, paths };
}

export function mockAbTests(): JsonGraphEnvelope {
  const abTests = { "0": false, "1": true };
  const jsonGraph: JsonGraph = { abTests };
  const paths: any = Object.keys(abTests).map(k => ["abTests", k]);
  return { jsonGraph, paths };
}

export default function mockData(): JsonGraphEnvelope {
  return [mockLolomo(10, 10), mockAbTests()].reduce((left, right) =>
    mergeJsonGraphEnvelope(left, right)
  );
}
