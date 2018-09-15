//------------------------------------------------------------
// Button
//------------------------------------------------------------
let uiSpacer = 5;

/**
 * Set the dimensions of the UI element.
 * @param {object} uiEl - UI element
 */
function setDimensions(uiEl) {
  let text = typeof uiEl.text === 'function' ? uiEl.text() : uiEl.text;
  uiEl.width = text.length * fontMeasurement + fontMeasurement * 2;
  uiEl.height = fontMeasurement * 3;

  if (uiEl.center || uiEl.type === 'button') {
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
  el.textContent = button.label || button.text;
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
    if (this.lastText !== text) {
      this.lastText = text;
      this.domEl.textContent = text;
    }

    ctx.save();
    ctx.fillStyle = '#fff';
    let fontSize = 25;
    setFont(fontSize);

    if (this.maxWidth && this.width > this.maxWidth) {

      let width = text.length * fontMeasurement + fontMeasurement * 2;
      let fontMeasure = fontMeasurement;
      let topText, botText, index;

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
  if (typeof props.text === 'function') {
    el.setAttribute('role', 'alert');
    el.setAttribute('aria-live', 'assertive');
    el.setAttribute('aria-atomic', true);
  }
  text.domEl = el;

  return text;
}