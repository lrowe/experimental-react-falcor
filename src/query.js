// @flow
export type Primitive = string | number | boolean | null;
export type Key = Primitive;
export type Path = Key[];

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

const emptyPath: any = pathProxy([]);

function unwrapPathProxy<Base, Target, Value>(
  path: BranchPath<Base, Target> | LeafPath<Base, Value>
): Path {
  return (path: any).$path;
}

// Use this for dynamically building a path
export function traversePath<Base: Branch, Target: Branch, Descendant: Branch>(
  path: BranchPath<Base, Target>,
  traverser: (node: BranchPath<Base, Target>) => BranchPath<Base, Descendant>
): BranchPath<Base, Descendant> {
  return traverser(emptyPath);
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
}
