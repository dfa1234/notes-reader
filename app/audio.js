import {KEYS} from './keys.js';
import {SmartArray} from './smart-array.js';

const pitchSamples = new SmartArray();

// const = drawPitchMarkers => (canvas2Context) {
//     canvas2Context.fillStyle = 'firebrick';
//     canvas2Context.font = '14px serif';
//     for (let i = 25; i < 1200; i += 25) {
//         const pos = i / 2;
//         canvas2Context.fillRect(65, pos, 4, 1);
//         canvas2Context.fillText(i.toString(), 70, pos + 5);
//     }
// }

export const startAudio = () => {
    let audioReady = false;
    let loudEnough = false;
    const MIN_VOLUME = 7;

    const audioContext = new AudioContext();
    const audioEl = document.getElementById('microphone-capture');
    const canvasEl = document.getElementById('canvas');
    const decibelsEl = document.getElementById('decibels');
    const analyser = audioContext.createAnalyser();

    const {sampleRate} = audioContext;

    analyser.fftSize = 2048;
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvasContext = canvasEl.getContext('2d');
    // drawPitchMarkers(canvasContext);

    const userMediaConstraints = {audio: true};

    const getUserMediaSuccess = stream => {
        const audioSource = audioContext.createMediaStreamSource(stream);
        audioEl.src = audioSource;

        audioSource.connect(analyser);
        // comment/uncomment to play to speakers
        // audioSource.connect(audioContext.destination); // out to the speakers
        audioReady = true;
    };

    const getUserMediaError = err => {
        err && console.error(err);
    };

    window.navigator.getUserMedia(userMediaConstraints, getUserMediaSuccess, getUserMediaError);

    // canvas2Context.fillStyle = 'rgba(0, 0, 0, 0.03)';

    let lastItem = 0;
    const STEPS_THRESHOLD = 5;

    const getKey = () => {
        const pitch = pitchSamples.mode;

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

    const renderKey = () => {
        const key = getKey();

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

        pitchSamples.empty();
    };

    const drawWave = () => {
        if (!loudEnough) return;
        canvasContext.fillStyle = 'firebrick';
        analyser.getByteTimeDomainData(dataArray);
        //console.log('getByteTimeDomainData',dataArray)
        canvasContext.fillRect(0, 128, 1024, 2);

        let lastPos = 0;
        dataArray.forEach((item, i) => {
            if (i > 0 && i < dataArray.length && item > 128 && lastItem <= 128) {
                const elapsedSteps = i - lastPos;
                lastPos = i;

                if (elapsedSteps > STEPS_THRESHOLD) {
                    const hertz = 1 / (elapsedSteps / sampleRate); // sampleRate = 44100
                    pitchSamples.push(hertz);
                    // canvas2Context.fillRect(4, hertz / 2, 65, 1); // pitch marker
                }
            }

            canvasContext.fillRect(i, item, 2, 2); // point in the wave

            lastItem = item;
        });
        //console.log(pitchSamples);
    };

    const drawFreq = () => {
        canvasContext.fillStyle = 'lightgray';
        analyser.getByteFrequencyData(dataArray);

        let volumeTotal = 0;
        canvasContext.fillRect(0, 300 - 256 / 10, 1024, 1);

        dataArray.forEach((item, i) => {
            canvasContext.fillRect(i, 300 - item, 1, item);
            volumeTotal += item;
        });

        const volume = volumeTotal / dataArray.length;
        const nowLoudEnough = volume > MIN_VOLUME;
        if (nowLoudEnough) {
            //console.log('getByteFrequencyData',dataArray)
        }
        if (loudEnough !== nowLoudEnough) {
            pitchSamples.empty();
        }

        loudEnough = nowLoudEnough;
        decibelsEl.textContent = volume.toFixed(2);
    };

    const renderAudio = () => {
        requestAnimationFrame(renderAudio);

        if (!audioReady) return;

        canvasContext.clearRect(0, 0, 1024, 300);

        drawFreq();
        drawWave();
    };

    renderAudio();

    setInterval(() => {
        loudEnough && renderKey();
    }, 250);

    window.addEventListener('keydown', e => {
        if (e.code === 'Space') {
            console.log('Pause');
            audioEl.paused ? audioEl.play() : audioEl.pause();
        }
    });

    audioEl.play();
};
