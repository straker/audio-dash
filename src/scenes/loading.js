//------------------------------------------------------------
// Loading Scene
//------------------------------------------------------------
let loadingScene = Scene('upload');
let loadingTimer = 0;

loadingScene.onShow = () => {
  loadingTimer = 0;
}

let loadingText = Text({
  x: kontra.canvas.width / 2,
  y: kontra.canvas.height / 2,
  center: true,
  text() {
    ++loadingTimer;
    let text = translation.loading + '   ';
    if (loadingTimer >= 60) {
      text = setCharAt(text, text.length - 3, '.');
    }
    if (loadingTimer >= 120) {
      text = setCharAt(text, text.length - 2, '.');
    }
    if (loadingTimer >= 180) {
      text = setCharAt(text, text.length - 1, '.');
    }
    if (loadingTimer >= 240) {
      loadingTimer = 0;
    }

    return text;
  }
});
loadingScene.add(loadingText);