module.exports = class Task {

  constructor({ name, completed }){

    this._name = name;
    this._completed = (typeof completed !== 'undefined') ? completed : false;
  }

  getCompleted() {
    return this._completed;
  }

  setCompleted() {
    this._.completed = true;
  }

  getName() {
    return this._name;
  }

  getTask() {
    return { name: this._name, completed: this._completed };
  }
};