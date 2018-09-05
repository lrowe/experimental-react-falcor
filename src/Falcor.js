// @flow
import React, {
  Fragment,
  Component,
  type Context,
  type ComponentType,
  type ElementType
} from "react";
import { type Query, type BranchPath, type Branch } from "./query.js";

export type Executor = {
  run<Root: Branch, Target: Branch, Result: {}>(
    query: Query<Root, Target, Result>,
    path: BranchPath<Root, Target>
  ): ?Result
};

const context: Context<Executor> = React.createContext({
  run() {
    throw new Error("Must provide an executor");
  }
});
export const { Provider, Consumer } = context;

const Falcor = <Root: Branch, Target: Branch, Result: {}>({
  query,
  path,
  shortcircuit,
  children: Render
}: {|
  query: Query<Root, Target, Result>,
  path: BranchPath<Root, Target>,
  shortcircuit?: Node,
  children: ComponentType<Result>
|}): * => (
  <Consumer>
    {executor => {
      const result = executor.run(query, path);
      if (!result) {
        // $FlowFixMe: not sure why this is not working
        return shortcircuit;
      }
      return <Render {...result} />;
    }}
  </Consumer>
);

export default Falcor;
