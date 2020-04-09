// https://gist.github.com/hagemann/382adfc57adbd5af078dc93feef01fe1
function slugify(s: string) {
    const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
    const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
    const p = new RegExp(a.split('').join('|'), 'g')
    
    return s.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^[a-zA-Z0-9أ-ي]-]+/g, "") // Arabic support
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

export type FavouriteSelectedHandler = (hold: Hold) => void;

export class Hold {
    public id: string;
    
    constructor(public fix: string, public inboundTrack: number, public lefthand: boolean = false) {
        this.id = slugify(fix);
    }

    get direction() {
        return this.lefthand ? "Left" : "Right";
    }
}

export class Favourites {
    private holds: Hold[] = [];
    private favouriteSelectedHandlers: FavouriteSelectedHandler[] = [];
    private favouritesRenderedCallback?: () => void;

    constructor(private tableSelector: string, private addHoldTemplate: string,
        private addHoldHandler: (event: Event) => void) {        
    }

    public addFavouriteSelectedHandler(handler: FavouriteSelectedHandler) {
        this.favouriteSelectedHandlers.push(handler);
    }

    public addFavouritesRenderedCallback(callback: () => void) {
        this.favouritesRenderedCallback = callback;
    }

    public add(hold: Hold) {
        if (!this.holds.find(h => h.id == hold.id)) {
            this.holds.push(hold);
            this.render();
        }
    }

    public delete(id: string) {
        this.holds = this.holds.filter(h => h.id != id);
        this.render();
    }

    public render() {
        const thead = document.querySelector(this.tableSelector + ' thead') as HTMLElement;        
        
        const tbody = document.querySelector(this.tableSelector + ' tbody') as HTMLElement;
        tbody.innerHTML = '';
        for (let hold of this.holds) {
            const rowId = 'hold-' + hold.id;
            const deleteId = 'delete-' + hold.id;
            tbody.innerHTML += `<tr id="${rowId}">
                <td>${hold.fix}</td>
                <td>${hold.inboundTrack}</td>
                <td>${hold.direction}</td>
                <td id="${deleteId}" class="delete">X</td>
            </tr>`;           
        }
        tbody.innerHTML += this.addHoldTemplate;

        this.favouritesRenderedCallback?.();

        // After the browser has inserted all elements above, now we can
        // wire up all the click events
        for (let hold of this.holds) {
            const rowId = 'hold-' + hold.id;
            document.getElementById(rowId)?.addEventListener('click', (_: Event) => {
                this.favouriteSelectedHandlers.forEach(h => h(hold));
            });
            const deleteId = 'delete-' + hold.id;
            document.getElementById(deleteId)?.addEventListener('click', (evt: Event) => {
                this.delete(hold.id);
                event?.stopPropagation();
            });            
        }
        document.querySelector(this.tableSelector + ' .add')?.addEventListener('click', (evt: Event) => {
            this.addHoldHandler(evt);
        });

    }
}