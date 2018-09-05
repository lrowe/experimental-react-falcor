// @flow
import React, { type Node } from "react";
// $FlowFixMe: missing type definition
import { Placeholder } from "react";
import Falcor from "./Falcor.js";
import { Query, traversePath, type PathTo, type Root } from "./graph.js";
import range from "./range.js";

// Eases traversal of nested type.
declare var VirtualRoot: Root;

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
  inTest: root.abTests[1],
  artwork: base.artwork
}));

const Romo = ({
  path
}: {|
  path: PathTo<typeof VirtualRoot.listsById.$key.$index>
|}): Node => (
  <Placeholder delayMs={100} fallback={<span>timeout</span>}>
    <Falcor query={query} path={path}>
      {({ title, match }) => (
        <div
          className="Romo"
          style={{
            background: "White",
            display: "inline-block",
            margin: "5px",
            padding: "5px"
          }}
        >
          <h1>{title}</h1>
          <p>{match}</p>
        </div>
      )}
    </Falcor>
  </Placeholder>
);

const Loromo = ({
  path
}: {|
  path: PathTo<typeof VirtualRoot.listsById.$key>
|}): Node => (
  <div className="Loromo" style={{ background: "LightGrey", margin: "5px" }}>
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
  path,
  rowsToShow
}: {|
  path: PathTo<typeof VirtualRoot.lolomosById.$key>,
  rowsToShow: number
|}): Node => (
  <div className="Loloromo">
    {range(0, rowsToShow).map(i => (
      <Loromo key={i} path={traversePath(path, node => node[i])} />
    ))}
  </div>
);

export default Loloromo;
