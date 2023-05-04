const functions = require("firebase-functions");

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

exports.myFunction = functions.https.onRequest((req, res) => {
  const data = {
    foo: 'bar',
    baz: 123
  };
  return res.json(data);
});