//------------------------------------------------------------
// Game Scene
//------------------------------------------------------------
let startMove;
let startCount;
let gameScene = Scene('game');
let shipIndex;
let lastMove;
let lastY;
let slowStartInc;
gameScene.add({
  render() {
    // context.currentTime would be as long as the audio took to load, so was
    // always off. seems it's not meant for large files. better to use audio
    // element and play it right on time
    // @see https://stackoverflow.com/questions/33006650/web-audio-api-and-real-current-time-when-playing-an-audio-file

    // calculate speed of the audio wave based on the current time
    let move, startIndex = 0, ampBar, collisionIndex;
    if (audio.currentTime || !audio.paused) {
      move = Math.round((audio.currentTime / audio.duration) * (peaks.length * waveWidth));
      startIndex = move / waveWidth | 0;

      // prevent the ship from jumping at the beginning due to a difference in
      // speed and the audio being slow to start by slowing reducing the move speed
      // to match up with the audio
      let priorMove = Math.round(slowStartInc * ++startCount);
      if (audio.currentTime < 1 && move < priorMove && !audio.paused) {
        console.log('\nmove:', move);
        console.log('priorMove:', priorMove);
        move = priorMove;
        slowStartInc -= 0.05;
      }
    }
    else {
      move = startMove + tutorialMoveInc * startCount;

      if (!gameOverScene.active) {
        startCount++;

        if (move >= 0) {
          startCount = 0;
          slowStartInc = tutorialMoveInc;
          showTutorialBars = false;
          audio.play();
        }
      }
    }

    let dx = move - lastMove;
    shipIndex = startIndex + maxLength / 2;

    // only draw the bars on the screen
    for (let i = startIndex; i < startIndex + maxLength && waveData[i]; i++) {
      let wave = waveData[i];
      let x = wave.x - move;

      let topY = wave.y;
      let botY = kontra.canvas.height - wave.height - wave.offset + wave.yOffset;
      let topHeight = wave.height - wave.offset + wave.yOffset;
      let botHeight = wave.height + wave.offset - wave.yOffset;

      // detect all bars the ship could have moved through and see if it collided
      // with it at the point in time
      if (!gameOverScene.active && !options.casual &&
          x >= ship.x - dx && x <= ship.x) {
        collisionIndex = collisionIndex || i;
        dy = ship.y - lastY;
        let numBars = dx / waveWidth | 0;
        let yStep = dy / numBars;
        let step = i - collisionIndex;
        let shipX = (ship.x - dx) + waveWidth * step;
        let shipY = lastY + yStep * step;

        if (collides(shipX, shipY, x, topY, topHeight) ||
            collides(shipX, shipY, x, botY, botHeight) ||
            ship.y < -50 ||
            ship.y > kontra.canvas.height + 50) {
          ship.render(move);  // render the ship to get the last point on before game over
          gameOver();
        }
      }

      // keep track of the amp bar
      if (x > waveWidth * (maxLength / 2 - 1) && x < waveWidth * (maxLength / 2 + 1)) {
        ampBar = wave;
      }
      else {
        ctx.fillStyle = '#00a3dc';
        ctx.fillRect(x, topY, wave.width, topHeight);  // top bar
        ctx.fillRect(x, botY, wave.width, botHeight);  // bottom bar
      }
    }

    // draw amp bar
    if (ampBar) {
      let x = ampBar.x - move - waveWidth;
      let width = ampBar.width + waveWidth * 2;
      let topY = ampBar.y;
      let botY = kontra.canvas.height - ampBar.height - ampBar.offset + ampBar.yOffset;
      let topHeight = ampBar.height - ampBar.offset + ampBar.yOffset;
      let botHeight = ampBar.height + ampBar.offset - ampBar.yOffset;

      neonRect(x, topY, width, topHeight, 255, 0, 0);
      neonRect(x, botY, width, botHeight, 255, 0, 0);
    }

    ship.render(move);

    while (ship.points.length && ship.points[0].x - move < 0 - ship.width) {
      ship.points.shift();
    }

    drawTimeUi();

    if (!winScene.active && waveData[waveData.length - 1].x - move <= kontra.canvas.width / 2) {
      win();
    }

    lastMove = move;
    lastY = ship.y;
  }
});