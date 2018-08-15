// @flow
import React, { type Node } from "react";
import Falcor from "./Falcor.js";
import { Query, traversePath, type PathTo, type Root } from "./graph.js";

// Eases traversal of nested type.
declare var VirtualRoot: Root;

function range(start: number, stop: number) {
  return Array(stop - start)
    .fill(start)
    .map((x, i) => x + i);
}

const query = new Query<
  // Better to declare result type explicitly here so that type errors show
  // in appropriate place. Becomes the React props type.
  {
    match: number,
    title: string,
    inTest: boolean,
    artwork: { key: string, url: string }
  },
  // Ideally would like to write: Root.listsById.$key.$index
  typeof VirtualRoot.listsById.$key.$index
>((base, root) => ({
  match: base.match,
  title: base.video.title,
  inTest: root.abTests[123],
  artwork: base.artwork
}));

const Romo = ({
  path
}: {|
  path: PathTo<typeof VirtualRoot.listsById.$key.$index>
|}): Node => (
  <Falcor query={query} path={path}>
    {({ title, match }) => (
      <div className="Romo">
        <h1>{title}</h1>
        <p>{match}</p>
      </div>
    )}
  </Falcor>
);

const Loromo = ({
  path
}: {|
  path: PathTo<typeof VirtualRoot.listsById.$key>
|}): Node => (
  <div className="Loromo">
    {range(0, 2).map(i => {
      // Here we traverse to a child in a callback to possibly support autocomplete.
      // (Not that I can get autocomplete to work in either Atom or VS Code...)
      // Alternatively could be written: traversePath(path, i)
      const child = traversePath(path, node => node[i]);
      return <Romo key={i} path={child} />;
    })}
  </div>
);

const Loloromo = ({
  path
}: {|
  path: PathTo<typeof VirtualRoot.lolomosById.$key>
|}): Node => (
  <div className="Loloromo">
    {range(0, 2).map(i => (
      <Loromo key={i} path={traversePath(path, node => node[i])} />
    ))}
  </div>
);

export default Loloromo;
