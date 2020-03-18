/*
 * Kontra.js v4.0.1 (Custom Build on 2018-08-21) | MIT
 * Build: https://straker.github.io/kontra/download?files=gameLoop+keyboard+sprite+store
 */
kontra={init(t){var n=this.canvas=document.getElementById(t)||t||document.querySelector("canvas");this.context=n.getContext("2d")},_noop:new Function,_tick:new Function};
kontra.gameLoop=function(e){let t,n,a,r,o=(e=e||{}).fps||60,i=0,p=1e3/o,c=1/o,s=!1===e.clearCanvas?kontra._noop:function(){kontra.context.clearRect(0,0,kontra.canvas.width,kontra.canvas.height)};function d(){if(n=requestAnimationFrame(d),a=performance.now(),r=a-t,t=a,!(r>1e3)){for(kontra._tick(),i+=r;i>=p;)m.update(c),i-=p;s(),m.render()}}let m={update:e.update,render:e.render,isStopped:!0,start(){t=performance.now(),this.isStopped=!1,requestAnimationFrame(d)},stop(){this.isStopped=!0,cancelAnimationFrame(n)}};return m};
!function(){let n={},t={},e={13:"enter",27:"esc",32:"space",37:"left",38:"up",39:"right",40:"down"};for(let n=0;n<26;n++)e[65+n]=(10+n).toString(36);for(i=0;i<10;i++)e[48+i]=""+i;addEventListener("keydown",function(i){let c=e[i.which];t[c]=!0,n[c]&&n[c](i)}),addEventListener("keyup",function(n){t[e[n.which]]=!1}),addEventListener("blur",function(n){t={}}),kontra.keys={bind(t,e){[].concat(t).map(function(t){n[t]=e})},unbind(t,e){[].concat(t).map(function(t){n[t]=e})},pressed:n=>!!t[n]}}();
!function(){class t{constructor(t,i){this._x=t||0,this._y=i||0}add(t,i){this.x+=(t.x||0)*(i||1),this.y+=(t.y||0)*(i||1)}clamp(t,i,h,s){this._c=!0,this._a=t,this._b=i,this._d=h,this._e=s}get x(){return this._x}get y(){return this._y}set x(t){this._x=this._c?Math.min(Math.max(this._a,t),this._d):t}set y(t){this._y=this._c?Math.min(Math.max(this._b,t),this._e):t}}kontra.vector=((i,h)=>new t(i,h)),kontra.vector.prototype=t.prototype;class i{init(t,i,h,s){for(i in t=t||{},this.position=kontra.vector(t.x,t.y),this.velocity=kontra.vector(t.dx,t.dy),this.acceleration=kontra.vector(t.ddx,t.ddy),this.width=this.height=0,this.context=kontra.context,t)this[i]=t[i];if(h=t.image)this.image=h,this.width=h.width,this.height=h.height;else if(h=t.animations){for(i in h)this.animations[i]=h[i].clone(),s=s||h[i];this._ca=s,this.width=s.width,this.height=s.height}return this}get x(){return this.position.x}get y(){return this.position.y}get dx(){return this.velocity.x}get dy(){return this.velocity.y}get ddx(){return this.acceleration.x}get ddy(){return this.acceleration.y}set x(t){this.position.x=t}set y(t){this.position.y=t}set dx(t){this.velocity.x=t}set dy(t){this.velocity.y=t}set ddx(t){this.acceleration.x=t}set ddy(t){this.acceleration.y=t}isAlive(){return this.ttl>0}collidesWith(t){return this.x<t.x+t.width&&this.x+this.width>t.x&&this.y<t.y+t.height&&this.y+this.height>t.y}update(t){this.advance(t)}render(){this.draw()}playAnimation(t){this._ca=this.animations[t],this._ca.loop||this._ca.reset()}advance(t){this.velocity.add(this.acceleration,t),this.position.add(this.velocity,t),this.ttl--,this._ca&&this._ca.update(t)}draw(){this.image?this.context.drawImage(this.image,this.x,this.y):this._ca?this._ca.render(this):(this.context.fillStyle=this.color,this.context.fillRect(this.x,this.y,this.width,this.height))}}kontra.sprite=(t=>(new i).init(t)),kontra.sprite.prototype=i.prototype}();
kontra.store={set(t,e){void 0===e?localStorage.removeItem(t):localStorage.setItem(t,JSON.stringify(e))},get(t){let e=localStorage.getItem(t);try{e=JSON.parse(e)}catch(t){}return e}};
let mergedPeaks;
let splitPeaks;

/**
 * Wave code taken from wavesurfer.js
 * @see https://github.com/katspaugh/wavesurfer.js
 */
function exportPCM(length, accuracy, noWindow, start) {
  length = length || 1024;
  start = start || 0;
  accuracy = accuracy || 10000;
  const peaks = getPeaks(length, start);

  // find largest peak and treat it as peaks of 1 and normalize rest of peaks
  let maxPeak = 0;
  let arr = [].map.call(peaks, peak => {
    if (peak > maxPeak) {
      maxPeak = peak;
    }
    return peak;
  });
  let normalizePeak = 1 - maxPeak;
  arr = arr.map(peak =>  Math.round((peak + normalizePeak) * accuracy) / accuracy);

  return arr;
}

