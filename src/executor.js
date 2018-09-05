// @flow
import React, { type Node, type ComponentType } from "react";
import {
  type Query,
  type BranchPath,
  type Branch,
  unwrapPathProxy
} from "./query.js";
import { type Model } from "falcor";
import { type Executor } from "./Falcor.js";

const cache = {};

class ModelExecutor {
  model: Model;
  constructor(model: Model): void {
    this.model = model;
  }
  run<Root: Branch, Target: Branch, Result: {}>(
    query: Query<Root, Target, Result>,
    path: BranchPath<Root, Target>
  ): ?Result {
    const hash = executeQueryHash(query, path);
    const existing = cache[hash];
    if (existing) {
      return existing;
    }
    const resolved = query.resolve(path);
    let hasValue = false;
    let hasError = false;
    let value;
    let error;
    let note;
    let resolve;
    let reject;
    this.model
      .boxValues()
      .get(...Object.values(resolved))
      .subscribe(
        v => {
          const result = query.result(path, v.json);
          if (resolve !== undefined) {
            delete cache[hash];
            return resolve(result);
          }
          hasValue = true;
          value = result;
        },
        e => {
          if (reject !== undefined) {
            delete cache[hash];
            return reject(e);
          }
          hasError = true;
          error = e;
        }
      );
    if (hasValue) {
      return (value: any);
    }
    if (hasError) {
      throw error;
    }
    const promise = new Promise((promiseResolve, promiseReject) => {
      resolve = promiseResolve;
      reject = promiseReject;
    });
    cache[hash] = promise;
    throw promise;
  }
}

const executeQueryHash = <Root: Branch, Target: Branch, Result: {}>(
  query: Query<Root, Target, Result>,
  path: BranchPath<Root, Target>
): string => {
  return unwrapPathProxy(path).join(",");
};

export default function modelExecutor(model: Model): Executor {
  return new ModelExecutor(model);
}
