//------------------------------------------------------------
// Game Over Scene
//------------------------------------------------------------
let gameOverScene = Scene('gameOver');
gameOverScene.add({
  render() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, kontra.canvas.width, kontra.canvas.height);
  }
});
let gameOverText = Text({
  x: kontra.canvas.width / 2,
  y: kontra.canvas.height / 2 - 150,
  center: true,
  text() {
    return translation.gameOver;
  },
  maxWidth: kontra.canvas.width - 100,
});
let restartBtn = Button({
  x: kontra.canvas.width / 2,
  y: kontra.canvas.height / 2,
  text() {
    return translation.restart;
  },
  onDown() {
    showTutorialBars = true;
    gameOverScene.hide();
    gameScene.hide(() => start());
  }
});
let menuBtn = Button({
  x: kontra.canvas.width / 2,
  prev: restartBtn,
  text() {
    return translation.mainMenu;
  },
  onDown() {
    gameScene.hide(() => {
      showTutorialBars = false;
    });
    gameOverScene.hide(() => {
      menuScene.show(() => startBtn.domEl.focus());
    });
  }
});
gameOverScene.add(gameOverText, restartBtn, menuBtn);