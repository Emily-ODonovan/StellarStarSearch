let target;
const brightPoints = [];

async function loadFromForm() {
    // const element = document.getElementById("test");
    // element.innerHTML = "Hello World";

    const fileIn = document.getElementById("imgUp");
    const imgOut = document.getElementById("out");

    target = fileIn.files[0];

    imgOut.src = URL.createObjectURL(target);
    imgOut.onload = function () {
        findBrightPoints(imgOut, 5);
        console.log(JSON.stringify(brightPoints, null, "  "));
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
        const brightness = (0.2126 * data[i]) + (0.7152 * data[i + 1]) + (0.0722 * data[i + 2]);

        // if the pixel is bright, add it to the array
        if (brightness > 75) {
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