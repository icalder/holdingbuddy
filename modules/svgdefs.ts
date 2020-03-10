import * as SVG from '@svgdotjs/svg.js';

export class Defs {    
    public fix: SVG.Circle;
    public rhArrow: SVG.Path;
    public lhArrow: SVG.Path;
    public rhEntryArrow: SVG.Path;
    public lhEntryArrow: SVG.Path;
    public plane: SVG.G;

    constructor(svg: SVG.Svg) {        
        this.fix = svg.defs().circle(5).fill('white').stroke('black');
        this.rhArrow = svg.defs().path('M0,0 L0,10 L16,5 z').addClass('racetrack-arrow');
        this.lhArrow = svg.defs().path('M0,5 L16,0 L16,10 z').addClass('racetrack-arrow');
        this.rhEntryArrow = svg.defs().path('M0,0 L0,8 L10,4 z').addClass('entry-arrow');
        this.lhEntryArrow = svg.defs().path('M0,4 L10,0 L10,8 z').addClass('entry-arrow');
        this.plane = this.definePlane(svg);
    }

    protected definePlane(svg: SVG.Svg): SVG.G {
        const plane = svg.defs().group()
        plane.polygon('16,8 24,8 20,0')
        plane.rect(8, 30).radius(5).x(16).y(5).fill('black')
        plane.polygon('0,25, 40,25, 20,15')
        plane.polygon('12,38, 28,38, 20,28')
        plane.polygon('18,38, 22,38, 20,42')
        // Position the plane centered at (0,0) so when we USE it at (x,y) there's no offset to add       
        plane.center(0, 0);        
        return plane
    }
}