const functions = require("firebase-functions");
const cors = require('cors')({ origin: true });
const admin = require("firebase-admin");

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    functions.logger.info("Hello logs!", { structuredData: true });
    const data = {
      data: {
        foo: "bar",
        baz: 123,
      },
    };
    response.send(data);
  });
});

exports.myFunction = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    const data = {
      foo: 'bar',
      baz: 123
    };
    response.json(data).send();
  });
});