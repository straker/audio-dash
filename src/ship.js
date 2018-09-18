//------------------------------------------------------------
// Ship
//------------------------------------------------------------
let ship = kontra.sprite({
  x: kontra.canvas.width / 2 - waveWidth / 2,
  y: kontra.canvas.height / 2 - waveWidth / 2,
  width: waveWidth,
  height: waveWidth,
  gravity: 5,
  points: [],
  maxAcc: 8,
  update() {
    if (kontra.keys.pressed('space') || touchPressed || (gamepad && gamepad.buttons[0].pressed)) {
      this.ddy = -this.gravity;

      isTutorial = false;
    }
    else {
      this.ddy = this.gravity;
    }

    // until the player presses the button don't move the ship with gravity
    if (isTutorial) return;

    this.y += this.dy;
    this.dy += this.ddy;

    let maxAcc = this.maxAcc;
    if (Math.sqrt(this.dy * this.dy) > maxAcc) {
      this.dy = this.dy < 0 ? -maxAcc : maxAcc;
    }

    // a casual game should also keep the ship on the screen
    if (options.casual) {
      if (this.y > kontra.canvas.height - 5) {
        this.y = kontra.canvas.height - 5;
      }
      if (this.y < 5) {
        this.y = 5;
      }
    }
  },
  render(move) {

    // prevent the points array from populating while the ship isn't moving
    if (numUpdates >= 1 && !gameOverScene.active && !winScene.active) {
      this.points.push({x: this.x + move, y: this.y + 1});
    }

    // draw the line red if it hits a wall
    if (gameOverScene.active) {
      neonRect(this.x, this.y, this.width, this.height, 255, 0, 0);
      neonLine(this.points, move, 255, 0, 0);
    }
    else {
      neonRect(this.x, this.y, this.width, this.height, 0, 163, 220);
      neonLine(this.points, move, 0, 163, 220);
    }
  }
});