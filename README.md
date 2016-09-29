# Claudia AIML Bot
A node.js app using Claudia. Allows users to chat with a bot on facebook. Edit `responses/bot.aiml` to change responses.

Based on my [first version of the bot](https://github.com/kirkins/Claudia-AIML-Bot) but added facebook ui, emotion module using Microsoft cognitive api, logging using dynamoDb, and the ability to play rock, paper, scissors.

   ![alt tag](http://i.imgur.com/EbVh02q.png)

After cloning:

    npm install claudia -g
    npm install
    claudia create --region us-east-1 --api-module bot --configure-fb-bot

#Config for database logging

To get logging with dynamoDb working you need to create a table for users and a table for messages. After you've made the tables add the names to the 'config/config.js' file.

You'll also need to enable the lambda function to access your DyndamoDB instance. You can do this in the 'identity & access management' section of the AWS console.  

#Config for emotion detection

The emotion command causes the bot to use [Microsoft's Cogntitive Emotion API](https://www.microsoft.com/cognitive-services/en-us/emotion-api) with the user's profile picture. To get this working you need to get an api key and add it to the 'config/config.js' file.

More on using Claudia: https://aws.amazon.com/blogs/compute/create-and-deploy-a-chat-bot-to-aws-lambda-in-five-minutes/

Claudia https://github.com/claudiajs/claudia-bot-builder

What is AIML: http://www.alicebot.org/aiml.html
