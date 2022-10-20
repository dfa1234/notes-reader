import {renderPiano} from './piano.js';
import {renderSamples} from './samples.js';
import {startAudio} from './audio.js';

renderPiano();

const btnMic = document.getElementById('allow-microphone-capture');

btnMic.addEventListener('click', () => {
    btnMic.style.display = 'none';
    document.getElementById('app-wrapper').style.display = 'block';
    startAudio();
    renderSamples();
});
