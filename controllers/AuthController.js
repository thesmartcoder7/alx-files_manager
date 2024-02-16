import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static getConnect(req, res) {
    const authData = req.header('Authorization');
    const encodedUserDetails = authData.split(' ')[1];
    // decode base64
    const decodedUserDetails = Buffer.from(encodedUserDetails, 'base64').toString('ascii');
    const [email, password] = decodedUserDetails.split(':');
    const hashedPassword = sha1(password);
    const users = dbClient.db.collection('users');
    users.findOne({ email, password: hashedPassword }, async (err, user) => {
      if (user) {
        const token = uuidv4();
        const key = `auth_${token}`;
        await redisClient.set(key, user._id);
        res.status(200).json({ token });
      } else {
        res.status(401).json({ error: 'Unauthorized' });
      }
    });
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const id = await redisClient.get(key);
    if (id) {
      await redisClient.del(key);
      res.status(204).send();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  }
}

module.exports = AuthController;
