// @flow
import React, { type Node, type ComponentType } from "react";
import { type Query, type BranchPath, type Branch } from "./query.js";
import { createCache, createResource } from "simple-cache-provider";

export let cache;
function initCache() {
  cache = createCache(initCache);
}
initCache();

const executeQuery = <Root: Branch, Target: Branch, Result: {}>({
  query,
  path
}: {
  query: Query<Root, Target, Result>,
  path: BranchPath<Root, Target>
}): Promise<Result> => {
  const resolved = query.resolve(path);
  const props = {};
  for (const [name, path] of Object.entries(resolved)) {
    props[name] = JSON.stringify(path);
  }
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 500, (props: any));
  });
};

const executeQueryHash = <Root: Branch, Target: Branch, Result: {}>({
  query,
  path
}: {
  query: Query<Root, Target, Result>,
  path: BranchPath<Root, Target>
}): string => {
  return (path: any).$path.join(",");
};

const ExecuteQueryResource = createResource(executeQuery, executeQueryHash);

const executor = <Root: Branch, Target: Branch, Result: {}>(
  query: Query<Root, Target, Result>,
  path: BranchPath<Root, Target>
): ?Result => ExecuteQueryResource.read(cache, { query, path });

export default executor;
