import {renderPiano} from './piano.js';
import {renderSamples} from './samples.js';
import {startAudio} from './audio.js';

const btnMic = document.getElementById('allow-microphone-capture');

btnMic.addEventListener('click', () => {
    btnMic.style.display = 'none';
    document.getElementById('app-wrapper').style.display = 'block';

    const audioContext = new AudioContext();

    renderPiano(audioContext);
    startAudio(audioContext);
    renderSamples();
});
