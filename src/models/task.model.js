module.exports = class Task {

  constructor(name){
    this._name = name;
    this._completed = false;
  }

  getCompleted() {
    return this._completed;
  }

  setCompleted() {
    this.completed = true;
  }

  getName() {
    return this._name;
  }
};