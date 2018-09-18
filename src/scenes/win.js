//------------------------------------------------------------
// Win Scene
//------------------------------------------------------------
let winScene = Scene('win');
winScene.add({
  render() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, kontra.canvas.width, kontra.canvas.height);
  }
});
let winText = Text({
  x: kontra.canvas.width / 2,
  y: kontra.canvas.height / 2 - 150,
  center: true,
  text() {
    return translation.completed;
  },
  maxWidth: kontra.canvas.width - 100,
});
let winMenuBtn = Button({
  x: kontra.canvas.width / 2,
  y: kontra.canvas.height / 2,
  text() {
    return translation.mainMenu;
  },
  onDown() {
    gameScene.hide();
    winScene.hide(() => {
      menuScene.show(() => startBtn.domEl.focus());
    });
  }
});
let winUploadBtn = Button({
  x: kontra.canvas.width / 2,
  prev: winMenuBtn,
  text() {
    return translation.upload;
  },
  onDown() {
    uploadFile.click();
  }
});
winScene.add(winText, winMenuBtn, winUploadBtn);