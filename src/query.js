// @flow
export type Primitive = string | number | boolean | null;
export type Key = Primitive;

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
      case "$base":
        return obj[prop];
      default:
        return new Proxy(
          { $base: obj.$base, $path: obj.$path.concat(prop) },
          pathProxyHandler
        );
    }
  }
};

declare function pathProxy<Base: Branch>($base?: Key[]): BranchPath<Base, Base>;
declare function pathProxy<Base: Branch, Target: Branch>(
  $base: Key[],
  $path: Key[]
): BranchPath<Base, Target>;
export function pathProxy($base = [], $path = []) {
  return new Proxy({ $base, $path }, pathProxyHandler);
}

const emptyPath: any = pathProxy();

// Use this for dynamically building a path
export function traversePath<Base: Branch, Target: Branch, Descendant: Branch>(
  path: BranchPath<Base, Target>,
  traverser: (
    node: BranchPath<Target, Target>
  ) => BranchPath<Target, Descendant>
): BranchPath<Base, Descendant> {
  const result = traverser(emptyPath);
  return pathProxy((path: any).$base, (result: any).$path);
}

// Query for a fixed set of values from a point in the graph.
export class Query<Root, Base, Result: {}> {
  spec: (
    base: BranchPath<Base, Base>,
    root: BranchPath<Root, Root>
  ) => $ObjMap<Result, <V>(leaf: V) => LeafPath<Base, V> | LeafPath<Root, V>>;
  constructor(spec: $PropertyType<this, "spec">): void {
    this.spec = spec;
  }
  execute(path: BranchPath<Root, Base>): Result {
    throw new Error("not implemented");
  }
}
