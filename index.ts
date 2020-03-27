import Hammer from 'hammerjs';
import { Controls } from './modules/controls';
import { Chart } from './modules/chart';
import { Timer } from './modules/timer';

// HTML element selectors
const chartId = '#chart';
const trackId = '#track';
const headingId = '#hdg';
const lefthandId = '#lh';
const darkId = '#dark';
const compassId = '#compass';
const svgSelector = `${chartId} svg`;
const timerButtonSelector = '.timer-button';
const timerId = '#timer';
const timerLCDSelector = '#timer .lcd';
const updateId = '#update-available';

var newWorker: ServiceWorker | null;

window.onload = () => {
    document.querySelector(updateId + ' .update')?.addEventListener('click', (evt: Event) => {
        reload();
    });

    document.querySelector(".close")?.addEventListener('click', (evt: Event) => {
        (document.querySelector(updateId) as HTMLElement).style.visibility = 'hidden';
    });

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
    controls.compassCheckboxSelector = compassId;

    controls.addTrackChangedHandler((_, newTrack) => {
        chart.inboundTrack = newTrack;
    });
    controls.addLefthandChangedHandler((_, lefthand) => {
        chart.lefthand = lefthand;
    });
    controls.addHeadingChangedHandler((_, newHeading: number) => {
        chart.heading = newHeading;
    });

    const mc = new Hammer(document.querySelector(svgSelector) as HTMLElement);
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

    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', eventData => {
            if ('webkitCompassHeading' in eventData) {
                controls.compassDir = eventData['webkitCompassHeading'];
            } else {
                controls.compassDir = eventData.alpha;
            }
        });
    }

    const timer = new Timer(timerButtonSelector, timerId, timerLCDSelector);

    const resize = () => {
        const chart = document.querySelector(chartId) as HTMLElement;
        const chartTop = chart!.offsetTop;
        const heightAvailable = window.innerHeight - chartTop;
        const svg = document.querySelector('#chart svg') as HTMLElement;
        svg!.setAttribute('height', (0.95 * heightAvailable).toString());
    }

    window.onresize = resize;
    resize();

    registerSW();

};

function showUpdateAvailable() {
    (document.querySelector(updateId) as HTMLElement).style.visibility = 'visible';
}

function reload() {
    if (newWorker) {
        newWorker.postMessage({ action: 'skipWaiting' });
    }
    (document.querySelector(updateId) as HTMLElement).style.visibility = 'hidden';
}

async function registerSW() {
    if ('serviceWorker' in navigator) {
        try {
            const reg = await navigator.serviceWorker.register('sw.js');
            reg.addEventListener('updatefound', () => {
                newWorker = reg.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker!.state == 'installed') {
                            if (navigator.serviceWorker.controller) {
                                // We are a client
                                showUpdateAvailable();
                            }
                        }
                    });
                }
            });
        } catch (e) {
            console.log(`SW registration failed: ${e}`);
        }

        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                console.log("Reload!!");
                window.location.reload();
                refreshing = true;
            }
        });
    }
}
