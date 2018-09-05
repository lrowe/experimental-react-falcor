"use strict";
import {
  type IDataSource,
  type PathSet,
  type Path,
  type JsonGraphEnvelope,
  type JsonGraphNode
} from "falcor-json-graph";
import { Observable } from "falcor-observable";

const { now } = Date;

const timeouts = [];

// setTimeout does not preserver ordering...
function orderedSetTimeout(cb, time, ...args) {
  const due = now() + time;
  const record = [due, cb, args];
  const pos = timeouts.findIndex(([d]) => d > due);
  if (timeouts.length === 0) {
    timeouts.push(record);
  } else {
    let pos = timeouts.length;
    while (pos > 0 && timeouts[pos - 1][0] > due) {
      --i;
    }
    timeouts.splice(pos, 0, record);
  }
  setTimeout(processTimeouts, time);
}

function processTimeouts() {
  const ts = now();
  while (timeouts.length > 0) {
    const [due, cb, args] = timeouts[0];
    if (due > ts) {
      return;
    }
    timeouts.shift();
    cb(...args);
  }
}

let idCounter = 0;

export function delay(time) {
  // const id = idCounter++;
  return function delayOperator(source) {
    return new Observable(observer =>
      source.subscribe(
        value =>
          orderedSetTimeout(() => {
            // console.log({ id, value });
            observer.next(value);
          }, time),
        error =>
          orderedSetTimeout(() => {
            // console.log({ id, error });
            observer.error(error);
          }, time),
        () =>
          orderedSetTimeout(() => {
            // console.log({ id, complete: true });
            observer.complete();
          }, time)
      )
    );
  };
}

export class DelayDataSource {
  source: IDataSource;
  time: number;
  constructor(source: IDataSource, time: number): void {
    this.source = source;
    this.time = time;
  }
  get(paths: PathSet[]): Observable<JsonGraphEnvelope> {
    return Observable.from(this.source.get(paths)).pipe(delay(this.time));
  }
  set(jsonGraphEnvelope: JsonGraphEnvelope): Observable<JsonGraphEnvelope> {
    return Observable.from(this.source.set(jsonGraphEnvelope)).pipe(
      delay(this.time)
    );
  }
  call(
    functionPath: Path,
    args?: JsonGraphNode[],
    refSuffixes?: PathSet[],
    thisPaths?: PathSet[]
  ): Observable<JsonGraphEnvelope> {
    return Observable.from(
      this.source.call(functionPath, args, refSuffixes, thisPaths)
    ).pipe(delay(this.time));
  }
}
