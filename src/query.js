// @flow
import {
  type Primitive,
  type Path,
  type JsonGraphLeaf,
  type JsonGraphNode,
  type JsonGraph
} from "falcor-json-graph";

// Types for defining your JsonGraph schema.
export type Atom<T> = { +$type: "atom", +value: T };
export type Ref<T> = T; // treat same as branch for now
export type List<V> = {|
  +$type?: empty,
  +length: number,
  +$index: V,
  +[index: number]: V
|};
export type KeyMap<V, K: Primitive = string> = {|
  +$type?: empty,
  +$key: V,
  +[key: K]: V
|};

export type Branch = {};

// Path types
export type LeafPath<Base: Branch, Value> = {||};
export type BranchPath<Base: Branch, Target: Branch> = $ObjMap<
  Target,
  ((child: empty) => empty) &
    (<V: Primitive>(child: V) => LeafPath<Base, V>) &
    (<V>(child: Atom<V>) => LeafPath<Base, V>) &
    (<Child: Branch>(child: Child) => BranchPath<Base, Child>)
>;

const pathProxyHandler = {
  get(obj, prop) {
    switch (prop) {
      case "$path":
        return obj[prop];
      default:
        return new Proxy(
          { $base: obj.$base, $path: obj.$path.concat(prop) },
          pathProxyHandler
        );
    }
  }
};

export function pathProxy<Base: Branch>(path: Path): BranchPath<Base, Base> {
  // $base is only tracked for debugging purposes, but may be useful
  // for a runtime schema introspection at development time.
  return new Proxy({ $base: path, $path: path }, pathProxyHandler);
}

export function unwrapPathProxy<Base, Target, Value>(
  path: BranchPath<Base, Target> | LeafPath<Base, Value>
): Path {
  return (path: any).$path;
}

// Use this for dynamically building a path
export function traversePath<Base: Branch, Target: Branch, Descendant: Branch>(
  path: BranchPath<Base, Target>,
  traverser: (node: BranchPath<Base, Target>) => BranchPath<Base, Descendant>
): BranchPath<Base, Descendant> {
  return traverser(path);
}

export opaque type ResolvedPath<Root: Branch, Value>: Path = Path;

export type Executor = <Root: Branch, Result: {}>(
  nameToPath: $ObjMap<Result, <V>(leaf: V) => ResolvedPath<Root, V>>
) => Promise<Result> | Result;

// Query for a fixed set of values from a point in the graph.
export class Query<Root: Branch, Base: Branch, Result: {}> {
  baseToLeafPaths: Array<[string, Path]>;
  rootToLeafPaths: Array<[string, Path]>;

  constructor(
    spec: (
      base: BranchPath<Base, Base>,
      root: BranchPath<Root, Root>
    ) => $ObjMap<Result, <V>(leaf: V) => LeafPath<Base, V> | LeafPath<Root, V>>
  ): void {
    const base: any = pathProxy(["$base"]);
    const root: any = pathProxy([]);
    const baseToLeafPaths = (this.baseToLeafPaths = []);
    const rootToLeafPaths = (this.rootToLeafPaths = []);
    for (const [name, path] of Object.entries(spec(base, root))) {
      const unwrapped = unwrapPathProxy(path);
      if (unwrapped[0] === "$base") {
        baseToLeafPaths.push([name, unwrapped.slice(1)]);
      } else {
        rootToLeafPaths.push([name, unwrapped]);
      }
    }
  }

  resolve(
    path: BranchPath<Root, Base>
  ): $ObjMap<Result, <V>(leaf: V) => ResolvedPath<Root, V>> {
    const basePath = unwrapPathProxy(path);
    const resolved = {};
    for (const [name, path] of this.rootToLeafPaths) {
      resolved[name] = path;
    }
    for (const [name, path] of this.baseToLeafPaths) {
      resolved[name] = [...basePath, ...path];
    }
    return resolved;
  }

  result(pathIn: BranchPath<Root, Base>, root: any): ?Result {
    const basePath = unwrapPathProxy(pathIn);
    const res = traverseJsonGraphOnce(root, basePath);
    if (!res || res.path.length < basePath.length) {
      return null;
    }
    const { path: foundBasePath, value: base } = res;
    if (!isBranch(base)) {
      return null;
    }
    const result = {};
    for (const [name, path] of this.rootToLeafPaths) {
      const res = traverseJsonGraphOnce(root, path);
      if (!res || res.path.length < path.length) {
        return null;
      }
      const value = res.value;
      result[name] =
        typeof value !== "object" || value === null ? value : value.value;
    }
    for (const [name, path] of this.baseToLeafPaths) {
      const res = traverseJsonGraphOnce(base, path);
      if (!res || res.path.length < path.length) {
        return null;
      }
      const value = res.value;
      result[name] =
        typeof value !== "object" || value === null ? value : value.value;
    }
    return (result: any);
  }
}

function isBranch(node: JsonGraphNode): boolean %checks {
  return typeof node === "object" && node !== null && node.$type === undefined;
}

function traverseJsonGraphOnce(
  root: JsonGraph,
  path: Path
): ?{ path: Path, value: JsonGraphLeaf } {
  let branch = root;
  let index = 0;
  while (index < path.length) {
    const key = path[index];
    ++index;
    const value = branch[String(key)];
    if (value === undefined) {
      return null;
    }
    if (isBranch(value)) {
      branch = value;
      continue;
    }
    return {
      path: index === path.length ? path : path.slice(0, index),
      value
    };
  }
  return {
    path: index === path.length ? path : path.slice(0, index),
    value: (branch: any)
  };
  //throw new Error(`branch path requested: ${JSON.stringify(path)}`);
}
