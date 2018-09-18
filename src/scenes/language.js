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