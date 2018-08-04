import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchCountries } from '../actions';
import { Chart } from 'react-google-charts';
//import { Chart } from '../patched/react-google-charts/src/index';

class Map extends Component {

  componentDidMount() {
    this.props.fetchCountries();
  }

  renderContent() {

    if (this.props.auth === false) {
      return <div></div>;
    }
    else {
      let visibleOptions = {
        defaultColor: '#FF0000',
        magnifyingGlass: { enable: true, zoomFactor: 7.5 },
        region: 'world'
      };

      let visibleCountries = [['Country']];


      this.props.countries.forEach((country) => {
        if (country.MapVisible) {
          visibleCountries.push([country.Name]);
        }
      });

      // let chartEvents = [
      //   {
      //     eventName: 'ready',
      //     callback: () => {
      //       console.log('called chart callback');
      //     },
      //   }
      // ];

      return (
        <div className="mapcontainer">
          <Chart chartType="GeoChart"
                 width={"1200px"}
                 height={"900px"}
                 overlay="GeoChartNonVisible"
                 data={visibleCountries}
                 options={visibleOptions}
                 graph_id="GeoChartVisible"
                 //chartEvents={chartEvents}
                 mapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}/>
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        {this.renderContent()}
      </div>
    );
  }
}

function mapStateToProps({ countries, auth }) {
  return { countries, auth };
}

export default connect(mapStateToProps, { fetchCountries })(Map);