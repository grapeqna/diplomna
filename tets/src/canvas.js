// SETTING ALL VARIABLES
var isMouseDown = false;
var canvas = document.createElement('canvas');
var body = document.getElementsByTagName("body")[0];
var ctx = canvas.getContext('2d');
var linesArray = [];
currentSize = 5;
var currentColor = "rgb(200,20,100)";
var currentBg = "white";
var bucketColor = "#ffffff"; // Default bucket color

// INITIAL LAUNCH
createCanvas();

// BUTTON EVENT HANDLERS
document.getElementById('canvasUpdate').addEventListener('click', function () {
    createCanvas();
    redraw();
});
document.getElementById('colorpicker').addEventListener('change', function () {
    currentColor = this.value;
});
document.getElementById('bgcolorpicker').addEventListener('change', function () {
    ctx.fillStyle = this.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    redraw();
    currentBg = ctx.fillStyle;
});

document.getElementById('bucket').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default action on click
    // Show bucket color picker when bucket button is clicked
    var bucketColorPicker = document.getElementById('bucketColorPicker');
    if (bucketColorPicker.style.display === 'none') {
        bucketColorPicker.style.display = 'block';
    } else {
        bucketColorPicker.style.display = 'none';
    }
});

// Adjusted event listener for the bucket color picker
document.getElementById('bucketColorPicker').addEventListener('change', function () {
    bucketColor = this.value;
});

document.getElementById('controlSize').addEventListener('change', function () {
    currentSize = this.value;
    document.getElementById("showSize").innerHTML = this.value;
});
document.getElementById('saveToImage').addEventListener('click', function () {
    downloadCanvas(this, 'canvas', 'masterpiece.png');
}, false);
document.getElementById('eraser').addEventListener('click', eraser);
document.getElementById('clear').addEventListener('click', createCanvas);
// document.getElementById('save').addEventListener('click', save);
// document.getElementById('load').addEventListener('click', load);
// document.getElementById('clearCache').addEventListener('click', function () {
//     localStorage.removeItem("savedCanvas");
//     linesArray = [];
//     console.log("Cache cleared!");
// });

// REDRAW
function redraw() {
    for (var i = 1; i < linesArray.length; i++) {
        ctx.beginPath();
        ctx.moveTo(linesArray[i - 1].x, linesArray[i - 1].y);
        ctx.lineWidth = linesArray[i].size;
        ctx.lineCap = "round";
        ctx.strokeStyle = linesArray[i].color;
        ctx.lineTo(linesArray[i].x, linesArray[i].y);
        ctx.stroke();
    }
}

// DRAWING EVENT HANDLERS
canvas.addEventListener('mousedown', function () { mousedown(canvas, event); });
canvas.addEventListener('mousemove', function () { mousemove(canvas, event); });
canvas.addEventListener('mouseup', mouseup);

// CREATE CANVAS
function createCanvas() {
    canvas.id = "canvas";
    canvas.width = parseInt(document.getElementById("sizeX").value);
    canvas.height = parseInt(document.getElementById("sizeY").value);
    canvas.style.zIndex = 8;
    canvas.style.position = "absolute";
    canvas.style.border = "1px solid";
    ctx.fillStyle = currentBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    body.appendChild(canvas);
}

// DOWNLOAD CANVAS
function downloadCanvas(link, canvas, filename) {
    link.href = document.getElementById(canvas).toDataURL();
    link.download = filename;
}

// // SAVE FUNCTION
// function save() {
//     localStorage.removeItem("savedCanvas");
//     localStorage.setItem("savedCanvas", JSON.stringify(linesArray));
//     console.log("Saved canvas!");
// }

// LOAD FUNCTION
// function load() {
//     if (localStorage.getItem("savedCanvas") != null) {
//         linesArray = JSON.parse(localStorage.savedCanvas);
//         redraw();
//         console.log("Canvas loaded.");
//     } else {
//         console.log("No canvas in memory!");
//     }
// }

