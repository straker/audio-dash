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
// Menu Scene
//------------------------------------------------------------
let menuScene = Scene('menu');
menuScene.add({
  render() {
    ctx.save();
    ctx.globalAlpha = this.parent.alpha;

    let points = [
      {x: 50, y: 262},

      {x: 80, y: 262},
      {x: 88, y: 270},
      {x: 96, y: 278},
      {x: 104, y: 281},
      {x: 112, y: 279},
      {x: 120, y: 272},

      {x: 128, y: 264},

      {x: 136, y: 256},
      {x: 144, y: 249},
      {x: 152, y: 247},
      {x: 160, y: 250},
      {x: 168, y: 258},
      {x: 176, y: 266},

      {x: 206, y: 266}
    ];

    neonLine(points, 0, 0, 163, 220);
    ctx.font = "150px 'Lucida Console', Monaco, monospace"
    neonText('AUDIO', 50, 200, 0, 163, 220);
    neonText('DASH', 231, 315, 255, 0, 0);

    ctx.fillStyle = '#fff';
    ctx.font = "30px 'Lucida Console', Monaco, monospace"
    ctx.fillText('Ride the Audio Wave', 140, 360);

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

let startY = 170;
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
        setTranslation(language);
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
// Tutorial Scene
//------------------------------------------------------------
let isTutorial = true;
let tutorialMove = 0;
let tutorialMoveInc = 5;
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
// Game Scene
//------------------------------------------------------------
let startMove;
let startCount;
let gameScene = Scene('game');
let shipIndex;
gameScene.add({
  render() {
    // context.currentTime would be as long as the audio took to load, so was
    // always off. seems it's not meant for large files. better to use audio
    // element and play it right on time
    // @see https://stackoverflow.com/questions/33006650/web-audio-api-and-real-current-time-when-playing-an-audio-file

    // calculate speed of the audio wave based on the current time
    let move, startIndex = 0, ampBar;
    if (audio.currentTime) {
      move = Math.round((audio.currentTime / audio.duration) * (peaks.length * waveWidth));
      startIndex = move / waveWidth | 0;
    }
    else {
      move = startMove + tutorialMoveInc * startCount;

      if (!gameOverScene.active) {
        startCount++;

        if (move >= 0) {
          showTutorialBars = false;
          audio.play();
        }
      }
    }

    shipIndex = startIndex + maxLength / 2;

    // only draw the bars on the screen
    for (let i = startIndex; i < startIndex + maxLength && waveData[i]; i++) {
      let wave = waveData[i];
      let x = wave.x - move;

      let topY = wave.y;
      let botY = kontra.canvas.height - wave.height - wave.offset + wave.yOffset;
      let topHeight = wave.height - wave.offset + wave.yOffset;
      let botHeight = wave.height + wave.offset - wave.yOffset;

      // keep track of the amp bar
      if (x > waveWidth * (maxLength / 2 - 1) && x < waveWidth * (maxLength / 2 + 1)) {
        ampBar = wave;

        // collision detection
        if (!gameOverScene.active && !options.casual) {
          if (collidesWithShip(topY, topHeight) ||
              collidesWithShip(botY, botHeight) ||
              ship.y < -50 ||
              ship.y > kontra.canvas.height + 50) {
            return gameOver();
          }
        }
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
  }
});





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