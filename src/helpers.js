'use strict';

//@todo: Replace with a technique that doesn't require instantiation of an object to use.
// Eg, import * as helpers - but using require() instead since node doesn't support es6 modules.
// See react tut project.

module.exports = class helpers {

  // @todo: This is silly... lets pull in moment.js for this instead.
  static formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ampm;
    return strTime;
  }
}