function setLength(length) {
  splitPeaks = [];
  mergedPeaks = [];
  // Set the last element of the sparse array so the peak arrays are
  // appropriately sized for other calculations.
  const channels = buffer ? buffer.numberOfChannels : 1;
  let c;
  for (c = 0; c < channels; c++) {
    splitPeaks[c] = [];
    splitPeaks[c][2 * (length - 1)] = 0;
    splitPeaks[c][2 * (length - 1) + 1] = 0;
  }
  mergedPeaks[2 * (length - 1)] = 0;
  mergedPeaks[2 * (length - 1) + 1] = 0;
}

function getPeaks(length, first, last) {
  first = first || 0;
  last = last || length - 1;

  setLength(length);

  /**
   * The following snippet fixes a buffering data issue on the Safari
   * browser which returned undefined It creates the missing buffer based
   * on 1 channel, 4096 samples and the sampleRate from the current
   * webaudio context 4096 samples seemed to be the best fit for rendering
   * will review this code once a stable version of Safari TP is out
   */
  // if (!buffer.length) {
  //     const newBuffer = this.createBuffer(1, 4096, this.sampleRate);
  //     buffer = newBuffer.buffer;
  // }

  const sampleSize = buffer.length / length;
  const sampleStep = ~~(sampleSize / 10) || 1;
  const channels = buffer.numberOfChannels;
  let c;

  for (c = 0; c < channels; c++) {
      const peaks = splitPeaks[c];
      const chan = buffer.getChannelData(c);
      let i;

      for (i = first; i <= last; i++) {
          const start = ~~(i * sampleSize);
          const end = ~~(start + sampleSize);
          let min = 0;
          let max = 0;
          let j;

          for (j = start; j < end; j += sampleStep) {
              const value = chan[j];

              if (value > max) {
                  max = value;
              }

              if (value < min) {
                  min = value;
              }
          }

          peaks[2 * i] = max;
          peaks[2 * i + 1] = min;

          if (c == 0 || max > mergedPeaks[2 * i]) {
              mergedPeaks[2 * i] = max;
          }

          if (c == 0 || min < mergedPeaks[2 * i + 1]) {
              mergedPeaks[2 * i + 1] = min;
          }
      }
  }

  return mergedPeaks;
}
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
//------------------------------------------------------------
// Button
//------------------------------------------------------------
let uiSpacer = 5;
let startY = 170;  // where the first button on scenes typically starts

/**
 * Set the dimensions of the UI element.
 * @param {object} uiEl - UI element
 */
function setDimensions(uiEl) {
  let text = typeof uiEl.text === 'function' ? uiEl.text() : uiEl.text;
  let fontMeasure = (uiEl.size ? uiEl.size-5 : 25) / 25 * fontMeasurement;

  uiEl.width = text.length * fontMeasure + fontMeasure * 2;
  uiEl.height = fontMeasure * 3;

  if (uiEl.center) {
    uiEl.x = uiEl.orgX - uiEl.width / 2;
  }

  // set the y position based on the position of another element
  if (uiEl.prev) {
    uiEl.y = uiEl.prev.y + uiEl.prev.height * 1.5 + uiSpacer / options.uiScale;
  }
  else {
    uiEl.y = uiEl.orgY - uiEl.height / 2;
  }

  uiEl.y += uiEl.margin || 0;
}

/**
 * Button UI element.
 * @param {object} props - Properties of the button
 */
function Button(props) {
  props.orgX = props.x;
  props.orgY = props.y;
  props.type = 'button';

  if (typeof props.center === 'undefined') {
    props.center = true;
  }

  setDimensions(props);

  props.render = function() {
    setDimensions(this);

    ctx.save();
    setFont(25);

    ctx.fillStyle = '#222';
    let args = [this.x, this.y, this.width, this.height];
    ctx.fillRect.apply(ctx, args);

    if (this.focused) {
      args.push(255, 0, 0);
      }
    else if (this.disabled) {
      args.push(50, 50, 50, '#747474');
    }
    else {
      args.push(0, 163, 220);
    }

    neonRect.apply(null, args);

    ctx.fillStyle = this.disabled ? '#747474' : '#fff';
    let text = typeof this.text === 'function' ? this.text() : this.text;
    let label = this.label ? this.label() : null

    // update the HTML element with the new text
    if (!label && this.lastText !== text) {
      this.lastText = text;
      this.domEl.textContent = text;
    }
    else if (label && this.lastLabel !== label) {
      this.lastLabel = label;
      this.domEl.textContent = label;
    }

    ctx.fillText(text, this.x + fontMeasurement, this.y + fontMeasurement * 2);
    ctx.restore();
  };
  props.focus = function() {
    if (focusedBtn && focusedBtn.blur) focusedBtn.blur();

    focusedBtn = this;
    this.focused = true;
    this.domEl.focus();
  };
  props.blur = function() {
    this.focused = false;
    focusedBtn = null;
  };

  let button = kontra.sprite(props);

  // create accessible html button for screen readers
  let el = document.createElement('button');
  el.textContent = button.label
    ? button.label()
    : typeof button.text === 'function' ? button.text() : button.text;
  el.addEventListener('focus', button.focus.bind(button));
  button.domEl = el;

  Object.defineProperty(button, 'disabled', {
    get() { return this.domEl.disabled },
    set(value) { this.domEl.disabled = value }
  });

  return button;
}





