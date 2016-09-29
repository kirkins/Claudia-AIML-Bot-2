const config = require('../config/config');
const logging = require("../modules/logging");
const rp = require('minimal-request-promise');
var emotion = "I'm analyzing your profile picture using Microsoft's cognitive API for emotion. Do you want to know the results?";
var emotionScores;

var exports = module.exports = {
  // function to get photo emotions with Microsoft Emotion Cogntitive api
  photoEmotions: function(photo) {
    if(config.MSemotionKey){
      var options = {
        method: 'POST',
        hostname: 'api.projectoxford.ai',
        path: '/emotion/v1.0/recognize',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': config.MSemotionKey
        },
        body: JSON.stringify({
           url: photo
        })
      };
      rp(options).then(
        function (response) {
          userEmotion = JSON.parse(response.body);
          emotionScores = userEmotion[0].scores;
          emotion = getEmotion(emotionScores);
          logging.saveUser(user, request.sender, JSON.stringify(emotion));
          console.log(getEmotion(emotionScores));
        }
      );
      return emotion;
    }else{
      return "Microsoft Cogntitive api key is not set. See config/config.js file.";
    }
  }
}

function getEmotion(emotionJson) {

  var msg = "I think you look ";

  var emotionValues = [];
  for(var x in emotionJson){
    emotionValues.push(emotionJson[x]);
  }

  switch(indexOfMax(emotionValues)) {
    case 0:
        return msg + "angry";
        break;
    case 1:
        return msg + "contempt";
        break;
    case 2:
        return msg + "disgust";
        break;
    case 3:
        return msg + "fear";
        break;
    case 4:
        return msg + "happiness";
        break;
    case 5:
        return msg + "neutral";
        break;
    case 6:
        return msg + "sadness";
        break;
    case 7:
        return msg + "surprise";
        break;
    default:
        return "error no emotions found?!";
  }
}

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}
