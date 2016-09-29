const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const config = require('../config/config');

var exports = module.exports = {

  saveUser: function(user, id) {
    var params = {
    TableName: config.userDb,
    Item: {
      userid: id,
      firstName: user.first_name,
      lastName: user.last_name,
      gender: user.gender,
      age: user.age
    }
  };
  dynamoDb.put(params).promise();
},

saveEmotion: function(user, id, emotion) {
  var params = {
  TableName: config.userDb,
  Item: {
    userid: id,
    firstName: user.first_name,
    lastName: user.last_name,
    gender: user.gender,
    age: user.age,
    emotion: emotion
  }
};
dynamoDb.put(params).promise();
},

  saveMsg: function(msg, sender, timestamp, response) {
    var params = {
    TableName: config.msgDb,
    Item: {
      msg_id: generateUUID(),
      user: sender,
      time: timestamp,
      text: msg,
      response: response
    }
  };
  dynamoDb.put(params).promise();
  }

};

function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}
