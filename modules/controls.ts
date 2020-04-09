import { lightTheme, darkTheme } from './themes';

type ValueChangedHandler<T> = (old: T, cur: T) => void;

export class Controls {
    private track: number = 0;
    private trackChangedHandlers: ValueChangedHandler<number>[] = [];

    private lefthand: boolean = false;
    private lefthandChangedHandlers: ValueChangedHandler<boolean>[] = [];

    private heading: number = 0;
    private headingChangedHandlers: ValueChangedHandler<number>[] = [];

    public useCompass = false;
    public menuVisible = false;

    addTrackChangedHandler(handler: ValueChangedHandler<number>) {
        this.trackChangedHandlers.push(handler);
    }

    addLefthandChangedHandler(handler: ValueChangedHandler<boolean>) {
        this.lefthandChangedHandlers.push(handler);
    }

    addHeadingChangedHandler(handler: ValueChangedHandler<number>) {
        this.headingChangedHandlers.push(handler);
    }

    set lefthandCheckboxSelector(selector: string) {
        document.querySelector(selector)?.addEventListener('change', (evt: Event) => {
            const lefthand = (evt.target as HTMLInputElement).checked;
            this.lefthandChangedHandlers
                .forEach(h => h(this.lefthand, lefthand));
            this.lefthand = lefthand;
        });
    }
    
    set darkThemeCheckboxSelector(selector: string) {
        document.querySelector(selector)?.addEventListener('change', (evt: Event) => {
            const theme = ((evt.target as HTMLInputElement).checked) ? darkTheme : lightTheme;
            for (let [k,v] of Object.entries(theme)) {
                document.body.style.setProperty(k, v);
            }
        });
    }

    set compassCheckboxSelector(selector: string) {
        document.querySelector(selector)?.addEventListener('change', (evt: Event) => {
            this.useCompass = (evt.target as HTMLInputElement).checked;
        });
    }

    set trackInputSelector(selector: string) {
        document.querySelector(selector)?.addEventListener('change', (evt: Event) => {
            // TODO more validation
            const track = Number.parseInt((evt.target as HTMLInputElement).value);
            this.trackChangedHandlers
                .forEach(h => h(this.track, track));
            this.track = track;
        });
    }

    set headingInputSelector(selector: string) {
        document.querySelector(selector)?.addEventListener('change', (evt: Event) => {
            // TODO more validation
            const heading = Number.parseInt((evt.target as HTMLInputElement).value);
            this.headingChangedHandlers
                .forEach(h => h(this.heading, heading));
            this.heading = heading;
        });
    }

    set compassDir(dir: number | null) {
        if (this.useCompass && dir != null) {
            const heading = Math.round(dir);
            this.headingChangedHandlers
                .forEach(h => h(this.heading, heading));
            this.heading = heading;
        }
    }
};