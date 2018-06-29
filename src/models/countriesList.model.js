const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const _ = require('lodash');

module.exports = class CountriesList {

  constructor(countries){
    this.countries = countries;
  };

  async loadAll() {
    if (this.countries instanceof Array) {
      return;
    }
    await readFileAsync('./src/data/countries.json', 'utf8')
      .then((list) => {
        this.countries = JSON.parse(list);
      })
      .catch((err) => {
        console.log('ERROR:', err);
      });
  }

  async getRandom(exclusions) {
    await this.loadAll();

    let countries = [];

    if (exclusions) {
      countries = _.filter(this.countries, (c) => {
        return !_.find(exclusions, (e) => {
          return e.Code === c.Code;
        });
      });
    }
    else {
      countries = this.countries;
    }

    return countries[Math.floor(Math.random()*countries.length)];
  }

  async getList() {
    await this.loadAll();
    return this.countries;
  }

  async addCountry(country) {
    await this.loadAll();
    // @todo: Test for uniqueness and throw error if trying to add the same country twice.
    return this.countries.push(country);
  }

  async removeRandom() {
    await this.loadAll();
    return {
      country: this.countries.splice(_.random(this.countries.length - 1), 1)[0],
      list: this.countries,
    };
  }
};