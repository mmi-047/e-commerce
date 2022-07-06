const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const {
  ObjectId
} = require('mongodb');

/*
 * Requires the MongoDB Node.js Driver
 * https://mongodb.github.io/node-mongodb-native
 */

const agg = [
  {
    '$match': {
      'product': new ObjectId('62be8fee841a74f0f7fd9efa')
    }
  }, {
    '$group': {
      '_id': null, 
      'averageRating': {
        '$avg': '$rating'
      }, 
      'numOfReviews': {
        '$sum': 1
      }
    }
  }
];

MongoClient.connect(
  'mongodb+srv://admin:KhDrWYBeI3ex0IY7@cluster0.ptfyh.mongodb.net/Ecommerce-API?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true },
  function(connectErr, client) {
    assert.equal(null, connectErr);
    const coll = client.db('Ecommerce-API').collection('reviews');
    coll.aggregate(agg, (cmdErr, result) => {
      assert.equal(null, cmdErr);
    });
    client.close();
  });