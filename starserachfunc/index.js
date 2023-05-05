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

exports.starFinder = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    let getNextPoint = (points, index) => {
      if (points.length < index + 1) { return null; }
      let nextIndex = (index + 1) % points.length;

      while (points[nextIndex].exclude) {
        nextIndex = (nextIndex + 1) % points.length;

        if (nextIndex === index) {
          return null;
        }
      }

      return points[nextIndex];
    }

    let getAngleBetweenPoints = (p1, p2, p3) => {
      const a = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
      const b = Math.sqrt((p3.x - p2.x) ** 2 + (p3.y - p2.y) ** 2);
      const c = Math.sqrt((p3.x - p1.x) ** 2 + (p3.y - p1.y) ** 2);

      const angle = Math.acos((a ** 2 + b ** 2 - c ** 2) / (2 * a * b));

      return angle;
    }

    let stars = [];
    for (var i in request) {
      stars.push([i, request[i]]);
    }

    let output = [];
    for (let i = 0; i < stars.length; i++) {
      if (stars[i].exclude) continue;

      let p1 = stars[i];
      let p2 = getNextPoint(stars, i);
      let p3 = getNextPoint(stars, i + 1);

      if (!p2 || !p3) break;

      output.push(getAngleBetweenPoints(p1, p2, p3));
    }
    output = { data: output };
    response.send(output);
  });
});


// point.x = point.x;
// point.y = point.y;
// point.rXr = starDistance * starDistance;
// point.info = "N/A";
// point.name = "Star";
// point.exclude = false;