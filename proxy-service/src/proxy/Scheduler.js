
const EventEmitter = require('events');
const requestQueue = require('./RequestQueue');
const { RATE_LIMIT_MS } = require('../config');

class Scheduler extends EventEmitter {
  constructor() {
    super();
    if (Scheduler.instance) {
      return Scheduler.instance;
    }
    this.intervalId = null;
    Scheduler.instance = this;
  }

  start() {
    if (this.intervalId) return;

    this.intervalId = setInterval(async () => {
      const command = requestQueue.getNextCommand();
      if (command) {
        this.emit('command:processing', command);
        try {
          await command.execute();
          this.emit('command:processed', { success: true });
        } catch (error) {
          this.emit('command:processed', { success: false, error });
        }
      }
    }, RATE_LIMIT_MS);

    console.log('Scheduler started.');
  }

  stop() {
    clearInterval(this.intervalId);
    this.intervalId = null;
    console.log('Scheduler stopped.');
  }
}

module.exports = new Scheduler();