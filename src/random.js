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