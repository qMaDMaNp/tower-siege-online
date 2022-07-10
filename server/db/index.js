const { MongoClient } = require('mongodb');

class DB {
  constructor(props) {
    this.client = null;
    this.db = null;
  }

  async connect() {
    const url = process.env.DB;
    const dbName = 'tower-siege-online';

    try {
      const client = await MongoClient.connect(url, { useUnifiedTopology: true });
      this.client = client;
      this.db = client.db(dbName);
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = new DB();