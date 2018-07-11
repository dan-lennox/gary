import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../actions';

import Header from './Header';
import Map from './Map';

class App extends Component {

  // React lifecycle method.
  componentDidMount() {
    // Call the FETCH_USER actions creator.
    this.props.fetchUser();
  }

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

// Note: This will assign all of our action creators as 'props' on the App component.
export default connect(null, actions)(App);