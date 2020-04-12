export class Timer {
    private readonly overlay: HTMLElement;
    private readonly lcd: HTMLElement;
    private readonly startBtn: HTMLInputElement;
    private overlayVisible: boolean = false;
    private minutes = 0;
    private seconds = 0;
    private intervalTimer?: number;

    constructor(timerButtonSelector: string, overlaySelector: string, lcdSelector: string) {
        this.overlay = document.querySelector(overlaySelector) as HTMLElement;
        this.lcd = document.querySelector(lcdSelector) as HTMLElement;
        this.startBtn = document.querySelector(`${overlaySelector} .start`) as HTMLInputElement;

        this.startBtn?.addEventListener('click', (evt: Event) => {
            this.startTimer();
        });

        document.querySelector(`${overlaySelector} .stop`)?.addEventListener('click', (evt: Event) => {
            this.stopTimer();
        });

        document.querySelector(`${overlaySelector} .reset`)?.addEventListener('click', (evt: Event) => {
            this.minutes = this.seconds = 0;
            this.lcd.innerHTML = this.formattedTime;
        });

        // Clicking on the lcd screen hides the timer
        document.querySelector(`${overlaySelector} .lcd`)?.addEventListener('click', (evt: Event) => {
            this.hideOverlay();
        });

        document.querySelector(timerButtonSelector)?.addEventListener('click', (evt: Event) => {
            if (this.overlayVisible) {
                this.hideOverlay();
            } else {
                this.showOverlay();
            }
            evt.stopPropagation();
        });
    }

    private startTimer() {
        this.startBtn.disabled = true;
        if (!this.intervalTimer) {
            this.intervalTimer = window.setInterval(() => this.incrementTime(), 1000);
        }
    }

    private stopTimer( ) {
        if (this.intervalTimer) {
            window.clearInterval(this.intervalTimer);
        }
        this.intervalTimer = undefined;
        this.startBtn.disabled = false;
    }

    private pad(n: number, leadingZeros: number = 2) {
        let s = String(n);
        while (s.length < leadingZeros) { s = "0" + s; }
        return s;
    }

    get formattedTime() {
        return `${this.pad(this.minutes)}:${this.pad(this.seconds)}`;
    }

    public incrementTime() {
        if (++this.seconds >= 60) {
            this.seconds = 0;
            if (++this.minutes >= 60) {
                this.minutes = 0;
            }
        }
        if (this.overlayVisible) {
            this.lcd.innerHTML = this.formattedTime;
        }
    }

    showOverlay() {
        this.overlay.style.visibility = 'visible';
        this.lcd.innerHTML = this.formattedTime;
        this.overlayVisible = true;
    }

    hideOverlay() {
        this.stopTimer();
        this.overlay.style.visibility = 'hidden';
        this.overlayVisible = false;
    }
};