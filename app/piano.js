import {KEYS} from './keys.js';

const getPlayNote = audioCtx => (frequencyInHz, duration, element) => {
    const oscillator = audioCtx.createOscillator();
    oscillator.frequency.value = frequencyInHz;
    oscillator.type = 'triangle';
    //oscillator.type = 'square';
    const volume = audioCtx.createGain();
    oscillator.connect(volume);
    volume.connect(audioCtx.destination);
    // We can set & modify the gain knob
    volume.gain.value = 0.5;
    oscillator.start();
    element.classList.add('piano-key--play');
    setTimeout(() => {
        oscillator.stop();
        element.classList.remove('piano-key--play');
    }, duration);
};

const COLORS = {
    EBONY: 'ebony',
    IVORY: 'ivory'
};
const SHIFTS = {
    LEFT: 'LEFT',
    MIDDLE: 'MIDDLE',
    RIGHT: 'RIGHT'
};

const getKeyDeets = keyPos => {
    const key = keyPos % 12;
    let shift;
    let color;

    if (key === 2 || key === 7) {
        shift = SHIFTS.RIGHT;
        color = COLORS.EBONY;
    } else if (key === 5 || key === 10) {
        shift = SHIFTS.LEFT;
        color = COLORS.EBONY;
    } else if (key === 0) {
        shift = SHIFTS.MIDDLE;
        color = COLORS.EBONY;
    } else {
        color = COLORS.IVORY;
        // shift for ivory is only for the text
        if (key === 3 || key === 8) {
            shift = SHIFTS.RIGHT;
        } else if (key === 4 || key === 9) {
            shift = SHIFTS.LEFT;
        }
    }
    return {shift, color};
};

export const renderPiano = (audioCtx) => {
    const pianoEl = document.getElementById('piano');

    const playNote = getPlayNote(audioCtx);

    const ns = 'http://www.w3.org/2000/svg';
    const whiteKeyGroup = document.createElementNS(ns, 'g');
    const blackKeyGroup = document.createElementNS(ns, 'g');

    let x = 0;

    KEYS.forEach((key, index) => {
        const keyRect = document.createElementNS(ns, 'rect');
        const keyDeets = getKeyDeets(index + 1);
        const keyId = key.name.substring(0, 2).toLocaleLowerCase();

        let height;
        let width;
        let newOffset;
        let offsetText = 0;

        // explanation for dimension and offsets from http://www.rwgiangiulio.com/construction/manual/
        if (keyDeets.color === COLORS.EBONY) {
            height = 80;
            width = 11;

            if (keyDeets.shift === SHIFTS.LEFT) {
                newOffset = x - 7;
            } else if (keyDeets.shift === SHIFTS.MIDDLE) {
                newOffset = x - 5;
            } else if (keyDeets.shift === SHIFTS.RIGHT) {
                newOffset = x - 3;
            }
        } else {
            height = 125;
            width = 22;
            newOffset = x;
            if (keyDeets.shift === SHIFTS.LEFT) {
                offsetText = -3;
            } else if (keyDeets.shift === SHIFTS.MIDDLE) {
                offsetText = 0;
            } else if (keyDeets.shift === SHIFTS.RIGHT) {
                offsetText = +3;
            }

            x = x + width;
        }

        const keyText = document.createElementNS(ns, 'text');
        keyText.textContent = key.name.substring(0, 2);
        keyText.setAttribute('x', newOffset + width / 2 + offsetText);
        keyText.setAttribute('y', 10);
        keyText.setAttribute('class', 'piano-key-text');
        keyText.setAttribute('text-anchor', 'middle');
        keyText.setAttribute('id', `key-text-${keyId}`);

        keyRect.setAttribute('rx', 2);
        keyRect.setAttribute('x', newOffset);
        keyRect.setAttribute('y', 14);
        keyRect.setAttribute('width', width);
        keyRect.setAttribute('height', height);
        keyRect.setAttribute('id', `key-${keyId}`);
        keyRect.classList.add('piano-key');
        keyRect.classList.add(`piano-key--${keyDeets.color}`);
        keyRect.addEventListener('click', () => {
            playNote(key.hz, 200, keyRect);
        });

        if (keyDeets.color === COLORS.EBONY) {
            blackKeyGroup.appendChild(keyText);
            blackKeyGroup.appendChild(keyRect);
        } else {
            blackKeyGroup.appendChild(keyText);
            whiteKeyGroup.appendChild(keyRect);
        }
    });

    pianoEl.appendChild(whiteKeyGroup);
    pianoEl.appendChild(blackKeyGroup);
};
