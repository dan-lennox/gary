import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Map extends Component {
  renderContent() {
    return (
      <h1>Map</h1>
    );
  }

  render() {
    return (
      <div>
        {this.renderContent()}
      </div>
    );
  }
}

export default Map;