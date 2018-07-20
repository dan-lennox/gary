import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Chart } from 'react-google-charts';
import { fetchCountries } from '../actions';

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
        //tooltip: {textStyle: {color: '#FF0000'}, showColorCode: true},
        //displayMode: "text"
        //resolution: 'provinces'
      };

      let nonVisibleOptions = {
        defaultColor: '#FF0000',
        displayMode: 'markers',
        region: 'world',
        sizeAxis: {
          minSize: 1,
          maxSize: 4
        },
        legend: 'none',
        colorAxis: {colors: ['red', 'red']}
      };

      let visibleCountries = [['Country']];

      let nonVisibleCountries = [['Country', 'value']];

      //nonVisibleCountries.push(['Singapore', 1]);
      //nonVisibleCountries.push(['Monaco', 1]);

      this.props.countries.forEach((country) => {
        if (country.MapVisible) {
          visibleCountries.push([country.Name]);
        }
        else {
          nonVisibleCountries.push([country.Name]);
        }
      });

      console.log('visible', visibleCountries);
      console.log('nonVisible', nonVisibleCountries);

      return (
        <div className="mapcontainer">
          <Chart chartType="GeoChart"
                 width={"1200px"}
                 height={"900px"}
                 data={visibleCountries}
                 options={visibleOptions}
                 graph_id="GeoChartVisible"
                 mapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}/>

          <Chart chartType="GeoChart"
                 width={"1200px"}
                 height={"900px"}
                 data={nonVisibleCountries}
                 options={nonVisibleOptions}
                 graph_id="GeoChartNonVisible"
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