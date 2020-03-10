type ValueChangedHandler<T> = (old: T, cur: T) => void;

export class Controls {
    private track: number = 0;
    private trackChangedHandlers: ValueChangedHandler<number>[] = [];

    private lefthand: boolean = false;
    private lefthandChangedHandlers: ValueChangedHandler<boolean>[] = [];

    private heading: number = 0;
    private headingChangedHandlers: ValueChangedHandler<number>[] = [];

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
            if ((evt.target as HTMLInputElement).checked) {
                // Dark theme
                document.body.style.setProperty('--background-color', 'black');
                document.body.style.setProperty('--text-color', 'white');
                document.body.style.setProperty('--entry-path-color', 'white');
            } else {
                // Light theme
                document.body.style.setProperty('--background-color', '#ddd');
                document.body.style.setProperty('--text-color', 'black');
                document.body.style.setProperty('--entry-path-color', '#999');
            }
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
};