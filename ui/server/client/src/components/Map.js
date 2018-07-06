import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Chart } from 'react-google-charts';
import { fetchCountries } from '../actions';

class Map extends Component {

  componentDidMount() {
    this.props.fetchCountries();
  }

  renderContent() {

    let options = {
      defaultColor: '#FF0000',
    };

    let data = [['Country']];

    this.props.countries.forEach((country) => {
      data.push([country.Code]);
    });

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

function mapStateToProps({ countries }) {
  return { countries };
}

export default connect(mapStateToProps, { fetchCountries })(Map);