//------------------------------------------------------------
// Text
//------------------------------------------------------------
function Text(props) {
  props.orgX = props.x;
  props.orgY = props.y;

  setDimensions(props);

  props.render = function() {
    setDimensions(this);

    let text = typeof this.text === 'function' ? this.text() : this.text;

    // update the HTML element with the new text
    if (this.lastText !== text) {
      this.lastText = text;
      this.domEl.textContent = text;
    }

    ctx.save();
    ctx.fillStyle = '#fff';
    let fontSize = this.size || 25;
    setFont(fontSize);

    // wrap the text string if it grows beyond maxWidth
    if (this.maxWidth && this.width > this.maxWidth) {

      let width = text.length * fontMeasurement + fontMeasurement * 2;
      let fontMeasure = fontMeasurement;
      let topText, botText, index;

      // keep replacing spaces with newlines until the width is good
      while (width > this.maxWidth) {
        index = text.lastIndexOf(' ', index ? index-1 : text.length);
        topText = text.substring(0, index);
        botText = text.substr(index+1);
        width = Math.max(topText.length, botText.length) * fontMeasurement + fontMeasurement * 2;
      }

      if (this.center) {
        this.x = this.orgX - width / 2;
      }

      ctx.textBaseline = 'bottom';
      ctx.fillText(topText, this.x + fontMeasurement, this.y + fontMeasurement * 1.5);

      ctx.textBaseline = 'top';
      ctx.fillText(botText, this.x + fontMeasurement, this.y + fontMeasurement * 1.5);
    }
    else {
      ctx.fillText(text, this.x + fontMeasurement, this.y + fontMeasurement * 2);
    }

    ctx.restore();
  };

  let text = kontra.sprite(props);

  // create accessible html text for screen readers
  let el = document.createElement('div');

  // announce changes to screen reader
  if (props.live) {
    el.setAttribute('role', 'alert');
    el.setAttribute('aria-live', 'assertive');
    el.setAttribute('aria-atomic', true);
  }
  text.domEl = el;

  return text;
}
const translations = {"en":{"_name_":"English","loading":"Loading","start":"Start","upload":"Upload Song","options":"Options","spacebar":"[Spacebar]","select":"Select","volume":"Volume","increase_volume":"Increase Volume","decrease_volume":"Decrease Volume","uiScale":"UI Scale","increase_uiScale":"Increase UI Scale","decrease_uiScale":"Decrease UI Scale","gameSpeed":"Game Speed","increase_gameSpeed":"Increase Game Speed","decrease_gameSpeed":"Decrease Game Speed","peaks":"Peaks","increase_peaks":"Increase Peaks","decrease_peaks":"Decrease Peaks","casual":"Casual","on_casual":"Turn on Casual","off_casual":"Turn off Casual","language":"Language","save":"Save","cancel":"Cancel","time":"TIME","best":"BEST","tapHold":"Tap or Hold","gameOver":"Game Over","restart":"Restart","mainMenu":"Main Menu","completed":"Song Completed!"}};
setLanguage(options.language);
//------------------------------------------------------------
// Scene
//------------------------------------------------------------
let scenes = [];
function Scene(name) {

  // create dom element to hold scene dom elements for screen readers.
  // this lets me hide the parent element and not each child, which caused
  // lag
  let sceneEl = document.createElement('div');
  sceneEl.hidden = true;
  uiScenes.appendChild(sceneEl);

  let scene = {
    name: name,
    alpha: 0,
    active: false,
    children: [],
    inc: 0.05,
    isHidding: false,

    // create a fade in/out transitions when hiding and showing scenes
    hide(cb) {
      if (focusedBtn) focusedBtn.blur();

      this.isHidding = true;
      sceneEl.hidden = true;
      this.alpha = 1;
      this.inc = -0.05;
      setTimeout(() => {
        this.isHidding = false;
        this.active = false;
        activeScenes.splice(activeScenes.indexOf(this), 1);
        cb && cb();
      }, fadeTime);
    },
    show(cb) {
      this.active = true;
      sceneEl.hidden = false;
      activeScenes.push(this);
      this.alpha = 0;
      this.inc = 0.05;
      setTimeout(() => {
        if (this.onShow) this.onShow();
        cb && cb();
      }, fadeTime)
    },
    add() {
      Array.from(arguments).forEach(child => {
        child.parent = this;
        this.children.push(child);

        if (child.domEl) {
          sceneEl.appendChild(child.domEl);
        }
      });
    },
    update() {
      this.children.forEach(child => {
        if (child.update) {
          child.update()
        }
      });
    },
    render() {
      this.alpha = clamp(this.alpha + this.inc, 0, 1);

      ctx.save();
      ctx.globalAlpha = this.alpha;

      this.children.forEach(child => child.render());

      ctx.restore();
    }
  };

  scenes.push(scene);
  return scene;
}
//------------------------------------------------------------
// Audio functions
//------------------------------------------------------------
let AudioContext = new (window.AudioContext || window.webkitAudioContext)();
uploadFile.addEventListener('change', uploadAudio);

