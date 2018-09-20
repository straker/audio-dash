//------------------------------------------------------------
// Menu Scene
//------------------------------------------------------------
let menuScene = Scene('menu');
menuScene.add({
  // treat the logo as a single unit so we can move the entire thing together
  x: 50,
  y: 100,
  render() {
    ctx.save();
    ctx.globalAlpha = this.parent.alpha;
    ctx.translate(this.x, this.y);

    let points = [
      {x: 0, y: 162},
      {x: 30, y: 162},
      {x: 38, y: 170},
      {x: 46, y: 178},
      {x: 54, y: 181},
      {x: 62, y: 179},
      {x: 70, y: 172},
      {x: 78, y: 164},
      {x: 86, y: 156},
      {x: 94, y: 149},
      {x: 102, y: 147},
      {x: 110, y: 150},
      {x: 118, y: 158},
      {x: 126, y: 166},
      {x: 156, y: 166}
    ];

    neonLine(points, 0, 0, 163, 220);
    ctx.font = "150px 'Lucida Console', Monaco, monospace"
    neonText('AUDIO', 0, 100, 0, 163, 220);
    neonText('DASH', 181, 215, 255, 0, 0);

    ctx.fillStyle = '#fff';
    ctx.font = "30px 'Lucida Console', Monaco, monospace"
    ctx.fillText('Ride the Waves of Your Music', 15, 260);

    ctx.restore();
  }
});
let startBtn = Button({
  x: kontra.canvas.width / 2,
  y: kontra.canvas.height / 2,
  text() {
    return translation.start;
  },
  onDown() {
    audio.play();
    audio.pause();
    menuScene.hide(() => {
      start();
    });
  }
});
let uploadBtn = Button({
  x: kontra.canvas.width / 2,
  prev: startBtn,
  text() {
    return translation.upload;
  },
  onDown() {
    uploadFile.click();
  }
});
let optionsBtn = Button({
  x: kontra.canvas.width / 2,
  prev: uploadBtn,
  text() {
    return translation.options;
  },
  onDown() {
    menuScene.hide(() => {
      optionsScene.show();
    });
  }
});
menuScene.add(startBtn, uploadBtn, optionsBtn);