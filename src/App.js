// @flow
import React, { Component } from "react";
// $FlowFixMe: missing type definition
import { Placeholder } from "react";
import Loloromo from "./Loloromo.js";
import { traversePath, rootPath } from "./graph.js";
const lolomoPath = traversePath(rootPath, node => node.lolomo);

class App extends Component<{||}, {| rowsToShow: number |}> {
  state = { rowsToShow: 0 };
  render() {
    return (
      <div className="App">
        <button
          onClick={e =>
            this.setState(({ rowsToShow }) => ({ rowsToShow: rowsToShow + 1 }))
          }
        >
          add row
        </button>
        <button
          onClick={e =>
            this.setState(({ rowsToShow }) => ({
              rowsToShow: rowsToShow > 0 ? rowsToShow - 1 : 0
            }))
          }
        >
          remove row
        </button>
        <Placeholder delayMs={100} fallback={<span>timeout</span>}>
          <Loloromo path={lolomoPath} rowsToShow={this.state.rowsToShow} />
        </Placeholder>
      </div>
    );
  }
}
export default App;
