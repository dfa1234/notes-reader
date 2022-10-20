export const SAMPLES = [
    {fileName: 'bach-bourse.mp3'},
    {fileName: 'clair-de-lune.mp3'},
    {fileName: 'clarinet.mp3'},
    {fileName: 'piano-20.wav'},
    {fileName: 'piano-40.wav', hz: 261.626},
    {fileName: 'piano-49.wav', hz: 440},
    {fileName: 'piano-53.wav', hz: 554.365},
    {fileName: 'piano-64.wav', hz: 1046.5},
    {fileName: 'recorder-c.mp3'},
    {fileName: 'recorder-d1.mp3'},
    {fileName: 'recorder-e1.mp3'},
    {fileName: 'recorder-f.mp3'}
];

export const renderSamples = () => {
    const sampleDivList = SAMPLES.map(sample => {
        const sampleDiv = document.createElement('div');
        const labelEl = document.createElement('span');
        labelEl.textContent = sample.fileName + (sample.hz ? ` (${sample.hz} Hz)` : '');
        sampleDiv.appendChild(labelEl);
        const audioEl = document.createElement('audio');
        audioEl.setAttribute('src', `./samples/${sample.fileName}`);
        audioEl.setAttribute('controls', '');
        sampleDiv.appendChild(audioEl);
        return sampleDiv;
    });

    const samplesDivEl = document.getElementById('samples');
    samplesDivEl.append(...sampleDivList);
};
