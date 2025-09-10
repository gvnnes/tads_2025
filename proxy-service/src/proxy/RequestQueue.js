
const EventEmitter = require('events');
const { QUEUE_MAX_SIZE } = require('../config');

class RequestQueue extends EventEmitter {
  constructor() {
    super();
    if (RequestQueue.instance) {
      return RequestQueue.instance;
    }
    this.commands = [];
    RequestQueue.instance = this;
  }

  addCommand(command) {
    if (this.commands.length >= QUEUE_MAX_SIZE) {
      this.emit('command:dropped', { reason: 'Queue full' });
      return false;
    }
    this.commands.push(command);
    this.emit('command:added', { queueSize: this.commands.length });
    return true;
  }

  getNextCommand() {
    return this.commands.shift();
  }

  getSize() {
    return this.commands.length;
  }
}

module.exports = new RequestQueue();