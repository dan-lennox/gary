import React, { Component } from 'react';
import { Chart } from 'react-google-charts';

class Map extends Component {
  renderContent() {

    let options = {
      defaultColor: '#FF0000',
    };

    let data = [['Country']];

    data.push(['Germany']);
    data.push(['France']);
    data.push(['Russia']);
    data.push(['Australia']);

    return (
      <div className="mapcontainer">
        <Chart chartType="GeoChart"
               width={"900px"}
               height={"500px"}
               data={data}
               options={options}
               graph_id="GeoChart"
               mapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}/>
      </div>
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