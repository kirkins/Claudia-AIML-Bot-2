const fs = require('fs');
const rp = require('minimal-request-promise');
const botBuilder = require('claudia-bot-builder');
const fbTemplate = botBuilder.fbTemplate;
const AIMLInterpreter = require('aimlinterpreter');

const config = require('./config/config');
const logging = require("./modules/logging");
const emotion = require("./modules/emotion");

// load some greetings from txt to use before AIML is in memory
var greetings = fs.readFileSync('responses/greetings.txt').toString().split("\n");
var roboResponse = greetings[Math.floor(Math.random()*greetings.length)] + ", say help to see my commands.";
// mode changes when bot is waiting for a response
var mode;

const api = botBuilder((request, originalApiRequest) => {
  originalApiRequest.lambdaContext.callbackWaitsForEmptyEventLoop = false;
    if (!request.postback){
    return rp.get(`https://graph.facebook.com/v2.6/${request.sender}?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=${originalApiRequest.env.facebookAccessToken}`)
      .then(response => {
        var user = JSON.parse(response.body);
        var aimlInterpreter = new AIMLInterpreter({name:'Roberto', age:'1 month', ufirst: user.first_name, ulast: user.last_name, gender: user.gender});
        aimlInterpreter.loadAIMLFilesIntoArray(["responses/bot.aiml"]);
        return [
          modeCheck(user,request)
        ]
      })
    }
});

function modeCheck(user, request) {
  switch (mode) {
  case 1:
    mode = 0;
    if(request.text.toLowerCase()!="no"){
      var returnText = emotion.photoEmotions(user.profile_pic);
    } else{
      var returnText = "ok never mind then";
    }
    var message = new fbTemplate.text(returnText)
          .addQuickReply('about', 'about')
          .addQuickReply('talk', 'talk')
          .addQuickReply('RPS', 'RPS')
          .addQuickReply('emotion', 'emotion')
          .addQuickReply('contact', 'contact');
    return message.get();
    break;
  case 2:
    mode = 0;
    return rps(user, request);
  default:
    return menu(user, request);
  }
}

function menu(user, request) {
  var generic = new fbTemplate.generic();
  switch (request.text.toLowerCase()) {
      case "help":
      var returnText = "I'm a chatbot we can just talk or you can use my quick commands below:";
      var message = new fbTemplate.text(returnText)
            .addQuickReply('about', 'about')
            .addQuickReply('talk', 'talk')
            .addQuickReply('RPS', 'RPS')
            .addQuickReply('emotion', 'emotion')
            .addQuickReply('contact', 'contact');
      return message.get();
      break;
    case "about":
      var returnText = "I'm a chatbot developed by Philip Kirkbride using node and Amazon's Claudia.js. Source code to be released soon.";
      var message = new fbTemplate.text(returnText)
            .addQuickReply('about', 'about')
            .addQuickReply('talk', 'talk')
            .addQuickReply('RPS', 'RPS')
            .addQuickReply('emotion', 'emotion')
            .addQuickReply('contact', 'contact');
      return message.get();
      break;
    case "contact":
      var returnText = "For inquiries contact my creator at info@graniteapps.co";
      var message = new fbTemplate.text(returnText)
            .addQuickReply('about', 'about')
            .addQuickReply('talk', 'talk')
            .addQuickReply('RPS', 'RPS')
            .addQuickReply('emotion', 'emotion')
            .addQuickReply('contact', 'contact');
      return message.get();
      break;
    case "emotion":
      mode = 1;
      var returnText = emotion.photoEmotions(user.profile_pic);
      var message = new fbTemplate.text(returnText)
            .addQuickReply('yes', 'emotion')
            .addQuickReply('no', 'no')
            .addQuickReply('maybe', 'emotion');
      return message.get();
      break;
    case "talk":
    var returnText = "here are some conversation starters:";
    var message = new fbTemplate.text(returnText)
          .addQuickReply('how are you', 'how are you')
          .addQuickReply('what is my name', 'what is my name')
          .addQuickReply('how do you eat', 'how do you eat')
          .addQuickReply('what is my gender', 'what is my gender')
          .addQuickReply('do you remember me', 'do you remmeber me')
          .addQuickReply('do you like to dance', 'do you like to dance');
    return message.get();
    break;
    case "rps":
    mode = 2
    var returnText = "rock paper scissor ... ";
    var message = new fbTemplate.text(returnText)
          .addQuickReply('rock', 'rock')
          .addQuickReply('paper', 'paper')
          .addQuickReply('scissor', 'scissor');
    return message.get();
    break;
    default:
      return getAiml(user, request);
  }
}

function getAiml(user, request) {
  var aimlInterpreter = new AIMLInterpreter({name:'Roberto', age:'1 month', ufirst: user.first_name, ulast: user.last_name, gender: user.gender});
  aimlInterpreter.loadAIMLFilesIntoArray(["responses/bot.aiml"]);
  aimlInterpreter.findAnswerInLoadedAIMLFiles(request.text.toUpperCase(), function(answer, wildCardArray, input){
    if(answer){
       roboResponse = answer;
    }else{
      roboResponse = "hmmm... I'm not sure what to say about that. Try saying help to see some options.";
    }
  });
  // Save user input and aiml output to dynamoDb
  logging.saveUser(user, request.sender);
  logging.saveMsg(request.text, request.sender, request.timestamp, roboResponse);
  return roboResponse;
}

function rps(user, request) {
  var rpsArray = ['rock', 'paper', 'scissor'];
  var userChoice = request.text.toLowerCase();
  var roboChoice = rpsArray[Math.floor(Math.random() * rpsArray.length)];
  switch (userChoice + '|' + roboChoice) {
  case 'rock|rock':
  case 'paper|paper':
  case 'scissor|scissor':
    var returnText = "TIED... you chose " + userChoice + " and I chose " + roboChoice;
    var message = new fbTemplate.text(returnText)
          .addQuickReply('rock', 'rock')
          .addQuickReply('paper', 'paper')
          .addQuickReply('scissor', 'scissor');
    mode = 2;
    return message.get();
    break;
  case 'rock|scissor':
  case 'paper|rock':
  case 'scissor|paper':
    return "You WON... you chose " + userChoice + " and I chose " + roboChoice;
    break;
  case 'rock|paper':
  case 'paper|scissor':
  case 'scissor|rock':
    return "You LOST... you chose " + userChoice + " and I chose " + roboChoice;
    break;
  default:
    var returnText = "you need to pick rock, paper, or scissor";
    var message = new fbTemplate.text(returnText)
          .addQuickReply('rock', 'rock')
          .addQuickReply('paper', 'paper')
          .addQuickReply('scissor', 'scissor');
    return message.get();
  }
}

module.exports = api;
