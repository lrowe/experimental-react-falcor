// @flow
import React from "react";
// $FlowFixMe: missing type definitions
import { unstable_AsyncMode as AsyncMode, StrictMode } from "react";
import ReactDOM from "react-dom";
import App from "./App.js";

const root = document.getElementById("root");
if (!root) {
  throw new Error("missing root dom node");
}

ReactDOM.render(
  <StrictMode>
    <AsyncMode>
      <App />
    </AsyncMode>
  </StrictMode>,
  root
);
