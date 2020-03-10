import Hammer from 'hammerjs';
import { Controls } from './modules/controls';
import { Chart } from './modules/chart';

// HTML element IDs
const chartId = '#chart';
const trackId = '#track';
const headingId = '#hdg';
const lefthandId = '#lh';
const darkId = '#dark';

window.onload = () => {    
    const chart = new Chart(chartId, 400, 400);
    chart.inboundTrackChangedHandler = (track: number) => {
        (document.querySelector(trackId) as HTMLInputElement)!.value = track.toString();
    };
    chart.headingChangedHandler = (heading: number) => {
        (document.querySelector(headingId) as HTMLInputElement)!.value = heading.toString();
    };
    chart.draw();
    document.querySelector(chartId)?.addEventListener('click', (evt: Event) => {
        chart.chartClicked(evt as MouseEvent);
    });

    const controls = new Controls();    
    controls.trackInputSelector = trackId;
    controls.lefthandCheckboxSelector = lefthandId;
    controls.headingInputSelector = headingId;
    controls.darkThemeCheckboxSelector = darkId;
    controls.addTrackChangedHandler((_, newTrack) => {
        chart.inboundTrack = newTrack;
    });
    controls.addLefthandChangedHandler((_, lefthand) => {
        chart.lefthand = lefthand;
    });
    controls.addHeadingChangedHandler((_, newHeading: number) => {
        chart.heading = newHeading;
    });

    const mc = new Hammer(document.querySelector(chartId) as HTMLElement);
    mc.get('rotate').set({ enable: true });
    mc.on('rotatestart', evt => {
        chart.rotationStarted(evt.rotation);
    });
    mc.on('rotatemove', evt => {
        chart.rotationCompleted(evt.rotation);
    });
    mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
    mc.on('swipe', _ => {
        chart.lefthand = !chart.lefthand;
        (document.querySelector(lefthandId) as HTMLInputElement)!.checked = chart.lefthand;
    })
};
