module.exports = class Task {

  constructor(task) {


    // this._name = name;
    // this._completed = (typeof completed !== 'undefined') ? completed : false;
    this._task = task;
  }

  getCompleted() {
    return this._task.completed;
  }

  setCompleted() {
    this._task.completed = true;
  }

  getName() {
    return this._task.name;
  }

  getTask() {
    return this._task;
  }
};