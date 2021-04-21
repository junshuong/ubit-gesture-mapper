export function createTelephonizer(audioContext: any) {
    // I double up the filters to get a 4th-order filter = faster fall-off
    var lpf1 = audioContext.createBiquadFilter();
    lpf1.type = 'lowpass';
    lpf1.frequency.value = 2000.0;
    var lpf2 = audioContext.createBiquadFilter();
    lpf2.type = 'lowpass';
    lpf2.frequency.value = 2000.0;
    var hpf1 = audioContext.createBiquadFilter();
    hpf1.type = 'highpass';
    hpf1.frequency.value = 500.0;
    var hpf2 = audioContext.createBiquadFilter();
    hpf2.type = 'highpass';
    hpf2.frequency.value = 500.0;
    lpf1.connect(lpf2);
    lpf2.connect(hpf1);
    hpf1.connect(hpf2);
    return lpf1;
}

export function createFilterLFO(audioContext: any, speed: number = 3, filterQ: number = 3.0, depth: number = 1) {
    var osc = audioContext.createOscillator();
    var gain = audioContext.createGain();
    var filter = audioContext.createBiquadFilter();

    filter.type = 'lowpass';
    filter.Q.value = filterQ;

    osc.type = 'sine';
    osc.frequency.value = speed;
    osc.connect(gain);

    filter.frequency.value = 2500; // center frequency - this is kinda arbitrary.
    gain.gain.value = 2500 * depth;
    // this should make the -1 - +1 range of the osc translate to 0 - 5000Hz, if
    // depth == 1.

    gain.connect(filter.frequency);

    osc.start(0);
    return filter;
}

export function createVibrato(audioContext: any, delay: number = 3.5, depth: number = 0.03, speed: number = 0.002) {
    var delayNode = audioContext.createDelay();
    delayNode.delayTime.value = delay;

    var inputNode = audioContext.createGain();

    var osc = audioContext.createOscillator();
    var gain = audioContext.createGain();

    gain.gain.value = depth; // depth of change to the delay:

    osc.type = 'sine';
    osc.frequency.value = speed;

    osc.connect(gain);
    gain.connect(delayNode.delayTime);
    inputNode.connect(delayNode);
    osc.start(0);

    return inputNode;
}

export function createDelay(aCtx: any, delayTime: number = 1.0) {
    // @ts-ignore
    var delayNode = aCtx.createDelay();

    delayNode.delayTime.value = delayTime;

    // @ts-ignore
    var gainNode = aCtx.createGain();
    gainNode.gain.value = 0.75;

    gainNode.connect(delayNode);
    delayNode.connect(gainNode);

    return delayNode;
}

export function createStereoFlange(audioContext: any, wetGain: any, speed: number = 0.15, delay: number = 0.003, depth: number = 0.005, feedback: number = 0.9) {
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);
    var inputNode = audioContext.createGain();
    let sfllfb = audioContext.createGain();
    let sflrfb = audioContext.createGain();
    let sflspeed = audioContext.createOscillator();
    let sflldepth = audioContext.createGain();
    let sflrdepth = audioContext.createGain();
    let sflldelay = audioContext.createDelay();
    let sflrdelay = audioContext.createDelay();

    sfllfb.gain.value = sflrfb.gain.value = feedback;

    inputNode.connect(splitter);
    inputNode.connect(wetGain);

    sflldelay.delayTime.value = delay;
    sflrdelay.delayTime.value = delay;

    splitter.connect(sflldelay, 0);
    splitter.connect(sflrdelay, 1);
    sflldelay.connect(sfllfb);
    sflrdelay.connect(sflrfb);
    sfllfb.connect(sflrdelay);
    sflrfb.connect(sflldelay);

    sflldepth.gain.value = depth; // depth of change to the delay:
    sflrdepth.gain.value = -depth; // depth of change to the delay:

    sflspeed.type = 'triangle';
    sflspeed.frequency.value = speed;

    sflspeed.connect(sflldepth);
    sflspeed.connect(sflrdepth);

    sflldepth.connect(sflldelay.delayTime);
    sflrdepth.connect(sflrdelay.delayTime);

    sflldelay.connect(merger, 0, 0);
    sflrdelay.connect(merger, 0, 1);
    merger.connect(wetGain);

    sflspeed.start(0);

    return inputNode;
}