/**
 * Load audio file as an ArrayBuffer.
 * @param {string} url - URL of the audio file
 * @returns {Promise} resolves with decoded audio data
 */
function loadAudioBuffer(url) {

  // we can't use fetch because response.arrayBuffer() isn't supported
  // in lots of browsers
  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();
    request.responseType = 'arraybuffer';

    request.onload = function() {
      AudioContext.decodeAudioData(request.response, decodedData => {
        resolve(decodedData)
      });
    };

    request.open('GET', url, true);
    request.send();
  });
}

/**
 * Load audio file as an Audio element.
 * @param {string} url - URL of the audio file
 * @returns {Promise} resolves with audio element
 */
function loadAudio(url) {
  return new Promise((resolve, reject) => {
    let audioEl = document.createElement('audio');

    audioEl.addEventListener('canplay', function() {
      resolve(this);
    });

    audioEl.onerror = function(e) {
      console.error('e:', e);
      reject(e);
    };

    audioEl.src = url;
    audioEl.load();
  })
}

/**
 * Upload an audio file from the users computer.
 * @param {Event} e - File change event
 */
async function uploadAudio(e) {
  if (gameScene.active) {
    winScene.hide();
    gameScene.hide(() => {
      showTutorialBars = false;
      loadingScene.show();
    });
  }
  else {
    menuScene.hide(() => loadingScene.show());
  }

  // clear any previous uploaded song
  URL.revokeObjectURL(objectUrl);

  let file = e.currentTarget.files[0];
  objectUrl = URL.createObjectURL(file);
  songName = uploadFile.value.replace(/^.*fakepath/, '').substr(1);

  await fetchAudio(objectUrl);
  getBestTime();
  loadingScene.hide();
  startBtn.onDown();
}

/**
 * Generate the wave data for an audio file.
 * @param {string} url - URL of the audio file
 */
async function fetchAudio(url) {
  buffer = await loadAudioBuffer(url);
  audio = await loadAudio(url);

  generateWaveData();

  return Promise.resolve();
}

function generateWaveData() {
  // numPeaks determines the speed of the game, the less peaks per duration, the
  // slower the game plays
  let numPeaks = audio.duration / 8 | 0;
  peaks = exportPCM(1024 * numPeaks);  // change this by increments of 1024 to get more peaks

  startBuffer = new Array(maxLength / 2 | 0).fill(0);

  // remove all negative peaks
  let waves = peaks
    .map((peak, index) => peak >= 0 ? peak : peaks[index-1]);

  let pos = mid;  // position of next turn
  let lastPos = 0;  // position of the last turn
  let gapDistance = maxLength;  // how long to get to the next turn
  let step = 0;  // increment of each peak to pos
  let offset = 0;  // offset the wave data position to create curves

  let minBarDistance = 270;  // min distance between top and bottom wave bars
  let heightDt = minBarDistance - waveHeight + 10;  // distance between max height and wave height
  let heightStep = heightDt / (startBuffer.length + waves.length);  // game should reach the max bar height by end of the song
  let counter = 0;
  let peakVisited = false;
  let obstacle;
  let prevObstacle;

  let yPos = 0;
  let yLastPos = 0;
  let yGapDistance = maxLength;
  let yStep = 0;
  let yOffset = 0;
  let yCounter = 0;

  let isIntroSong = songName === 'AudioDashDefault.mp3';
  let peakSequence = [Infinity, 8, 4, 2, 1, 1/2, 1/4, 1/8, 1/16, 1/32, 0];
  let peakDistance = peakSequence[options.peaks*10] * maxLength;
  let peakCounter = 0;

  Random.setValues(peaks);

  waveData = startBuffer
    .concat(waves)
    .map((peak, index, waves) => {

      // if (index === 13146) {
      //   debugger;
      // }

      let maxPos = (190 - heightStep * index) / 2;

      // for the intro song give the player some time to get use to the controls
      // before adding curves (numbers are tailored to points in the song)
      let firstCurveIndex = maxLength * (isIntroSong ? 4 : 1);
      if (index >= firstCurveIndex) {
        offset += step;

        // the steeper the slope the less drastic position changes we should have
        yOffset += Math.abs(step) > 1
          ? yStep / (Math.abs(step) * 1.25)
          : yStep;

        if (yPos < 0 && yOffset < yPos ||
            yPos > 0 && yOffset > yPos) {
          yOffset = yPos;
        }

        // all calculations are based on the peaks data so that the path is the
        // same every time
        let peakIndex = index - startBuffer.length;
        Random.seed(peakIndex);

        if (++counter >= gapDistance) {
          counter = 0;
          lastPos = pos;
          pos = mid + Random.getNext(200);
          gapDistance = 300 + Random.getNext(100);
          step = (pos - lastPos) / gapDistance;
        }

        if (++yCounter >= yGapDistance) {
          yCounter = 0;
          lastYPos = yPos;
          yGapDistance = 110 + Random.getNext(23);
          yPos = Random.getNext(maxPos);
          yStep = (yPos - lastYPos) / yGapDistance;
        }
      }

      // a song is more or less "intense" based on how much it switches between
      // high and low peaks. a song like "Through the Fire and the Flames" has
      // a high rate of switching so is more intense. need to look a few peaks
      // before to ensure we find the low peaks
      let peakThreshold = 0.38; // increase or decrease to get less or more obstacles
      let lowPeak = 1;
      for (let i = index - 5; i < index; i++) {
        if (waves[i] < lowPeak) {
          lowPeak = waves[i];
        }
      }

      let maxPeak = 0;
      for (let i = index - 20; i < index+20; i++) {
        if (waves[i] > maxPeak) {
          maxPeak = waves[i];
        }
      }

      // for the intro song give the player some time to get use to the controls
      // before adding obstacles (numbers are tailored to points in the song)
      let firstObstacleIndex = maxLength * (isIntroSong ? 17 : 3);

      // don't create obstacles when the slope of the offset is too large
      let addObstacle = options.peaks &&
        ++peakCounter > peakDistance &&
        index > firstObstacleIndex &&
        peak - lowPeak >= peakThreshold &&
        Math.abs(step) < 1.35;
      let height = addObstacle
        ? kontra.canvas.height / 2 - Math.max(65, 35 * (1 / peak))
        : 160 + peak * waveHeight + heightStep * index;

      if (addObstacle) {
        peakCounter = 0;
      }

      return {
        x: index * waveWidth,
        y: 0,
        width: waveWidth,
        height: height,
        offset: offset,
        yOffset: addObstacle && index > firstObstacleIndex ? yOffset : 0,
        yPos: yPos,
        peak: peak
      };
    });
}
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
//------------------------------------------------------------
// Input Handlers
//------------------------------------------------------------
let touchPressed;
let lastInputTime = 0;
window.addEventListener('mousedown', handleOnDown);
window.addEventListener('touchstart', handleOnDown);
window.addEventListener('mouseup', handleOnUp);
window.addEventListener('touchend', handleOnUp);
window.addEventListener('blur', handleOnUp);
window.addEventListener('beforeunload', () => {
  URL.revokeObjectURL(objectUrl);
});

