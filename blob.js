// Alyssa Kalbus 2025
// Created using P5.js and VIDA P5 Blob Tracking Library

const xResolution = 1024;
const yResolution = 768;

var myCapture, // camera
    myVida;    // VIDA

// camera access function
function initCaptureDevice() {
  try {
    myCapture = createCapture(VIDEO);
    myCapture.size(320, 240);
    myCapture.elt.setAttribute('playsinline', '');
    myCapture.hide();
    console.log(
      '[initCaptureDevice] capture ready. Resolution: ' +
      myCapture.width + ' ' + myCapture.height
    );
  } catch (_err) {
    console.log('[initCaptureDevice] capture error: ' + _err);
  }
}

function setup() {
  createCanvas(xResolution, yResolution);
  initCaptureDevice();

  // VIDA STUFF
  myVida = new Vida(this);

  myVida.progressiveBackgroundFlag = true;
  myVida.progressiveLearningRate = 0.0005;
  myVida.imageFilterFeedback = 0.92;
  myVida.imageFilterThreshold = 0.15;
  myVida.mirror = myVida.MIRROR_HORIZONTAL;
  myVida.handleBlobsFlag = true;

  myVida.normMinBlobMass = 0.001;
  myVida.normMaxBlobMass = 5;
  myVida.normMinBlobArea = 0.001;
  myVida.normMaxBlobArea = 5;

  myVida.trackBlobsFlag = true;

  myVida.trackBlobsMaxNormDist = 0.1;

  myVida.approximateBlobPolygonsFlag = true;
  myVida.pointsPerApproximatedBlobPolygon = 1;

  frameRate(60);
}

function draw() {
  if (myCapture !== null && myCapture !== undefined) {
    background(255);

    // buffer for VIDA processing
    let vidaBuffer = createGraphics(myCapture.width, myCapture.height);
    vidaBuffer.image(myCapture, 0, 0);

    // Create grayscale
    vidaBuffer.loadPixels();
    for (let i = 0; i < vidaBuffer.pixels.length; i += 4) {
      let r = vidaBuffer.pixels[i];
      let g = vidaBuffer.pixels[i + 1];
      let b = vidaBuffer.pixels[i + 2];
      let avg = (r + g + b) / 3;
      vidaBuffer.pixels[i] = avg;
      vidaBuffer.pixels[i + 1] = avg;
      vidaBuffer.pixels[i + 2] = avg;
    }
    vidaBuffer.updatePixels();

    // Update VIDA with grayscale buffer
    myVida.update(vidaBuffer);

    //  separate buffer for dithered display
    let displayBuffer = createGraphics(myCapture.width, myCapture.height);
    displayBuffer.image(myCapture, 0, 0);

    // Apply dithering effect for displayBuffer only
    displayBuffer.loadPixels();
    let d = pixelDensity();
    let pixelsPerRow = displayBuffer.width * d * 4;

    for (let y = 0; y < displayBuffer.height * d; y++) {
      for (let x = 0; x < displayBuffer.width * d; x++) {
        let i = (y * pixelsPerRow) + (x * 4);

        let r = displayBuffer.pixels[i];
        let g = displayBuffer.pixels[i + 1];
        let b = displayBuffer.pixels[i + 2];

       
        let gray = (r + g + b) / 3;
        let level = Math.floor(gray / 51) * 51; // 5 levels for dithering

        let isEdge = false;

      // check edges
      if (x < displayBuffer.width * d - 1) {
        let edgeIndex = i + 4; // Next pixel in row
        let nr = displayBuffer.pixels[edgeIndex];
        let ng = displayBuffer.pixels[edgeIndex + 1];
        let nb = displayBuffer.pixels[edgeIndex + 2];
        let edgeGray = (nr + ng + nb) / 3;
        let edgeLevel = Math.floor(edgeGray / 51) * 51;

        // Smaller difference for thinner edge detection
        if (Math.abs(level - edgeLevel) < 50) {
          isEdge = true;
        }
      }

      // Check bottom edge for edge (subtle threshold for thinner edge)
      if (y < displayBuffer.height * d - 1) {
        let edgeIndex = i + pixelsPerRow; // Next pixel in column
        let nr = displayBuffer.pixels[edgeIndex];
        let ng = displayBuffer.pixels[edgeIndex + 1];
        let nb = displayBuffer.pixels[edgeIndex + 2];
        let edgeGray = (nr + ng + nb) / 3;
        let edgeLevel = Math.floor(edgeGray / 51) * 51;

        // Thinner edges
        if (Math.abs(level - edgeLevel) < 50) {
          isEdge = true;
        }
      }

        // Edge color
        if (isEdge) {
          displayBuffer.pixels[i] = 255;
          displayBuffer.pixels[i + 1] = 255;
          displayBuffer.pixels[i + 2] = 255;
        } else {
          let edgeColor = color(0, 0, 0)
          displayBuffer.pixels[i] = red(edgeColor);
          displayBuffer.pixels[i + 1] = green(edgeColor);red
          displayBuffer.pixels[i + 2] = blue(edgeColor);
        }
      }
    }
    displayBuffer.updatePixels();

    // grayscale and cam debug for future image manipulation reference and documentation
    // image(myCapture, 0, 0, width, height);  
    // image(buffer, 0, 0, width, height);  

    // draw blob with video feed
    let blobs = myVida.getBlobs();
    for (let blob of blobs) {
      let x = width - blob.normRectX * width - blob.normRectW * width;
      let y = blob.normRectY * height;
      let w = blob.normRectW * width;
      let h = blob.normRectH * height;

      if (w > 0 && h > 0) {

        // bounding box offset
        let boxX = x - 5;
        let boxY = y - 15;
        let boxW = w + 10;
        let boxH = h + 20;

        // offset bounding box
        stroke(0, 0, 0);
        fill(255, 255, 255);
        rect(boxX, boxY, boxW, boxH);

        // display image w/ dithered buffer
        copy(
          displayBuffer,
          (1 - blob.normRectX - blob.normRectW) * displayBuffer.width,
          blob.normRectY * displayBuffer.height,
          blob.normRectW * displayBuffer.width,
          blob.normRectH * displayBuffer.height,
          x,
          y,
          w,
          h
        );

        // outline
        noFill();
        stroke(255, 255, 255);
        strokeWeight(2);
        rect(x, y, w, h);

         // outline
         noFill();
         stroke(0, 0, 0);
         strokeWeight(1);
         rect(x, y, w - 1, h + 1);

        // text
        fill(0, 0, 0);
        noStroke();
        textSize(8);
        textAlign(LEFT, TOP);
        text("x", x + 3, y - 10);
      }
    }
  } else {
    // debug background
    background(255, 0, 0);
  }
}

// send background image to VIDA Buffer
function touchEnded() {
  if (myCapture !== null && myCapture !== undefined) {
    myVida.setBackgroundImage(myCapture);
    console.log('background set');
  }
}
