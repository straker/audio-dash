kontra.init();

//------------------------------------------------------------
// Global variables
//------------------------------------------------------------
const ctx = kontra.context;
const mid = kontra.canvas.height / 2;  // midpoint of the canvas
const waveWidth = 2;
const waveHeight = 215;
const maxLength = kontra.canvas.width / waveWidth + 2 | 0; // maximum number of peaks to show on screen
const defaultOptions = {
  volume: 1,
  uiScale: 1,
  gameSpeed: 1,
  language: 'en',
  peaks: 1,
  casual: 0,
};

let audio;  // audio file for playing/pausing
let peaks;  // peak data of the audio file
let waveData;  // array of wave audio objects based on peak data
let startBuffer;  // duplicated wave data added to the front of waveData to let the game start in the middle of the screen
let loop;  // game loop
let songName = 'AudioDashDefault.mp3';  // name of the song
let bestTimes;  // object of best times for all songs
let bestTime;  // best time for a single song
let activeScenes = [];  // currently active scenes
let focusedBtn;  // currently focused button
let options = Object.assign(  // options for the game
  {},
  defaultOptions,
  kontra.store.get('audio-dash:options')
);
let fontMeasurement;  // size of text letter
let gamepad;  // gamepad state
let lastUsedInput;  // keep track of last used input device
let objectUrl;  // in-memory url of audio files
let fadeTime = 450;  // how long a scene takes to fade
let translation;




//------------------------------------------------------------
// Helper functions
//------------------------------------------------------------

/**
 * Clamp a value between min and max values.
 * @param {number} value - Value to clamp.
 * @param {number} min - Min value.
 * @param {number} max - Max value.
 */
function clamp(value, min, max) {
  return Math.min( Math.max(min, value), max);
}

/**
 * Collision detection between ship and bar
 * @param {number} shipX - X position of the ship
 * @param {number} shipY - Y position of the ship
 * @param {number} barX - X position of the bar
 * @param {number} barY - Y position of the bar
 * @param {number} barHeight - Height of the bar after offsets
 */
function collides(shipX, shipY, barX, barY, barHeight) {
  return shipX < barX + waveWidth &&
         shipX + ship.width > barX &&
         shipY < barY + barHeight &&
         shipY + ship.height > barY;
}

/**
 * Replace a character of a string at the specified index.
 * @see https://stackoverflow.com/a/1431110/2124254
 * @param {string} str - String to replace character
 * @param {number} index - Index of the character to replace
 * @param {string} chr - Character to replace with
 */
function setCharAt(str,index,chr) {
  if(index > str.length-1) return str;
  return str.substr(0,index) + chr + str.substr(index+1);
}

/**
 * Set font size.
 * @param {number} size - Size of font
 */
function setFont(size) {
  ctx.font = size * options.uiScale + "px 'Lucida Console', Monaco, monospace";
}

/**
 * Set font measurement
 */
function setFontMeasurement() {
  fontMeasurement = 15 * options.uiScale;
}

/**
 * Set the game language.
 * @param {string} locale - locale code
 */
function setLanguage(locale) {
  translation = translations[locale] || translations.en;
}





//------------------------------------------------------------
// Main functions
//------------------------------------------------------------

/**
 * Start the game.
 */
function start() {
  startMove = -kontra.canvas.width / 2 | 0;
  startCount = 0;

  audio.currentTime = 0;
  audio.volume = options.volume;
  audio.playbackRate = options.gameSpeed;

  ship.points = [];
  ship.y = mid;

  tutorialMoveInc = tutorialMoveIncStart * audio.playbackRate;
  showTutorialBars = true;
  isTutorial = true;
  tutorialScene.show();
}

/**
 * Show game over scene.
 */
function gameOver() {
  audio.pause();
  setBestTime();
  gameOverScene.show(() => restartBtn.focus());
}

/**
 * Show win scene.
 */
function win() {
  audio.pause();
  setBestTime();
  winScene.show(() => winMenuBtn.focus());
}