// remove contextmenu as holding tap on mobile opens it
window.addEventListener('contextmenu', e => {
  e.preventDefault();
  e.stopPropagation();
  return false;
});

/**
 * Detect if a button was clicked.
 * @param {Event} e - Mouse or touch down event
 */
function handleOnDown(e) {
  touchPressed = true;
  uploadBtn.disabled = false;

  let pageX, pageY;
  if (e.type.indexOf('mouse') !== -1) {

    // there's a bug in chrome where it fires a mousedown event right after
    // tapping, so we need to ignore them to get the correct last input
    if (lastUsedInput === 'touch' && performance.now() - lastInputTime < 1000) return;

    lastUsedInput = 'mouse';
    pageX = e.pageX;
    pageY = e.pageY;
  }
  else {
    lastUsedInput = 'touch';

    // touchstart uses touches while touchend uses changedTouches
    // @see https://stackoverflow.com/questions/17957593/how-to-capture-touchend-coordinates
    pageX = (e.touches[0] || e.changedTouches[0]).pageX;
    pageY = (e.touches[0] || e.changedTouches[0]).pageY;
  }

  let x = pageX - kontra.canvas.offsetLeft;
  let y = pageY - kontra.canvas.offsetTop;
  let el = kontra.canvas;

  while ( (el = el.offsetParent) ) {
    x -= el.offsetLeft;
    y -= el.offsetTop;
  }

  // take into account the canvas scale
  let scale = kontra.canvas.offsetHeight / kontra.canvas.height;
  x /= scale;
  y /= scale;

  // last added scene is on top
  for (let i = activeScenes.length - 1, activeScene; activeScene = activeScenes[i]; i--) {
    if (activeScene.children) {
      activeScene.children.forEach(child => {
        if (!child.disabled && child.parent.active && child.onDown && child.collidesWith({
          // center the click
          x: x - 5,
          y: y - 5,
          width: 10,
          height: 10
        })) {
          child.onDown();
          child.blur();
          return;
        }
      });
    }
  }

  lastInputTime = performance.now();
}

/**
 * Release button press.
 */
function handleOnUp() {
  touchPressed = false;
}

/**
 * Move the focused button up or down.
 * @param {number} inc - Direction to move the focus button (1 = down, -1 = up).
 */
function handleArrowDownUp(inc) {
  let activeScene = activeScenes[activeScenes.length - 1];
  let index = activeScene.children.indexOf(focusedBtn);

  while (true) {
    index += inc;

    // if we get to the beginning or end we're already focused on the first/last
    // element
    if (index < 0 || index > activeScene.children.length - 1) {
      return;
    }

    let child = activeScene.children[index];
    if (child && child.focus && !child.disabled) {
      child.focus();
      break;
    }
  }
}

/**
 * Select the focused button
 */
