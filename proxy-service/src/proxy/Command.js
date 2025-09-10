
const { externalClient } = require('./externalClient');

class ScoreRequestCommand {
  constructor({ params, resolve, reject }) {
    this.params = params;
    this.resolve = resolve;
    this.reject = reject;
  }

  async execute() {
    try {
      const response = await externalClient.getScore(this.params);
      this.resolve(response);
    } catch (error) {
      this.reject(error);
    }
  }
}

module.exports = ScoreRequestCommand;