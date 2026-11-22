/* 音效引擎：全部用 Web Audio 实时合成，不依赖任何音频文件 */
window.Sound = (function () {
  'use strict';

  var ctx = null;
  var muted = false;
  var noiseBuf = null;

  try { muted = localStorage.getItem('mq_muted') === '1'; } catch (e) { }

  function ac() {
    if (!ctx) {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === 'suspended') { ctx.resume(); }
    return ctx;
  }

  function isMuted() { return muted; }

  function setMuted(v) {
    muted = !!v;
    try { localStorage.setItem('mq_muted', muted ? '1' : '0'); } catch (e) { }
    if (muted && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e2) { }
    }
  }

  function tone(freq, dur, type, vol, delay, slideTo) {
    var c = ac();
    if (!c || muted) return;
    var t0 = c.currentTime + (delay || 0);
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) { o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur); }
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.16, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.03);
  }

  function getNoise(c) {
    if (noiseBuf) return noiseBuf;
    var len = Math.floor(c.sampleRate * 1.8);
    var buf = c.createBuffer(1, len, c.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) { d[i] = Math.random() * 2 - 1; }
    noiseBuf = buf;
    return buf;
  }

  function noiseHit(dur, vol, delay, freq) {
    var c = ac();
    if (!c || muted) return;
    var t0 = c.currentTime + (delay || 0);
    var src = c.createBufferSource();
    src.buffer = getNoise(c);
    var bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = freq || 1600;
    bp.Q.value = 0.9;
    var g = c.createGain();
    g.gain.setValueAtTime(vol || 0.12, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(bp);
    bp.connect(g);
    g.connect(c.destination);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  return {
    unlock: function () { ac(); },
    isMuted: isMuted,
    setMuted: setMuted,

    click: function () {
      tone(760, 0.06, 'square', 0.07);
    },

    tap: function () {
      tone(620, 0.05, 'triangle', 0.09);
    },

    bigBtn: function () {
      tone(523, 0.09, 'triangle', 0.14);
      tone(784, 0.14, 'triangle', 0.1, 0.05);
    },

    select: function () {
      tone(560, 0.08, 'sine', 0.12);
    },

    correct: function () {
      tone(784, 0.12, 'triangle', 0.15, 0);
      tone(1046, 0.16, 'triangle', 0.14, 0.09);
      noiseHit(0.12, 0.04, 0, 2600);
    },

    wrong: function () {
      tone(300, 0.22, 'sawtooth', 0.11, 0, 120);
      tone(180, 0.24, 'square', 0.07, 0.03, 90);
    },

    hit: function () {
      noiseHit(0.16, 0.18, 0, 900);
      tone(140, 0.18, 'square', 0.13, 0, 70);
    },

    counter: function () {
      tone(110, 0.26, 'sawtooth', 0.14, 0, 60);
      noiseHit(0.2, 0.12, 0, 500);
    },

    tick: function () {
      tone(880, 0.05, 'sine', 0.05);
    },

    tickUrgent: function () {
      tone(1046, 0.07, 'triangle', 0.05);
    },

    combo: function () {
      tone(880, 0.06, 'triangle', 0.11);
      tone(1175, 0.09, 'triangle', 0.1, 0.05);
      tone(1568, 0.12, 'triangle', 0.09, 0.11);
    },

    monsterIn: function () {
      noiseHit(0.26, 0.12, 0, 300);
      tone(160, 0.3, 'sawtooth', 0.09, 0, 90);
    },

    victory: function () {
      var notes = [523, 659, 784, 1046, 1318];
      for (var i = 0; i < notes.length; i++) {
        tone(notes[i], 0.32, 'triangle', 0.14, i * 0.12);
      }
    },

    unlockSkin: function () {
      var notes = [659, 880, 1046, 1318];
      for (var i = 0; i < notes.length; i++) {
        tone(notes[i], 0.18, 'triangle', 0.12, i * 0.09);
      }
      noiseHit(0.28, 0.05, 0.12, 3200);
    },

    applauseLight: function () {
      for (var i = 0; i < 18; i++) {
        noiseHit(
          0.03 + Math.random() * 0.035,
          0.025 + Math.random() * 0.03,
          Math.random() * 0.45,
          1800 + Math.random() * 2200
        );
      }
    },

    applause: function () {
      var c = ac();
      if (!c || muted) return;
      for (var i = 0; i < 60; i++) {
        noiseHit(
          0.04 + Math.random() * 0.05,
          0.04 + Math.random() * 0.06,
          Math.random() * 1.5,
          1400 + Math.random() * 2600
        );
      }
    },

    say: function (text) {
      if (muted) return;
      if (!('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(text);
        u.lang = 'zh-CN';
        u.rate = 1;
        u.pitch = 1.25;
        window.speechSynthesis.speak(u);
      } catch (e) { }
    }
  };
})();
