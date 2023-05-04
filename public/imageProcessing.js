document.addEventListener("DOMContentLoaded", event => {
    const app = firebase.app();
    console.log(app);

    const db = firebase.firestore();
    var functions = firebase.functions();
    


    var jelloWorld = functions.httpsCallable('helloWorld');
    jelloWorld().then(response => {
        console.log(JSON.stringify(response));
    });
});

let target;
const brightPoints = [];
const starDistance = 15;


// const db = firebase.firestore();
// const functions = firebase.functions();


async function loadFromForm() {
    document.getElementById("resultDiv").style.display = "block";

    const previewCanvas = document.getElementById("previewCanvas");
    const fileIn = document.getElementById("imgUpload");
    const imgOut = document.getElementById("out");

    brightPoints.length = 0;

    target = fileIn.files[0];

    imgOut.src = URL.createObjectURL(target);
    imgOut.onload = function () {
        findBrightPoints(imgOut, starDistance, previewCanvas, this.naturalWidth, this.naturalHeight);
        console.log(JSON.stringify(brightPoints, null, "  "));

        mutateBrightPoints(starDistance);

        let dimensions = [imgOut.width, imgOut.height];
        drawConstallation(previewCanvas, dimensions, brightPoints, starDistance);

        addCircleHoverListener(previewCanvas);
        previewCanvas.addEventListener('click', (event) => {
            trimFalsePositives(event, previewCanvas);
        });
        //await response from firebase
        //updateBrightPoints(response);

    };
}
async function queryDB() {
    //query firebase for the stars
    //await response from firebase
    //updateBrightPoints(response);
}

//written with the help of chatGPT
async function findBrightPoints(image, minDistance, previewCanvas, width, height) {

    // get the canvas context
    previewCanvas.width = width;
    previewCanvas.height = height;
    const ctx = previewCanvas.getContext('2d');

    // draw the image onto the canvas
    ctx.drawImage(image, 0, 0, width, height);

    // get the image data from the canvas
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const givenBrightness = document.getElementById("brightness").value;

    // loop through each pixel in the image
    for (let i = 0; i < data.length; i += 4) {
        // get the brightness of the pixel
        const brightness = (0.2126 * data[i]) + (0.7152 * data[i + 1]) + (0.073 * data[i + 2]);
        //these are the RGB brightness weighting given to each values. They were provided from chatGPT and are based on how sensitive the human eye is to each color
        //the blue value had to be modified to 0.073 from 0.0722 as in testing it was found that the blue value was too low and was not picking up enough stars alpha is ignored

        // if the pixel is bright, add it to the array
        if (brightness > givenBrightness) {
            const x = (i / 4) % width;
            const y = Math.floor((i / 4) / width);

            // check if the pixel is near any existing bright points using the main array
            let skip = false;
            for (const point of brightPoints) {
                const dx = x - point.x;
                const dy = y - point.y;
                if (Math.sqrt(dx * dx + dy * dy) < minDistance) {
                    skip = true;
                    break;
                }
            }

            // if the pixel is not near any other bright points, add it to the array
            if (!skip) {
                brightPoints.push({ x, y });
            }
        }
    }
}

function drawConstallation(previewCanvas, dimensions, points, radius) {
    const ctx = previewCanvas.getContext("2d");

    // Set the canvas dimensions
    previewCanvas.width = dimensions[0];
    previewCanvas.height = dimensions[1];

    //background first
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, dimensions[0], dimensions[1]);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#AAA';
    const maxLineDistanceInPx = 500;

    // A nested loop function that loops per point for every other point and draws a line between them if they are close enough
    for (let i = 0; i < points.length; i++) {
        const start = points[i];
        for (let j = i + 1; j < points.length; j++) {
            if (!(i === j)) {
                const end = points[j];

                // Calculate the distance between the two points
                const distance = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);

                // Only draw the line if the distance is within the maximum distance
                if (distance <= maxLineDistanceInPx) {
                    ctx.beginPath();
                    ctx.moveTo(start.x, start.y);
                    ctx.lineTo(end.x, end.y);
                    ctx.stroke();
                }
            }
        }

        // Set the fill style to white
        ctx.fillStyle = '#fff';

        // Loop through each point and draw a circle
        for (const point of points) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}

//tool tips for the stars!
function addCircleHoverListener(canvas) {
    const starName = document.getElementById('starName');
    const starInfo = document.getElementById('starInfo');
    canvas.addEventListener('mousemove', (event) => {

        const rect = canvas.getBoundingClientRect();
        const dx = event.clientX - rect.left;
        const dy = event.clientY - rect.top;

        for (const dot of brightPoints) {

            if ((dx - dot.x) * (dx - dot.x) + (dy - dot.y) * (dy - dot.y) < dot.rXr) {
                starName.innerHTML = dot.name;
                // starInfo.innerHTML = dot.info;
                //query SIMBAD from here

                return;
            }
        }
    });
}

function trimFalsePositives(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    const dx = event.clientX - rect.left;
    const dy = event.clientY - rect.top;
    for (const dot of brightPoints) {

        if ((dx - dot.x) * (dx - dot.x) + (dy - dot.y) * (dy - dot.y) < dot.rXr) {
            const index = brightPoints.indexOf(dot);
            if (index > -1) {
                brightPoints.splice(index, 1);
                drawConstallation(canvas, [canvas.width, canvas.height], brightPoints, starDistance)
            }
            return;
        }
    }

}

//mutates the bright points array to include the star distance squared and name
function mutateBrightPoints(starDistance) {
    brightPoints.forEach(point => {
        point.x = point.x;
        point.y = point.y;
        point.rXr = starDistance * starDistance;
        point.info = "N/A";
        point.name = "Star";
        point.exclude = false;
    });
}

function parseBrightPoints(jsonQuery) {
    brightPoints = [];
    jsonQuery.forEach(point => {
        brightPoints.push({ x: point.x, y: point.y, rXr: point.rXr, info: point.info, name: point.name, exclude: point.exclude });
    });
}