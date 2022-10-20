import {KEYS} from './keys.js';
import {SmartArray} from './smart-array.js';

// const = drawPitchMarkers => (canvas2Context) {
//     canvas2Context.fillStyle = 'firebrick';
//     canvas2Context.font = '14px serif';
//     for (let i = 25; i < 1200; i += 25) {
//         const pos = i / 2;
//         canvas2Context.fillRect(65, pos, 4, 1);
//         canvas2Context.fillText(i.toString(), 70, pos + 5);
//     }
// }

const throttle = (func, delay) => {
    let prev = 0;
    let previousPitchSample = new SmartArray();
    return currentPitchSample => {
        let now = new Date().getTime();

        if (currentPitchSample.dataArray.length > previousPitchSample.dataArray.length) {
            previousPitchSample.dataArray = currentPitchSample.dataArray;
        }

        if (now - prev > delay) {
            prev = now;
            return func(previousPitchSample);
        }
    };
};

const getKey = pSamples => {
    const pitch = pSamples.mode;

    const notePitchElement = document.getElementById('note-pitch');
    notePitchElement.textContent = pitch + ' hz';

    let closestLower = KEYS[0];
    let closestHigher = KEYS[KEYS.length - 1];

    for (let i = 0; i < KEYS.length; i++) {
        if (KEYS[i].hz < pitch) closestLower = KEYS[i];
        if (KEYS[i].hz > pitch) {
            closestHigher = KEYS[i];
            break; // going from low to high so we can stop here
        }
    }

    const distanceToLower = Math.abs(pitch - closestLower.hz);
    const distanceToHigher = Math.abs(pitch - closestHigher.hz);

    return Math.min(distanceToLower, distanceToHigher) === distanceToLower ? closestLower : closestHigher;
};

const renderKey = (pSamples, key) => {
    const noteTextElement = document.getElementById('note-display');
    noteTextElement.textContent = key.name;

    const keyEls = document.getElementsByClassName('piano-key');
    for (let keyEl of keyEls) {
        keyEl.classList.remove('piano-key--lit');
    }

    const keyTextEls = document.getElementsByClassName('piano-key-text');
    for (let keyTextEl of keyTextEls) {
        keyTextEl.classList.remove('piano-key--lit');
    }

    const keyId = key.name.substring(0, 2).toLocaleLowerCase();

    const pressedKeyEl = document.getElementById(`key-${keyId}`);
    const pressedKeyTextEl = document.getElementById(`key-text-${keyId}`);
    pressedKeyEl.classList.add('piano-key--lit');
    pressedKeyTextEl.classList.add('piano-key--lit');

    pSamples.empty();
};

export const startAudio = audioContext => {
    const audioEl = document.getElementById('microphone-capture');
    const canvasEl = document.getElementById('canvas');
    const decibelsEl = document.getElementById('decibels');

    const pitchSamples = new SmartArray();
    let audioReady = false;

    const {sampleRate} = audioContext;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvasContext = canvasEl.getContext('2d');
    // canvas2Context.fillStyle = 'rgba(0, 0, 0, 0.03)';
    // drawPitchMarkers(canvasContext);

    navigator.getUserMedia =
        navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    const userMediaConstraints = {audio: true};
    const userMediaSuccess = stream => {
        const audioSource = audioContext.createMediaStreamSource(stream);
        audioEl.src = audioSource;
        audioSource.connect(analyser);
        // comment/uncomment to play to speakers
        // audioSource.connect(audioContext.destination); // out to the speakers
        audioReady = true;
    };
    const userMediaError = err => console.error(err);

    window.navigator.getUserMedia(userMediaConstraints, userMediaSuccess, userMediaError);

    const STEPS_THRESHOLD_WAVE = 5;
    let lastItemWave = 0;

    const drawWave = loudEnough => {
        if (!loudEnough) return;

        analyser.getByteTimeDomainData(dataArray);
        canvasContext.fillStyle = 'firebrick';
        canvasContext.fillRect(0, 128, 1024, 2);

        let lastPos = 0;
        dataArray.forEach((item, i) => {
            if (i > 0 && i < dataArray.length && item > 128 && lastItemWave <= 128) {
                const elapsedSteps = i - lastPos;
                lastPos = i;
                if (elapsedSteps > STEPS_THRESHOLD_WAVE) {
                    const hertz = 1 / (elapsedSteps / sampleRate); // sampleRate = 44100
                    pitchSamples.push(hertz);
                    // canvas2Context.fillRect(4, hertz / 2, 65, 1); // pitch marker
                }
            }
            canvasContext.fillRect(i, item, 2, 2);
            lastItemWave = item;
        });
    };

    const drawFreq = () => {
        analyser.getByteFrequencyData(dataArray);
        canvasContext.fillStyle = 'lightgray';
        canvasContext.fillRect(0, 300 - 256 / 10, 1024, 1);
        dataArray.forEach((item, i) => {
            canvasContext.fillRect(i, 300 - item, 1, item);
        });
    };

    const MIN_VOLUME = 7;

    const drawDecibels = () => {
        let volumeTotal = 0;
        dataArray.forEach((item, i) => {
            volumeTotal = volumeTotal + item;
        });
        const volume = volumeTotal / dataArray.length;
        decibelsEl.textContent = volume.toFixed(2);
        const nowLoudEnough = volume > MIN_VOLUME;
        return nowLoudEnough;
    };

    window.addEventListener('keydown', e => {
        if (e.code === 'Space') {
            console.log('Pause');
            audioEl.paused ? audioEl.play() : audioEl.pause();
        }
    });

    // above this line it's the looping animation machine, be careful:

    let lastPitchDatetime = Date.now();
    let lastMaxPitchSamples = new SmartArray();

    const step = () => {
        requestAnimationFrame(step);

        if (!audioReady) return;

        canvasContext.clearRect(0, 0, 1024, 300);
        drawFreq();
        const loudEnough = drawDecibels();
        drawWave(loudEnough);

        if (!loudEnough) {
            pitchSamples.empty();
        } else {
            const now = Date.now();

            if (lastPitchDatetime + 1000 > now) {
                if (pitchSamples.dataArray.length > lastMaxPitchSamples.dataArray.length) {
                    lastMaxPitchSamples = pitchSamples;
                }
            } else {
                const key = getKey(pitchSamples);
                console.log('render', lastMaxPitchSamples.dataArray.length);
                lastPitchDatetime = now;
                renderKey(lastMaxPitchSamples, key);
                lastMaxPitchSamples.empty();
                pitchSamples.empty();
            }
        }
    };
    requestAnimationFrame(step);
    audioEl.play();
};