kontra.keys.bind('space', (e) => {
  lastUsedInput = 'keyboard';
  uploadBtn.disabled = false;

  e.preventDefault();
  e.stopPropagation();

  if (focusedBtn && focusedBtn.onDown) {
    focusedBtn.onDown();
  }
});

/**
 * move focus button with arrow keys
 */
kontra.keys.bind('up', (e) => {
  lastUsedInput = 'keyboard';
  uploadBtn.disabled = false;

  e.preventDefault();
  handleArrowDownUp(-1);
});
kontra.keys.bind('down', (e) => {
  lastUsedInput = 'keyboard';
  uploadBtn.disabled = false;

  e.preventDefault();
  handleArrowDownUp(1);
});

/**
 * Don't active controller sticks unless it passes a threshold.
 * @see https://www.smashingmagazine.com/2015/11/gamepad-api-in-web-games/
 * @param {number} number - Thumbstick axes
 * @param {number} threshold
 */
function applyDeadzone(number, threshold){
  percentage = (Math.abs(number) - threshold) / (1 - threshold);

  if (percentage < 0) {
    percentage = 0;
  }

  return percentage * (number > 0 ? 1 : -1);
}

/**
 * Track gamepad use every frame.
 */
let aDt = 1;
let aDuration = 0;
let axesDt = 1;
let axesDuration = 0;
function updateGamepad() {
  if (!navigator.getGamepads) return;
  gamepad = navigator.getGamepads()[0];

  if (!gamepad) return;

  // A button press
  if (gamepad.buttons[0].pressed) {
    lastUsedInput = 'gamepad';
    aDuration += 1/60;
    aDt += 1/60;

    // it seems the browser won't open the file dialog window when using a
    // controller as the input, even when programmatically calling the click
    // event on the file input
    uploadBtn.disabled = true;
  }
  else {
    aDuration = 0;
    aDt = 1;
  }

  // run the first time immediately then hold for a bit before letting the user
  // continue to press the button down
  if ((aDt > 0.30 || (aDuration > 0.3 && aDt > 0.10)) &&
      gamepad.buttons[0].pressed && focusedBtn && focusedBtn.onDown) {
    aDt = 0;
    focusedBtn.onDown()
  }

  let axes = applyDeadzone(gamepad.axes[1], 0.5);
  let upPressed = axes < 0 || gamepad.buttons[12].pressed;
  let downPressed = axes > 0 || gamepad.buttons[13].pressed

  if (upPressed || downPressed) {
    lastUsedInput = 'gamepad';
    axesDuration += 1/60;
    axesDt += 1/60;
    uploadBtn.disabled = true;
  }
  else {
    axesDuration = 0;
    axesDt = 1;
  }

  if (axesDt > 0.30 || (axesDuration > 0.3 && axesDt > 0.10)) {
    if (upPressed) {
      axesDt = 0;
      handleArrowDownUp(-1);
    }
    else if (downPressed) {
      axesDt = 0;
      handleArrowDownUp(1);
    }
  }
}
//------------------------------------------------------------
// Game loop
//------------------------------------------------------------
let updateCounter = 0;
let numUpdates = 0;
loop = kontra.gameLoop({
  update() {
    updateGamepad();

    activeScenes.forEach(scene => scene.update())

    if ((tutorialScene.active || gameScene.active) && !gameOverScene.active && !winScene.active) {
      numUpdates = 0;
      updateCounter += audio.playbackRate;

      while (updateCounter >= 1) {
        numUpdates++
        updateCounter--;
        ship.update();
      }
    }

    if (tutorialScene.active && !isTutorial && !tutorialScene.isHidding) {
      tutorialScene.hide(() => {

        // reset ship points to line up with gameScene move (which starts at 0);
        for (let count = 0, i = ship.points.length - 1, point; point = ship.points[i]; i--) {
          point.x = 0 - tutorialMoveInc * count++;
        }
        gameScene.show();
      });
    }
  },
  render() {
    if (showTutorialBars) {
      ctx.fillStyle = '#00a3dc';
      ctx.fillRect(0, 0, kontra.canvas.width, 160);
      ctx.fillRect(0, kontra.canvas.height - 160, kontra.canvas.width, 160);
    }

    activeScenes.forEach(scene => scene.render())

    if (menuScene.active) {
      showHelpText();
    }

    if (tutorialScene.active) {
      tutorialMove += tutorialMoveInc;
      ship.render(tutorialMove);

      if (ship.points.length > maxLength / 2) {
        ship.points.shift();
      }
    }
  }
});

loop.start();
/**
 * Get the sign of a number
 * @param {number} num
 */
function getSign(num) {
  return num < 0 ? -1 : num > 0 ? 1 : 0;
}

/**
 * To ensure each song is the same every time it's loaded we can't use true
 * randomness. Instead, we can use the audio data itself to determine what
 * numbers to use. Since each song's audio data is unique, each song will
 * feel random to each other.
 */
