/* Simon Says core logic — pure functions, no DOM.
   Used by index.html and headless-tested in Node. */
(function (root) {
  'use strict';

  // Classic Simon pad frequencies (Hz)
  var FREQS = [415, 310, 252, 209]; // green, red, yellow, blue
  var COLORS = ['green', 'red', 'yellow', 'blue'];

  function createGame(rng) {
    return {
      rng: rng || Math.random,
      sequence: [],   // array of pad indexes 0-3
      inputPos: 0,     // how many of the sequence the player has entered this round
      round: 0,        // completed rounds (score)
      phase: 'idle',   // idle | showing | input | over
      strict: false
    };
  }

  function start(state, strict) {
    state.sequence = [];
    state.inputPos = 0;
    state.round = 0;
    state.strict = !!strict;
    state.phase = 'showing';
    addStep(state);
  }

  function addStep(state) {
    state.sequence.push(Math.floor(state.rng() * 4));
    state.inputPos = 0;
    state.phase = 'showing';
  }

  // Playback finished (UI drove it); now the player repeats.
  function beginInput(state) {
    if (state.phase === 'showing') state.phase = 'input';
  }

  // Player taps pad `pad`. Returns { ok, roundComplete, gameOver, replay }.
  function press(state, pad) {
    if (state.phase !== 'input') return { ok: false, roundComplete: false, gameOver: false, replay: false };
    if (pad === state.sequence[state.inputPos]) {
      state.inputPos++;
      if (state.inputPos === state.sequence.length) {
        state.round++;
        addStep(state); // grows sequence, phase -> showing
        return { ok: true, roundComplete: true, gameOver: false, replay: false };
      }
      return { ok: true, roundComplete: false, gameOver: false, replay: false };
    }
    // wrong pad
    if (state.strict) {
      state.phase = 'over';
      return { ok: false, roundComplete: false, gameOver: true, replay: false };
    }
    // non-strict: replay the same sequence
    state.inputPos = 0;
    state.phase = 'showing';
    return { ok: false, roundComplete: false, gameOver: false, replay: true };
  }

  // Playback speed: faster as rounds grow. Returns ms per step.
  function stepInterval(round) {
    return Math.max(280, 620 - round * 22);
  }

  var api = {
    FREQS: FREQS, COLORS: COLORS,
    createGame: createGame, start: start, addStep: addStep,
    beginInput: beginInput, press: press, stepInterval: stepInterval
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SimonLogic = api;
})(typeof window !== 'undefined' ? window : global);
