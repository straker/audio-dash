//------------------------------------------------------------
// Drawing functions
//------------------------------------------------------------

/**
 * Draw a neon rectangle in the given color.
 * @see https://codepen.io/agar3s/pen/pJpoya?editors=0010#0
 * Don't use shadow blur as it is terrible for performance
 * @see https://stackoverflow.com/questions/15706856/how-to-improve-performance-when-context-shadow-canvas-html5-javascript
 *
 * @param {number} x - X position of the rectangle
 * @param {number} y - Y position of the rectangle
 * @param {number} w - Width of the rectangle
 * @param {number} h - Height of the rectangle
 * @param {number} r - Red value
 * @param {number} g - Green value
 * @param {number} b - Blue value
 * @param {string} fill - final stroke color
 * @param {number} size - Line size
 */
function neonRect(x, y, w, h, r, g, b, fill, size) {
  size = size || 1;

  ctx.save();
  ctx.strokeStyle = "rgba(" + r + "," + g + "," + b + ",0.2)";
  ctx.lineWidth = 10.5 * size;
  ctx.strokeRect(x, y, w, h);
  ctx.lineWidth = 8 * size;
  ctx.strokeRect(x, y, w, h);
  ctx.lineWidth = 5.5 * size;
  ctx.strokeRect(x, y, w, h);
  ctx.lineWidth = 3 * size;
  ctx.strokeRect(x, y, w, h);
  ctx.strokeStyle = fill || "#fff";
  ctx.lineWidth = 1.5 * size;
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
}

/**
 * Line to each point.
 * @param {object[]} points - Object of x, y positions
 * @param {number} move - distance to move each point by
 */
function drawLines(points, move) {
  ctx.beginPath();
  ctx.moveTo(points[0].x - move, points[0].y);
  points.forEach(point => {
    ctx.lineTo(point.x - move, point.y);
  });
  ctx.stroke();
}

/**
 * Draw a neon line between points in the given color.
 * @param {object[]} points - Object of x, y positions
 * @param {number} move - Distance to move each point by
 * @param {number} r - Red value
 * @param {number} g - Green value
 * @param {number} b - Blue value
 * @param {number} size - Line size
 */
function neonLine(points, move, r, g, b, size) {
  if (!points.length) return;

  size = size || 1;

  ctx.save();
  ctx.strokeStyle = "rgba(" + r + "," + g + "," + b + ",0.2)";

  ctx.lineWidth = 10.5 * size;
  drawLines(points, move);

  ctx.lineWidth = 8 * size;
  drawLines(points, move);

  ctx.lineWidth = 5.5 * size;
  drawLines(points, move);

  ctx.lineWidth = 3 * size;
  drawLines(points, move);

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1.5 * size;
  drawLines(points, move);

  ctx.restore();
}

/**
 * Draw neon text in the given color
 * @param {string} text - Text to render
 * @param {number} x - X position of the text
 * @param {number} y - Y position of the text
 * @param {number} r - Red value
 * @param {number} g - Green value
 * @param {number} b - Blue value
 */
function neonText(text, x, y, r, g, b, alhpa) {
  ctx.save();
  ctx.strokeStyle = "rgba(" + r + "," + g + "," + b + ",0.2)";
  ctx.lineWidth = 10.5;
  ctx.strokeText(text, x, y);
  ctx.lineWidth = 8;
  ctx.strokeText(text, x, y);
  ctx.lineWidth = 5.5;
  ctx.strokeText(text, x, y);
  ctx.lineWidth = 3;
  ctx.strokeText(text, x, y);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1.5;
  ctx.strokeText(text, x, y);
  ctx.restore();
};

/**
 * Draw the top and bottom time bars
 */
function drawTimeUi() {
  ctx.save();
  ctx.fillStyle = '#222';

  // top bar
  ctx.beginPath();
  ctx.moveTo(0, 43 * options.uiScale);
  ctx.lineTo(80 * options.uiScale, 43 * options.uiScale);
  for (let i = 1; i <= 10 * options.uiScale | 0; i++) {
    ctx.lineTo(80 * options.uiScale +i*2, 43 * options.uiScale -i*2);
    ctx.lineTo(80 * options.uiScale +i*2+2, 43 * options.uiScale -i*2);
  }

  let position = 130 + translation.time.length * 10;
  ctx.lineTo(position * options.uiScale, 23 * options.uiScale);
  for (let i = 1; i <= 10 * options.uiScale | 0; i++) {
    ctx.lineTo(position * options.uiScale +i*2, 23 * options.uiScale -i*2);
    ctx.lineTo(position * options.uiScale +i*2+2, 23 * options.uiScale -i*2);
  }
  ctx.lineTo((position + 22) * options.uiScale, 0);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();

  // bottom bar
  ctx.beginPath();
  let y = kontra.canvas.height - 25 * options.uiScale;
  ctx.moveTo(0, y);

  position = 85 + translation.best.length * 10;
  ctx.lineTo(position * options.uiScale, y);
  for (let i = 1; i <= 10 * options.uiScale | 0; i++) {
    ctx.lineTo(position * options.uiScale +i*2, y+i*2);
    ctx.lineTo(position * options.uiScale +i*2+2, y+i*2);
  }
  ctx.lineTo((position + 22) * options.uiScale, kontra.canvas.height);
  ctx.lineTo(0, kontra.canvas.height);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#fdfdfd';
  let time = getTime(audio.currentTime);

  setFont(40);
  ctx.fillText(getSeconds(time).padStart(3, ' '), 5 * options.uiScale, 35 * options.uiScale);
  setFont(18);
  ctx.fillText(':' + getMilliseconds(time).padStart(2, '0') + '\t' + translation.time, 80 * options.uiScale, 17 * options.uiScale);
  ctx.fillText(bestTime.padStart(6, ' ') + '\t' + translation.best, 5 * options.uiScale, kontra.canvas.height - 5 * options.uiScale);
  ctx.restore();
}

/**
 * Draw the XBOX A button.
 * @param {number} x - X position
 * @param {number} y - Y position
 */
function drawAButton(x, y) {
  ctx.save();
  ctx.fillStyle = 'green';
  ctx.beginPath();
  ctx.arc(x, y, fontMeasurement, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'black';
  setFont(27);
  ctx.fillText('A', x - fontMeasurement / 2, y + fontMeasurement / 2);
  ctx.fillStyle = 'white';
  setFont(25);
  ctx.fillText('A', x - fontMeasurement / 2, y + fontMeasurement / 2);
  ctx.restore();
}

/**
 * Show help text in bottom left corner of screen base don input.
 */
function showHelpText() {
  ctx.save();

  if (lastUsedInput === 'keyboard') {
    setFont(18);
    ctx.fillStyle = 'white';
    ctx.fillText(translation.spacebar + ' ' + translation.select, 28 - fontMeasurement, kontra.canvas.height - 25 + fontMeasurement / 2.5);
  }
  else if (lastUsedInput === 'gamepad') {
    drawAButton(28, kontra.canvas.height - 25);
    setFont(18);
    ctx.fillStyle = 'white';
    ctx.fillText(translation.select, 28 + fontMeasurement * 1.75, kontra.canvas.height - 25 + fontMeasurement / 2.5);
  }

  ctx.restore();
}