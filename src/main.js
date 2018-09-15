async function main() {
  setFontMeasurement();
  getBestTime();
  loadingScene.show();

  // music from https://opengameart.org/content/adventure-theme
  await fetchAudio('./' + songName);
  loadingScene.hide(() => {
    menuScene.show(() => startBtn.focus());
  });
}

main();