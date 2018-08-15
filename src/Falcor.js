// @flow
import React, { Component, type Node } from "react";
import { type Query, type BranchPath, type Branch } from "./query.js";

export const { Provider, Consumer } = React.createContext((null: any));

const Falcor = <Root: Branch, Target: Branch, Result: {}>({
  query,
  path,
  children: render
}: {|
  query: Query<Root, Target, Result>,
  path: BranchPath<Root, Target>,
  children: (data: Result) => Node
|}): Node => <Consumer>{mediator => mediator(query, path, render)}</Consumer>;

export default Falcor;
