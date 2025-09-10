const axios = require('axios');
const { EXTERNAL_API_URL } = require('../config');

const externalClient = {
  getScore: async (params) => {
    try {
      const response = await axios.get(EXTERNAL_API_URL, { params });
      return response.data;
    } catch (error) {
      const errorData = error.response ? error.response.data : { message: error.message };
      throw { statusCode: error.response?.status || 500, data: errorData };
    }
  },
};

module.exports = { externalClient };