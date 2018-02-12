

// {
//   date: '12345678', // Don't store the time. Just granularity of day.
//   checked: false,
//   tasks: [
//   {
//     task: 'Do my homework!',
//     completed: false
//   }
// ]
// }

module.exports = class Day {

  constructor(day){

    if (typeof day === 'undefined') {
      this._day = {
        date: new Date(),
        checked: false,
        tasks: []
      }
    }
    else {
      this._day = day;
    }
  }

  getDay() {
    return this._day;
  }

  setChecked(checked) {
    this._day.checked = checked;
  }

  getDate() {
    return new Date(this._day.date);
  }

  getChecked() {
    return this._day.checked;
  }

  addTask(task) {
    this._day.tasks.push(task);
  }
};