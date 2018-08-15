// @flow
import React, { Component } from "react";
// $FlowFixMe: missing type definition
import { Placeholder } from "react";
import Loloromo from "./Loloromo.js";
import { traversePath, rootPath } from "./graph.js";
const lolomoPath = traversePath(rootPath, node => node.lolomo);

class App extends Component<{||}, {| show: boolean |}> {
  state = { show: false };
  render() {
    if (!this.state.show) {
      return (
        <div className="App">
          <button
            onClick={e =>
              this.setState(prevState => ({ show: !prevState.show }))
            }
          >
            Click me to start
          </button>
        </div>
      );
    }
    return (
      <div className="App">
        <Placeholder ms={100}>
          {didTimeout =>
            didTimeout ? <span>timeout</span> : <Loloromo path={lolomoPath} />
          }
        </Placeholder>
      </div>
    );
  }
}
export default App;