// ERASER HANDLING
function eraser() {
    currentSize = 50;
    currentColor = ctx.fillStyle;
}

// GET MOUSE POSITION
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

// ON MOUSE DOWN
function mousedown(canvas, evt) {
    var mousePos = getMousePos(canvas, evt);
    isMouseDown = true;
    var currentPosition = getMousePos(canvas, evt);
    ctx.moveTo(currentPosition.x, currentPosition.y);
    ctx.beginPath();
    ctx.lineWidth = currentSize;
    ctx.lineCap = "round";
    ctx.strokeStyle = currentColor;
}

// ON MOUSE MOVE
function mousemove(canvas, evt) {
    if (isMouseDown) {
        var currentPosition = getMousePos(canvas, evt);
        ctx.lineTo(currentPosition.x, currentPosition.y);
        ctx.stroke();
        store(currentPosition.x, currentPosition.y, currentSize, currentColor);
    }
}

// STORE DATA
function store(x, y, s, c) {
    var line = {
        "x": x,
        "y": y,
        "size": s,
        "color": c
    }
    linesArray.push(line);
}

// ON MOUSE UP
function mouseup() {
    isMouseDown = false;
    store();
}

// FLOOD FILL FUNCTION
function startBucketFillOnce() {
    canvas.removeEventListener('click', startBucketFillOnce);
    canvas.addEventListener('click', startBucketFill);
}

function startBucketFill(event) {
    var mousePos = getMousePos(canvas, event);
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var targetColor = getPixelColor(imageData, mousePos.x, mousePos.y);
    // Use the bucket color instead of the color picker value
    var fillColor = bucketColor;
    floodFill(imageData, mousePos.x, mousePos.y, targetColor, fillColor);
    ctx.putImageData(imageData, 0, 0);
}

function getPixelColor(imageData, x, y) {
    var index = (y * imageData.width + x) * 4;
    return [
        imageData.data[index],
        imageData.data[index + 1],
        imageData.data[index + 2],
        imageData.data[index + 3]
    ];
}

function floodFill(imageData, x, y, targetColor, fillColor) {
    var stack = [];
    var width = imageData.width;
    var height = imageData.height;
    var pixelStack = [[x, y]];

    while (pixelStack.length) {
        var newPos, x, y, pixelPos, reachLeft, reachRight;
        newPos = pixelStack.pop();
        x = newPos[0];
        y = newPos[1];

        pixelPos = (y * width + x) * 4;
        while (y-- >= 0 && matchStartColor(pixelPos)) {
            pixelPos -= width * 4;
        }
        pixelPos += width * 4;
        ++y;
        reachLeft = false;
        reachRight = false;
        while (y++ < height - 1 && matchStartColor(pixelPos)) {
            colorPixel(pixelPos);
            if (x > 0) {
                if (matchStartColor(pixelPos - 4)) {
                    if (!reachLeft) {
                        pixelStack.push([x - 1, y]);
                        reachLeft = true;
                    }
                } else if (reachLeft) {
                    reachLeft = false;
                }
            }
            if (x < width - 1) {
                if (matchStartColor(pixelPos + 4)) {
                    if (!reachRight) {
                        pixelStack.push([x + 1, y]);
                        reachRight = true;
                    }
                } else if (reachRight) {
                    reachRight = false;
                }
            }
            pixelPos += width * 4;
        }
    }

    function matchStartColor(pixelPos) {
        var r = imageData.data[pixelPos];
        var g = imageData.data[pixelPos + 1];
        var b = imageData.data[pixelPos + 2];
        return (r === targetColor[0] && g === targetColor[1] && b === targetColor[2]);
    }

    function colorPixel(pixelPos) {
        imageData.data[pixelPos] = fillColor[0];
        imageData.data[pixelPos + 1] = fillColor[1];
        imageData.data[pixelPos + 2] = fillColor[2];
        imageData.data[pixelPos + 3] = fillColor[3];
    }
}