import {Piano} from './piano.js';
import {RefManager} from './refs.js';
import {Audio} from './audio.js';

SP_APP.start = () => {
    // build refs object
    const refEls = document.querySelectorAll('[data-ref]');
    SP_APP.refs = {};
    for (let refEl of refEls) {
        const ref = refEl.getAttribute('data-ref'); // dataset doesn't work on <svg>
        SP_APP.refs[ref] = refEl;
    }

    const piano = new Piano();
    piano.render();

    // build the refs after rendering the piano
    SP_APP.refManager = new RefManager();
    SP_APP.refManager.getRefs();

    const audio = new Audio();
    audio.start();
};
