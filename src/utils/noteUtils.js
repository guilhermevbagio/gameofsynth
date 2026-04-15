/**
 * noteUtils.js
 * Maps a 2D matrix to pitches in 12-tone equal temperament.
 *
 * In 12-TET, every semitone step multiplies frequency by 2^(1/12).
 * A "jump of n intervals" means n semitone steps.
 *
 * Grid logic:
 *   - Moving right (+x) jumps xStep semitones
 *   - Moving up   (+y) jumps yStep semitones
 *   - Cell (0, 0) anchors to a root note (e.g. "C4" = MIDI 60)
 */

// ─── Constants ───────────────────────────────────────────────────────────────

const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

const A4_MIDI = 69;
const A4_FREQ = 440.0;

// ─── Core Converters ─────────────────────────────────────────────────────────

/** MIDI note number → frequency in Hz */
export function midiToFreq(midi) {
  return A4_FREQ * Math.pow(2, (midi - A4_MIDI) / 12);
}

/** Frequency in Hz → MIDI note number (float) */
export function freqToMidi(freq) {
  return A4_MIDI + 12 * Math.log2(freq / A4_FREQ);
}

/** MIDI note number → note name + octave, e.g. 60 → "C4" */
export function midiToName(midi) {
  const semitone = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[semitone]}${octave}`;
}

/** Note name string → MIDI note number, e.g. "C4" → 60 */
export function nameToMidi(name) {
  const match = name.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) throw new Error(`Invalid note name: "${name}"`);
  const semitone = NOTE_NAMES.indexOf(match[1]);
  const octave = parseInt(match[2], 10);
  return (octave + 1) * 12 + semitone;
}

// ─── Matrix Mapper ────────────────────────────────────────────────────────────

/**
 * Creates a note-mapping function for a 2D grid.
 *
 * @param {object} options
 * @param {string|number} options.root    - Root note at (0,0). Note name ("C4") or MIDI number (60).
 * @param {number}        options.xStep  - Semitone interval per +1 in x (columns). Default: 1
 * @param {number}        options.yStep  - Semitone interval per +1 in y (rows).    Default: 12 (one octave)
 *
 * @returns {{ getNote, buildMatrix }}
 *
 * @example
 * // Isomorphic layout: x = perfect 5th (7st), y = major 3rd (4st)
 * const { getNote } = createNoteMapper({ root: "C3", xStep: 7, yStep: 4 });
 * const note = getNote(2, 1); // → { midi, freq, name }
 */
export function createNoteMapper({
  root = "C4",
  xStep = 1,
  yStep = 12,
  midiMin = 21,
  midiMax = 108,
} = {}) {
  const rootMidi = typeof root === "string" ? nameToMidi(root) : root;
  const rangeSize = midiMax - midiMin + 1;

  function wrapMidi(midi) {
    return midiMin + ((((midi - midiMin) % rangeSize) + rangeSize) % rangeSize);
  }

  function getNote(x, y) {
    const raw = rootMidi + x * xStep + y * yStep;
    const midi = wrapMidi(raw);
    return {
      midi,
      freq: midiToFreq(midi),
      name: midiToName(midi),
      x,
      y,
    };
  }

  /**
   * Builds a full matrix of note objects.
   * @param {number} cols  - Number of columns
   * @param {number} rows  - Number of rows
   * @param {number} [originX=0] - Grid x offset for the top-left cell
   * @param {number} [originY=0] - Grid y offset for the top-left cell
   * @returns {Array<Array<object>>} notes[row][col]
   */
  function buildMatrix(cols, rows, originX = 0, originY = 0) {
    return Array.from({ length: rows }, (_, row) =>
      Array.from({ length: cols }, (_, col) =>
        getNote(originX + col, originY + row),
      ),
    );
  }

  return { getNote, buildMatrix, rootMidi, xStep, yStep };
}

// ─── Preset Layouts ───────────────────────────────────────────────────────────

/**
 * Common isomorphic / musical grid layouts.
 * Pass these as options to createNoteMapper.
 *
 *  CHROMATIC    x=1  (semitone),   y=12 (octave)
 *  GUITAR       x=5  (perfect 4th), y=12 (octave)  — like guitar strings
 *  HARMONIC     x=7  (perfect 5th), y=4  (major 3rd) — Wicki-Hayden-ish
 *  WHOLE_TONE   x=2  (whole step),  y=3  (minor 3rd)
 *  THIRDS       x=3  (minor 3rd),   y=4  (major 3rd)
 */
export const LAYOUTS = {
  CHROMATIC: { xStep: 1, yStep: 12 },
  GUITAR: { xStep: 5, yStep: 12 },
  HARMONIC: { xStep: 7, yStep: 4 },
  WHOLE_TONE: { xStep: 2, yStep: 3 },
  THIRDS: { xStep: 3, yStep: 4 },
};
