const dialogflow = require('dialogflow');
const uuid = require('uuid');
const express = require('express');
const bodyparser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

const sessionId = uuid.v4();

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.post('/send-msg', (req, res) => {
  runSample(req.body.MSG).then(data => {
    res.send({ Reply: data });
  }).catch(error => {
    console.error('Dialogflow error:', error);
    res.status(500).send({ error: 'Dialogflow failed' });
  });
});

async function runSample(msg, projectId = process.env.PROJECT_ID) {
  const sessionClient = new dialogflow.SessionsClient({
    credentials: {
      client_email: process.env.CLIENT_EMAIL,
      private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
  });

  const sessionPath = sessionClient.sessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: msg,
        languageCode: 'en-US',
      },
    },
  };

  const responses = await sessionClient.detectIntent(request);
  const result = responses[0].queryResult;
  return result.fulfillmentText;
}

app.listen(port, () => {
  console.log("Server running on port", port);
});