let Random = {
  values: [],
  value: null,
  index: null,
  numNegatives: 0,
  numPositives: 0,
  setValues: function(values) {
    this.values = values;
    this.numNegatives = 0;
    this.numPositives = 0;
  },
  seed: function(index) {
    this.index = index;
    this.value = this.values[index];
  },
  getNext: function(num) {
    let sign = getSign(this.value);

    // in case the song produces the same sign a lot, this helps make keep
    // the path from being stagnant
    if ((sign === -1 && this.numNegatives - this.numPositives > 100) ||
        (sign === 1 && this.numPositives - this.numNegatives > 100)) {
      sign = -sign
    }

    if (sign === -1) {
      this.numNegatives++;
    }
    else {
      this.numPositives++;
    }

    // generate a number between 0 and num using the current seed
    let rand = sign * (num - num * Math.abs(this.value));

    // take the last two digits of the value and multiply them by 5 to determine
    // the next peak index to use
    let randIndex = (this.value * 10000 % 100 * 5 | 0);
    let index = this.index - randIndex;

    // go the other direction if the new index is outside the bounds of the array
    if (index < 0 || index > this.values.length - 1) {
      index = this.index + randIndex;
    }
    this.seed(index);

    return rand;
  }
};
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
  render(move, size) {

    // prevent the points array from populating while the ship isn't moving
    if (numUpdates >= 1 && !gameOverScene.active && !winScene.active) {
      this.points.push({x: this.x + move, y: this.y + 1});
    }

    // draw the line red if it hits a wall
    if (gameOverScene.active) {
      neonRect(this.x, this.y, this.width, this.height, 255, 0, 0, null, size);
      neonLine(this.points, move, 255, 0, 0, size);
    }
    else {
      neonRect(this.x, this.y, this.width, this.height, 0, 163, 220, null, size);
      neonLine(this.points, move, 0, 163, 220, size);
    }
  }
});
//------------------------------------------------------------
// Time functions
//------------------------------------------------------------

/**
 * Get the time in ss:ms format.
 * @param {number} time
 * @returns {string}
 */
function getTime(time) {
  return ('' + ((time * 100 | 0) / 100)).replace('.', ':');
}

/**
 * Get seconds from time.
 * @param {string} time
 * @returns {string}
 */
function getSeconds(time) {
  if (time.indexOf(':') !== -1) {
    return time.substr(0, time.indexOf(':'));
  }

  return '0';
}

/**
 * Get milliseconds from time.
 * @param {string} time
 * @returns {string}
 */
function getMilliseconds(time) {
  if (time.indexOf(':') !== -1) {
    return time.substr(time.indexOf(':') + 1);
  }

  return '0';
}

/**
 * Get the best time for the song.
 */
function getBestTime() {
  bestTimes = kontra.store.get('audio-dash:best') || {};
  bestTime = bestTimes[songName] || '0:00';
}

/**
 * Set the best time for the song.
 */
function setBestTime() {
  if (isBetterTime(audio.currentTime)) {
    bestTime = getTime(audio.currentTime);
    bestTimes[songName] = bestTime;
    kontra.store.set('audio-dash:best', bestTimes);
  }
}

/**
 * Check to see if the time is better than the best time.
 * @param {number} time
 * @returns {boolean}
 */
function isBetterTime(time) {
  return time > parseInt(bestTime.replace(':', '.'));
}
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
  y: kontra.canvas.height / 2 - 200,
  center: true,
  size: 50,
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

    let peak = ampBar && ampBar.peak;
    let size = !peak || peak < 0.6 ? 1 : peak * 4;

    // draw amp bar
    if (ampBar) {
      let x = ampBar.x - move - waveWidth;
      let width = ampBar.width + waveWidth * 2;
      let topY = ampBar.y;
      let botY = kontra.canvas.height - ampBar.height - ampBar.offset + ampBar.yOffset;
      let topHeight = ampBar.height - ampBar.offset + ampBar.yOffset;
      let botHeight = ampBar.height + ampBar.offset - ampBar.yOffset;

      neonRect(x, topY, width, topHeight, 255, 0, 0, null, size);
      neonRect(x, botY, width, botHeight, 255, 0, 0, null, size);
    }

    ship.render(move, size);

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
//------------------------------------------------------------
// Language Scene
//------------------------------------------------------------
let languageScene = Scene('language');
let firstBtn;
languageScene.onShow = () => {
  for (let i = 0, child; child = languageScene.children[i]; i++) {
    if (child.name === options.language) {
      child.domEl.focus();
      break;
    }
  }
};

languageScene.add(Text({
  x: kontra.canvas.width / 2,
  y: 90,
  size: 50,
  center: true,
  maxWidth: kontra.canvas.width - 100,
  text() {
    return translation.language;
  }
}));

Object.keys(translations).forEach((language, index) => {
  let btn = Button({
    x: kontra.canvas.width / 2,
    y: firstBtn ? null : startY,
    prev: firstBtn,
    center: true,
    name: language,
    text() {
      return translations[language]._name_;
    },
    onDown() {
      languageScene.hide(() => {
        options.language = language;
        setLanguage(language);
        optionsScene.show(() => lastOptionBtn.domEl.focus());
      });
    }
  });

  if (index === 0) {
    firstBtn = btn;
  }

  languageScene.add(btn);
});
let languageCancelBtn = Button({
  x: kontra.canvas.width / 2,
  prev: languageScene.children[languageScene.children.length-1],
  margin: 45,
  text() {
    return translation.cancel;
  },
  onDown() {
    languageScene.hide(() => {
      optionsScene.show(() => lastOptionBtn.domEl.focus());
    });
  }
});
languageScene.add(languageCancelBtn);
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
//------------------------------------------------------------
// Options Scene
//------------------------------------------------------------
let optionsScene = Scene('options');

