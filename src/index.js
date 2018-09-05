// @flow
import React from "react";
// $FlowFixMe: missing type definitions
import { unstable_AsyncMode as AsyncMode, StrictMode } from "react";
import ReactDOM from "react-dom";
import App from "./App.js";
import { Provider } from "./Falcor.js";
import makeExecutor from "./executor.js";
import Model from "falcor";
import mockData from "./mock-data.js";
import { DelayDataSource } from "./delay.js";

const root = document.getElementById("root");
if (!root) {
  throw new Error("missing root dom node");
}

const cache = mockData().jsonGraph;
const source = new DelayDataSource(new Model({ cache }).asDataSource(), 500);
const model = new Model({ source }).batch();

const executor = makeExecutor(model);

ReactDOM.render(
  <StrictMode>
    <AsyncMode>
      <Provider value={executor}>
        <App />
      </Provider>
    </AsyncMode>
  </StrictMode>,
  root
);
