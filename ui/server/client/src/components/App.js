import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import Header from './Header';
import Map from './Map';

class App extends Component {

  render() {
    return (
      <div className="container">
        <BrowserRouter>
          <div>
            <Header/>
            <Route exact path="/" component={Map}/>
          </div>
        </BrowserRouter>
      </div>
    );
  }
};

export default App;