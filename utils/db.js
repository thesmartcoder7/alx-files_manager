import { MongoClient } from 'mongodb';

const HOST = process.env.DB_HOST || 'localhost';
const PORT = process.env.DB_PORT || 27017;
const DB_NAME = process.env.DB_DATABASE || 'files_manager';

const url = `mongodb://${HOST}:${PORT}`;

class DBClient {
  constructor() {
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.client.connect().then(() => {
      this.db = this.client.db(DB_NAME);
    }).catch((err) => {
      console.log(err);
    });
  }

  isAlive() {
    if (this.client.isConnected()) {
      return true;
    }
    return false;
  }

  nbUsers() {
    return new Promise((resolve, reject) => {
      this.db.collection('users').countDocuments((err, count) => {
        if (err) {
          reject(err);
        } else {
          resolve(count);
        }
      });
    });
  }

  nbFiles() {
    return new Promise((resolve, reject) => {
      this.db.collection('files').countDocuments((err, count) => {
        if (err) {
          reject(err);
        } else {
          resolve(count);
        }
      });
    });
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
