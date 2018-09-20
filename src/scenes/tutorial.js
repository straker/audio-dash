//------------------------------------------------------------
// Tutorial Scene
//------------------------------------------------------------
let isTutorial = true;
let tutorialMove = 0;
let tutorialMoveIncStart = 5;
let showTutorialBars = false;

let tutorialScene = Scene('tutorial');
let tutorialText = Text({
  x: kontra.canvas.width / 2,
  y: kontra.canvas.height / 2 - 200,
  maxWidth: kontra.canvas.width - 100,
  center: true,
  text() {
    let text = translation.tapHold;

    if (lastUsedInput === 'gamepad') {
      drawAButton(this.x - fontMeasurement, this.y + fontMeasurement * 1.5);
    }
    else if (lastUsedInput === 'keyboard' || lastUsedInput === 'mouse') {
      text = translation.spacebar + ' ' + text;
    }

    return text;
  }
});
tutorialScene.add(tutorialText);