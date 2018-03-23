const Task = require('./task.model');
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

// @todo: Refactor to remove the this._day property
// use object destructuring as with the Task model.

module.exports = class Day {

  constructor(day){

    if (typeof day === 'undefined') {

      // New day's should always be initialised to 'tomorrow'.
      let date = new Date().setDate(new Date().getDate()+1);

      this._day = {
        date: date,
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

  setChecked(checked = true) {
    this._day.checked = checked;
  }

  getDate() {
    return new Date(this._day.date);
  }

  getChecked() {
    return this._day.checked;
  }

  addTask(name) {
    let task = new Task({ name });
    this._day.tasks.push(task.getTask());
  }

  getTask() {
    return new Task(this._day.tasks[0]);
  }
};