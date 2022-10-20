import {Piano} from './piano.js';
import {Audio} from './audio.js';

document.getElementById('allow-microphone-capture').addEventListener('click', () => {
    document.getElementById('app-wrapper').style.display = 'block';

    const piano = new Piano();
    piano.render();

    const audio = new Audio();
    audio.start();
});