let lastOptionBtn;
let opts = [{
  name: 'volume',
  minValue: 0,
  maxValue: 1,
  inc: 0.05
},
{
  name: 'uiScale',
  minValue: 1,
  maxValue: 1.5,
  inc: 0.05
},
{
  name: 'gameSpeed',
  minValue: 0.1,
  maxValue: 2,
  inc: 0.05
},
{
  name: 'peaks',
  minValue: 0,
  maxValue: 1,
  inc: 0.1
},
{
  name: 'casual',
  type: 'toggle',
  minValue: 0,
  maxValue: 1,
  inc: 1
}];
if (Object.keys(translations).length > 1) {
  opts.push({
    name: 'language',
    button: {
      text() {
        return translations[options.language]._name_;
      },
      onDown() {
        lastOptionBtn = this;
        optionsScene.hide(() => {
          languageScene.show();
        });
      }
    }
  });
}

let beforeOptions;
let focusEl;

optionsScene.onShow = () => {
  if (!lastOptionBtn) {
    beforeOptions = Object.assign({}, options);
    focusEl.domEl.focus();
  }
};

let optionTexts = [];

optionsScene.add(Text({
  x: kontra.canvas.width / 2,
  y: 90,
  size: 50,
  center: true,
  maxWidth: kontra.canvas.width - 100,
  text() {
    return translation.options;
  }
}));

opts.forEach((opt, index) => {
  let optionText = Text({
    x: 15,
    y: index === 0 ? startY : null,
    prev: index > 0 ? optionTexts[index-1] : null,
    text() {
      return translation[opt.name];
    },
    maxWidth: 310
  });

  if (opt.button) {
    let optionBtn = Button({
      x: 475,
      y: index === 0 ? startY : null,
      prev: index > 0 ? optionTexts[index-1] : null,
      text: opt.button.text,
      onDown: opt.button.onDown
    });

    optionsScene.add(optionText, optionBtn);
  }
  else {
    let optionValue = Text({
      x: 475,
      y: index === 0 ? startY : null,
      center: true,
      prev: index > 0 ? optionTexts[index-1] : null,
      live: true,
      text() {
        if (opt.type === 'toggle') {
          return options[opt.name] === 1 ? 'On' : 'Off';
        }
        else {
          return (''+Math.round(options[opt.name] * 100)) + '%';
        }
      }
    });

    let decBtn = Button({
      x: 375,
      y: index === 0 ? startY : null,
      prev: index > 0 ? optionTexts[index-1] : null,
      text: '-',
      label() {
        return translation[(opt.type === 'toggle' ? 'off_' : 'decrease_')+opt.name]
      },
      update() {
        this.disabled = options[opt.name] === opt.minValue;
      },
      onDown() {
        changeValue(-opt.inc);
      }
    });
    if (index === 0) {
      focusEl = decBtn;
    }

    let incBtn = Button({
      x: 575,
      y: index === 0 ? startY : null,
      prev: index > 0 ? optionTexts[index-1] : null,
      text: '+',
      label() {
        return translation[(opt.type === 'toggle' ? 'on_' : 'increase_')+opt.name]
      },
      update() {
        this.disabled = options[opt.name] === opt.maxValue;
      },
      onDown() {
        changeValue(opt.inc);
      }
    });

    function changeValue(inc) {
      let value = clamp(options[opt.name] + inc, opt.minValue, opt.maxValue);

      // remove floating point errors (0.7+0.1)
      // @see http://blog.blakesimpson.co.uk/read/61-fix-0-1-0-2-0-300000004-in-javascript
      value = +value.toFixed(2);
      options[opt.name] = value;
      setFontMeasurement();
    }

    optionsScene.add(optionText, optionValue, decBtn, incBtn);
  }

  optionTexts.push(optionText);
});


let cancelBtn = Button({
  x: 69,
  prev: optionTexts[optionTexts.length-1],
  margin: 45,
  center: false,
  text() {
    return translation.cancel;
  },
  onDown() {
    optionsScene.hide(() => {
      lastOptionBtn = null;
      options = beforeOptions;
      setLanguage(options.language);
      setFontMeasurement();
      menuScene.show(() => startBtn.domEl.focus());
    });
  }
});
let saveBtn = Button({
  x: 475,
  prev: optionTexts[optionTexts.length-1],
  margin: 45,
  text() {
    return translation.save;
  },
  onDown() {
    lastOptionBtn = null;
    if (beforeOptions.peaks !== options.peaks) {
      generateWaveData();
    }

    kontra.store.set('audio-dash:options', options);

    optionsScene.hide(() => {
      menuScene.show(() => startBtn.domEl.focus());
    });
  }
});
optionsScene.add(cancelBtn, saveBtn);
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
  y: kontra.canvas.height / 2 - 200,
  center: true,
  size: 50,
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