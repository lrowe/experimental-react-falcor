// @flow
import React from "react";
// $FlowFixMe: missing type definitions
import { unstable_AsyncMode as AsyncMode, StrictMode } from "react";
import ReactDOM from "react-dom";
import App from "./App.js";
import { Provider } from "./Falcor.js";
import executor from "./executor.js";

const root = document.getElementById("root");
if (!root) {
  throw new Error("missing root dom node");
}

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
