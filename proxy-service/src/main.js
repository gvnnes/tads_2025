const express = require('express');
const requestQueue = require('./proxy/RequestQueue');
const scheduler = require('./proxy/Scheduler');
const ScoreRequestCommand = require('./proxy/Command');

const app = express();
const PORT = 3000;

requestQueue.on('command:added', ({ queueSize }) => {
  console.log(`[Observer] Command added. Queue size: ${queueSize}`);
});

requestQueue.on('command:dropped', ({ reason }) => {
    console.warn(`[Observer] Command dropped! Reason: ${reason}`);
});

scheduler.on('command:processed', ({ success, error }) => {
  if (success) {
    console.log(`[Observer] Command processed successfully.`);
  } else {
    console.error(`[Observer] Command processing failed.`, error);
  }
});

scheduler.start();

app.get('/proxy/score', async (req, res) => {
  const promise = new Promise((resolve, reject) => {
    const command = new ScoreRequestCommand({
      params: req.query,
      resolve,
      reject,
    });

    if (!requestQueue.addCommand(command)) {
      res.status(503).json({ error: 'Serviço indisponível: fila de requisições cheia.' });
    }
  });

  try {
    const result = await promise;
    res.status(200).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json(error.data || { error: 'Erro interno.' });
  }
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        queue_size: requestQueue.getSize()
    });
});

app.listen(PORT, () => {
  console.log(`Proxy server rodando em http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
    scheduler.stop();
    process.exit();
});