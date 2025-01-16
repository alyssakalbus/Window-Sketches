let shapes = [
    { symbol: "(", word: "/" },
    { symbol: ":", word: "." },
    { symbol: "@", word: "AAAAAAAAA" },
    { symbol: "^", word: "_" },
  
    
  ];
  
  let count = 150;
  let textsize = 2;
  let cam;
  
  let swapShapes = false;
  let swapColors = false; 
  
  // Default fill and background
  let fillColor = [255, 255, 255, 100];
  let bgColor = [0];
  
  // Oscillation parameters
  const lowThreshold = 0;
  const highThreshold = 100;
  const speed = 2 * Math.PI / 3000; // osc speed
  
  function setup() {
    createCanvas(windowWidth, windowHeight);
    textAlign(CENTER, CENTER);
    
  
    cam = createCapture(VIDEO);
    cam.size(320, 180);
    cam.hide();
    
    frameRate(8);
  }
  
  function draw() {
    background(bgColor);
    
    // load pixels once per frame
    cam.loadPixels();
    
    let shapeSize = windowWidth / count;
    let time = millis(); // Oscillation time
    
    // Oscillating factor with threshold
    const oscillation = 0.5 * (1 + Math.sin(time * speed));
    const luminanceOffset = lowThreshold + (highThreshold - lowThreshold) * oscillation;
  
    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        let posX = (x + 0.5) * shapeSize;
        let posY = (y + 0.5) * shapeSize;
  
        // Sample pixels
        let x2 = floor((x / count) * cam.width);
        let y2 = floor((y / count) * cam.height);
        let pixelIndex = (y2 * cam.width + x2) * 4;
        
        let r = cam.pixels[pixelIndex] || 0;
        let g = cam.pixels[pixelIndex + 1] || 0;
        let b = cam.pixels[pixelIndex + 2] || 0;
        
        // luminance calculation
        let luminance = (r + g + b) / 3;
        luminance += luminanceOffset; // Oscillating luminance offset
        
        // Map luminance to shape index
        let shapeIndex = floor(map(luminance, 0, 255, 0, shapes.length));
        shapeIndex = constrain(shapeIndex, 0, shapes.length - 1);
        let shape = shapes[shapeIndex];
  
        // Draw the shape
        drawShape(posX, posY, shapeSize, shape, swapShapes);
      }
    }
  }
  
  function drawShape(x, y, shapeSize, shape, isWord) {
    fill(fillColor);
    noStroke();  // No stroke needed for text rendering
  
    textSize(textsize);
    // Use `word` or `symbol` based on the `swapShapes` flag
    text(isWord ? shape.word : shape.symbol, x, y);
  }
  
  function keyPressed() {
    // Toggle shapes when spacebar is pressed
    if (key === ' ') {
      swapShapes = !swapShapes;
    }
  }
  
  function mousePressed() {
    // Toggle background and fill colors on mouse click
    if (swapColors) {
      fillColor = [255, 255, 255, 100];
      bgColor = [0];
    } else {
      fillColor = [0, 0, 0, 100];
      bgColor = [255];
    }
    swapColors = !swapColors;
  }