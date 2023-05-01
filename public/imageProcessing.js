let target;
const brightPoints = [];
let offsetX;
let offsetY;

async function loadFromForm() {
    const previewCanvas = document.getElementById("previewCanvas");
    const fileIn = document.getElementById("imgUpload");
    const imgOut = document.getElementById("out");
    const starDistance = 10;
    brightPoints.length = 0;

    target = fileIn.files[0];

    imgOut.src = URL.createObjectURL(target);
    imgOut.onload = function () {
        findBrightPoints(imgOut, starDistance);
        console.log(JSON.stringify(brightPoints, null, "  "));
        //send the brightPoints array to FireBase

        mutateBrightPoints(starDistance);

        let dimensions = [imgOut.width, imgOut.height];
        console.log(dimensions[0] + " " + dimensions[1]);
        drawConstallation(previewCanvas, dimensions, brightPoints, starDistance);

        addCircleHoverListener(previewCanvas);
    };
}


//written with the help of chatGPT
async function findBrightPoints(image, minDistance) {


    // get the dimensions of the image
    const width = image.width;
    const height = image.height;

    // create a canvas element and get its context
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // draw the image onto the canvas
    ctx.drawImage(image, 0, 0);

    // get the image data from the canvas
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // create a lookup table for pixel positions
    const lookup = new Set();

    const givenBrightness = document.getElementById("brightness").value;

    // loop through each pixel in the image
    for (let i = 0; i < data.length; i += 4) {
        // get the brightness of the pixel
        const brightness = (0.2126 * data[i]) + (0.7152 * data[i + 1]) + (0.073 * data[i + 2]);
        //these are the RGB brightness weighting given to each values. They were provided from chatGPT and are based on how sensitive the human eye is to each color
        //the blue value had to be modified to 0.073 from 0.0722 as in testing it was found that the blue value was too low and was not picking up enough stars

        // if the pixel is bright, add it to the array
        if (brightness > givenBrightness) {
            const x = (i / 4) % width;
            const y = Math.floor((i / 4) / width);

            // check if the pixel is near any existing bright points using the main array
            let skip = false;
            for (const point of brightPoints) {
                const dx = x - point.x;
                const dy = y - point.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDistance) {
                    skip = true;
                    break;
                }
            }

            // Double check if the pixel is near any recently added bright points using the lookup table
            if (!skip) {
                for (let dy = -minDistance; dy <= minDistance; dy++) {
                    for (let dx = -minDistance; dx <= minDistance; dx++) {
                        const xx = x + dx;
                        const yy = y + dy;
                        const pos = xx + ',' + yy;
                        if (lookup.has(pos)) {
                            skip = true;
                            break;
                        }
                    }
                    if (skip) {
                        break;
                    }
                }
            }

            // if the pixel is not near any other bright points, add it to the array
            if (!skip) {
                brightPoints.push({ x, y });
                lookup.add(x + ',' + y);
            }
        }
    }
    console.log("Image Processed!");
    // console.log(JSON.stringify(brightPoints, null, "  "));
}

function drawConstallation(previewCanvas, dimensions, points, radius) {
    const ctx = previewCanvas.getContext("2d");

    // Set the canvas dimensions
    previewCanvas.width = dimensions[0];
    previewCanvas.height = dimensions[1];

    //sets the offsets for the hover over function
    offsetX = previewCanvas.offsetLeft;
    offsetY = previewCanvas.offsetTop;

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
    const starInfo = document.getElementById('starInfo');
    const starName = document.getElementById('starName');
    canvas.addEventListener('mousemove', (event) => {

        const rect = canvas.getBoundingClientRect();
        const dx = event.clientX - rect.left;
        const dy = event.clientY - rect.top;

        for (const dot of brightPoints) {

            if ((dx-dot.x) * (dx-dot.x) + (dy-dot.y) * (dy-dot.y) < dot.rXr) {
                starName.innerHTML = dot.name;
                starInfo.innerHTML = dot.info;
                return;
            }
        }
    });
}

//mutates the bright points array to include the star distance and name
function mutateBrightPoints(starDistance) {
    brightPoints.forEach(point => {
        point.x = point.x;
        point.y = point.y;
        point.rXr = starDistance * starDistance;
        point.info = "We'll find out";
        point.name = "Star";
    });
}