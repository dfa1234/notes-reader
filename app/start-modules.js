import {Piano} from './piano.js';
import {Audio} from './audio.js';

const piano = new Piano();
piano.render();

document.getElementById('allow-microphone-capture').addEventListener('click', () => {
    document.getElementById('app-wrapper').style.display = 'block';
    document.getElementById('allow-microphone-capture').style.display = 'none';

    const audio = new Audio();
    audio.start();
});
