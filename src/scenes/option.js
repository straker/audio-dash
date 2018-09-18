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
      setTranslation(options.language);
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