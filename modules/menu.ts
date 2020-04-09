import { Favourites, Hold, FavouriteSelectedHandler } from "./favourites";

export class MenuProps {
    toggleSelector: string = '#menu .menu-icon';
    contentSelector: string = '#menu .menu-content';
    addHoldFormSelector: string = '#addHold';
    favouritesTableSelector: string = '#favourites';
    newHoldFixInputId = 'favFix';
    newHoldTrackInputId = 'favTrack';
    newHoldLefthandCheckboxId = 'favLH';
}

export class Menu {    
    private visible = false;
    private favourites: Favourites;
    private contentSelector: string;

    constructor(private props: MenuProps, addHoldTemplate: string) {        
        this.favourites = new Favourites(props.favouritesTableSelector,
            addHoldTemplate, (event: Event) => this.addHold(event));
        this.contentSelector = props.contentSelector;
        
        document.querySelector(props.toggleSelector)?.addEventListener('click', (evt: Event) => {
            this.visibility = !this.visible;
        });
        
        this.favourites.addFavouritesRenderedCallback(() => {
            document.getElementById(props.newHoldFixInputId)?.addEventListener('keyup', (evt: Event) => {        
                if ((evt as KeyboardEvent).keyCode === 13) {
                    this.addHold(evt);
                }            
            });
            document.getElementById(props.newHoldTrackInputId)?.addEventListener('keyup', (evt: Event) => {        
                if ((evt as KeyboardEvent).keyCode === 13) {
                    this.addHold(evt);
                }            
            });
        });

        this.favourites.render();
    }

    private set visibility(visible: boolean) {
        const display = visible ? 'block' : 'none';
        (document.querySelector(this.contentSelector) as HTMLElement).style.display = display;
        this.visible = visible;
    }

    public hide() {
        this.visibility = false;
    }

    public addFavouriteSelectedHandler(handler: FavouriteSelectedHandler) {
        this.favourites.addFavouriteSelectedHandler(handler);
    }

    private addHold(event: Event) {
        const fixInputElt = document.getElementById(this.props.newHoldFixInputId) as HTMLInputElement;
        const trackInputElt = document.getElementById(this.props.newHoldTrackInputId) as HTMLInputElement;
        const lefthandCheckboxElt = document.getElementById(this.props.newHoldLefthandCheckboxId) as HTMLInputElement;

        const fixName = fixInputElt.value.trim();
        if (fixName) {
            const track = Number.parseInt(trackInputElt.value) % 360;
            this.favourites.add(new Hold(fixInputElt.value, track, lefthandCheckboxElt.checked));
        }        

        fixInputElt.value = '';
    }
}