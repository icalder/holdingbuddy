import * as SVG from '@svgdotjs/svg.js';
import { getSegmentPath, labelSegment, Coord } from './drawing';
import { Defs } from './svgdefs';
import { Segment } from './segment';

// https://svgjs.com/docs/3.0/installation/

const SIN_30 = 0.5;
const COS_30 = 0.866;

export class Chart {
    private svg: SVG.Svg;
    private defs: Defs;
    private backgroundGroup?: SVG.G;
    private holdGroup?: SVG.G;
    private entryGroup?: SVG.G;
    private fixNameText?: SVG.Text;
    private _lefthand = false;
    private _inboundTrack = 0;
    private _inboundTrackChangedHandler?: (val: number) => void;
    private _heading = 0;
    private _headingChangedHandler?: (val: number) => void;
    private _fixName = '';

    // reqd for Hammer
    private lastInboundTrack = 0;
    private startRotation = 0;
    
    constructor (chartSelector: string,
        private width: number, private height: number) {
            this.svg = SVG.SVG().addTo(chartSelector);
            this.svg.viewbox(0, 0, width, height);
            this.defs = new Defs(this.svg);
    }

    public set inboundTrackChangedHandler(handler: (val: number) => void) {
        this._inboundTrackChangedHandler = handler;
    }

    public set headingChangedHandler(handler: (val: number) => void) {
        this._headingChangedHandler = handler;
    }

    public set inboundTrack(value: number) {
        this._inboundTrack = Math.abs(value % 360);
        this._inboundTrackChangedHandler?.(this._inboundTrack);
        this.fixName = '';
        this.draw();
    }

    public set heading(value: number) {
        this._heading = Math.abs(value % 360);
        this._headingChangedHandler?.(this._heading);     
        this.draw();
    }

    public set lefthand(value: boolean) {
        this._lefthand = value;
        this.fixName = '';
        this.draw();
    }

    public get lefthand() {
        return this._lefthand;
    }

    public set fixName(value: string) {
        this._fixName = value;
        this.draw();
    }

    public rotationStarted(rotation: number) {
        this.startRotation = Math.round(rotation);
        this.lastInboundTrack = this.inboundTrackDeg;
    }

    public rotationCompleted(rotation: number) {
        const diff = this.startRotation - Math.round(rotation);
        let newTrack = (this.lastInboundTrack - diff) % 360;
        if (newTrack < 0) {
            newTrack = 360 + newTrack;
        }
        this.inboundTrack = Math.round(newTrack);       
    }

    public chartClicked(evt: MouseEvent) {
        // Get x and y click position relative to chart centre
        const target = evt.currentTarget as HTMLElement;
        const x0 = target.offsetLeft + target.offsetWidth / 2;
        const y0 = target.offsetTop + target.offsetHeight / 2;
        const x = evt.clientX - x0;
        const y = evt.clientY - y0;
        //const x0 = evt.currentTarget.offsetLeft + evt.currentTarget.offsetWidth / 2;
        // Use polar coords here, r and phi
        // https://en.wikipedia.org/wiki/Polar_coordinate_system
        // http://www.phy6.org/stargaze/Strig4.htm
        // sin φ = y/r
        // cos φ = x/r
        // x^2 + y^2 = r^2
        // Math.atan2() returns the angle in the plane between the positive x-axis and the ray from (0,0) to the point (x,y)
        // clockwise = positive
        const xAxisAngle =  Math.atan2(y, x) * 180 / Math.PI
        this.heading = Math.round((270 + xAxisAngle)) % 360
    }

    public draw() {
        this.drawBackground();
        this.drawHoldingPattern();        
        const planePosition = this.calculatePlanePosition();
        this.drawEntry(planePosition);
        // We want the plane on top of the entry group so draw it last
        this.drawPlane(planePosition);
    }
    
    protected get inboundTrackDeg() {
        let result = this._inboundTrack % 360;
        if (result < 0) result = 360 + result;
        return result;
    }

    protected get outboundTrackDeg() {
        return (this.inboundTrackDeg + 180) % 360;
    }

    protected get circuitWidth() {
        return this.width / 5;
    }

    protected get turnRadius() {
        return this.circuitWidth / 2;
    }

    protected get legLength() {
        return this.width / 4;
    }

    protected get fix() {
        return new Coord(this.width / 2, this.height / 2);
    }

    protected drawBackground() {
        if (this.backgroundGroup) {
            this.backgroundGroup.remove()        
        }
        this.backgroundGroup = this.svg.group();
        
        const [cx, cy] = this.fix.asArray;
        const radius = this.width / 2;

        const directPath = getSegmentPath(cx, cy, radius, 180, 180);
        const direct = this.backgroundGroup.path(directPath).addClass('direct');

        const teardropPath = getSegmentPath(cx, cy, radius, 70, this.lefthand ? 55 : 305);
        const teardrop = this.backgroundGroup.path(teardropPath).addClass('teardrop');

        const parallelPath = getSegmentPath(cx, cy, radius, 110, this.lefthand ? 325 : 35);
        const parallel = this.backgroundGroup.path(parallelPath).addClass('parallel');

        const rotation = (this.lefthand ? -20 : 20) + this.inboundTrackDeg;
        this.backgroundGroup.transform({ rotate: rotation });
    
        labelSegment(direct, 'Direct', this.backgroundGroup);
        labelSegment(teardrop, 'Teardrop', this.backgroundGroup);
        labelSegment(parallel, 'Parallel', this.backgroundGroup);
    }

    protected drawHoldingPattern() {
        if (this.holdGroup) {
            this.holdGroup.remove();
        }
        if (this.fixNameText) {
            this.fixNameText.remove();
        }

        this.holdGroup = this.svg.group().id('racetrack-group');

        const [cx, cy] = this.fix.asArray;

        // Ref orientation for width/height is 0deg inbound track RH turn i.e.
        // ( )
        // | |
        // | |
        // ( )
        
        if (this.lefthand) {
            // outbound turn
            this.holdGroup.path(`M ${cx} ${cy} A ${this.turnRadius} ${this.turnRadius} 0 0 0 ${cx - 2 * this.turnRadius} ${cy}`);
            var outboundLeg = this.holdGroup.path(`M ${cx - 2 * this.turnRadius} ${cy} v ${this.legLength}`);
            // inbound turn
            this.holdGroup.path(`M ${cx - 2 * this.turnRadius} ${cy + this.legLength} A ${this.turnRadius} ${this.turnRadius} 0 0 0 ${cx} ${cy + this.legLength}`);
        } else {
            // outbound turn
            this.holdGroup.path(`M ${cx} ${cy} A ${this.turnRadius} ${this.turnRadius} 0 0 1 ${cx + 2* this.turnRadius} ${cy}`);
            var outboundLeg = this.holdGroup.path(`M ${cx + 2 * this.turnRadius} ${cy} v ${this.legLength}`);
            // inbound turn
            this.holdGroup.path(`M ${cx + 2 * this.turnRadius} ${cy + this.legLength} A ${this.turnRadius} ${this.turnRadius} 0 0 1 ${cx} ${cy + this.legLength}`);
        }
        
        const inboundLeg = this.holdGroup.path(`M ${cx} ${cy + this.legLength} v -${this.legLength}`);
        inboundLeg.marker('end', 10, 10, add => {
            add.use(this.defs.fix).x(2.5).y(2.5);
        });

        /*
        SVG text explained:
        http://tutorials.jenkov.com/svg/text-element.html
        */
    
        // Arrow is 10h by 16w
        // Text y pos refers to the BOTTOM of the text
        // Set marker ref (attachment) point to the centre of the arrow i.e. 5
        // Default font size is 16
        // We want arrow underneath text or text underneath arrow depending on rotation / inbound / outbound

        // 90
        // >

        //   <
        // 270

        const textAboveArrow = (marker: SVG.Marker, trackDeg: number) => {
            const group = marker.group();
            group.text(txt => {
                txt.tspan(trackDeg.toString() + '°')
                    .attr('text-anchor', 'start');
            }).y(8);
            this.lefthand ? group.use(this.defs.lhArrow).y(25) : group.use(this.defs.rhArrow).y(25);
        }
        textAboveArrow.refPos = new Coord((this.lefthand ? 16 : 0), 30);

        const textBelowArrow = (marker: SVG.Marker, trackDeg: number) => {
            const group = marker.group();                   
            group.text(txt => {
                txt.tspan(trackDeg.toString() + '°')
                    .attr('text-anchor', 'start');
            }).y(10);
            this.lefthand ? group.use(this.defs.rhArrow) : group.use(this.defs.lhArrow);
        }
        textBelowArrow.refPos = new Coord((this.lefthand ? 0 : 16), 5);
        
        const markerFactories = [[textAboveArrow, textBelowArrow], [textBelowArrow, textAboveArrow]];
        const inboundMarkerFactory = markerFactories[this.lefthand ? 1 : 0][this.inboundTrackDeg > 180 ? 1 : 0];
        const outboundMarkerFactory = markerFactories[this.lefthand ? 0 : 1][this.inboundTrackDeg > 180 ? 1 : 0];

        let inboundHeading = this.holdGroup.marker(40, 40, add => {
            inboundMarkerFactory(add, this.inboundTrackDeg)
        }).ref(...inboundMarkerFactory.refPos.asArray).attr({ orient: this.inboundTrackDeg > 180 ? '90' : 'auto' });
        inboundLeg.marker('start', inboundHeading);

        let outboundHeading = this.holdGroup.marker(40, 40, add => {
            outboundMarkerFactory(add, this.outboundTrackDeg)
        }).ref(...outboundMarkerFactory.refPos.asArray).attr({ orient: this.inboundTrackDeg > 180 ? 'auto' : '270' });
        outboundLeg.marker('start', outboundHeading);

        this.holdGroup.rotate(this.inboundTrackDeg, cx, cy);

        // If we have a fix name let's draw it
        if (this._fixName) {
            const ypos = (this._inboundTrack >= 0 && this._inboundTrack <= 80) ||
                (this._inboundTrack >= 180 && this._inboundTrack <= 260) ? cy + 5 : cy - 20;
            this.fixNameText = this.svg.text(txt =>
                txt.tspan(this._fixName)
                    .addClass('fixName')
            ).x(cx + 5).y(ypos);
        }
    }    

    protected calculatePlanePosition(): Coord {               
        // Position the plane on a radial line.  Use 80% of the canvas width or height - whichever is smaller
        const r = 0.4 * (this.width);
        // Use the reciprocal heading TO the fix
        const headingRadians = (360 - this._heading) * (Math.PI / 180);
        let x = r * Math.sin(headingRadians);
        let y = r * Math.cos(headingRadians);
        x += this.width / 2;
        y += this.height / 2;

        return new Coord(x, y);
    }

    protected drawEntry(planePosition: Coord) {
        if (this.entryGroup) {
            this.entryGroup.remove();
        }
        this.entryGroup = this.svg.group().id('entry-group');

        const [cx, cy] = this.fix.asArray;

        const sectors: Segment[] = [];      
        if (this.lefthand) {
            sectors.push(new Segment('Direct', this.inboundTrackDeg - 110, 180));
            sectors.push(new Segment('Parallel', this.inboundTrackDeg + 70, 110));
            sectors.push(new Segment('Teardrop', this.inboundTrackDeg + 180, 70));
        } else {
            sectors.push(new Segment('Direct', this.inboundTrackDeg - 70, 180));
            sectors.push(new Segment('Teardrop', this.inboundTrackDeg + 110, 70));
            sectors.push(new Segment('Parallel', this.inboundTrackDeg + 180, 110));
        }

        const sector = sectors.find(s => s.coversHeading(this._heading));
        // Line from the plane to the fix - all entries start with this
        const line = this.entryGroup.line(planePosition.x, planePosition.y, cx, cy);
        let endArrow = this.entryGroup.marker(10, 10, add => {
            add.use(this.defs.rhEntryArrow).x(0).y(2);
        }).ref(30, 6);
        line.marker('end', endArrow);
        
        const endArrowReversed = this.entryGroup.marker(10, 10, add => {
            add.use(this.defs.lhEntryArrow).x(0).y(2)
        }).ref(-20, 6);

        switch (sector!.name) {
            case 'Teardrop': {
                // from fix proceed 30deg offset outbound heading
                // | \
                // |  \
                // say hypotenuse = legLength. Then: x-offset = sin(angle) * legLength, y-offset = cos(angle) * legLength

                let teardropBearing = this.lefthand ? this.outboundTrackDeg + 30 : this.outboundTrackDeg - 30;
                if (teardropBearing < 0) {
                    teardropBearing += 360;
                }
                // can't use 'side' for text above/below path as that's a SVG 2 feature :-(
                // Instead, have to draw path in the opposite direction when teardropBearing > 180
                const startOffset = teardropBearing > 180 ? '25%' : '10%';
                const l = 1.25 * this.legLength;
                // Find the point of intersection with the hold at the start of the inbound turn
                const xi = this.lefthand ? cx - SIN_30 * l : cx + SIN_30 * l;
                const yi = cy + COS_30 * l;
                const teardropBearingTxt = this.entryGroup.text(txt => {
                    txt.tspan(`${teardropBearing}° 1 min`)
                    .attr('text-anchor', 'start');
                });
                if (teardropBearing <= 180) {
                    const teardropLine = this.entryGroup.path(`M ${cx} ${cy} L ${xi} ${yi}`)                                           
                        .rotate(this.inboundTrackDeg, cx, cy);
                    teardropBearingTxt.path(teardropLine).attr({ startOffset });
                    teardropLine.marker('end', endArrow);
                } else {
                    const teardropLine = this.entryGroup.path(`M ${xi} ${yi} L ${cx} ${cy}`)
                        .rotate(this.inboundTrackDeg, cx, cy);
                    teardropBearingTxt.path(teardropLine).attr({ startOffset });
                    teardropLine.marker('start', endArrowReversed);
                }
                // Finally draw a small arc indicating the direction to turn back to the inbound course
                const returnArc = this.entryGroup.path(`M ${xi} ${yi} A ${this.turnRadius} ${this.turnRadius} 0 0 ${this.lefthand ? 0 : 1} ${cx} ${cy + this.legLength}`)
                    .fill({ opacity: 0 })
                    .rotate(this.inboundTrackDeg, cx, cy);
                returnArc.marker('end', this.entryGroup.marker(10, 10, add => {
                    add.use(this.defs.rhEntryArrow).x(2).y(2);
                }).ref(10, 5));
                break;
            }
            case 'Parallel': {
                // from fix proceed in reverse to outbound turn                    
                const reverseLineText = this.entryGroup.text(txt => {
                    txt.tspan(`${this.outboundTrackDeg}°`).attr('text-anchor', 'middle');
                });
                // can't use 'side' for text above/below path as that's a SVG 2 feature :-(
                // Instead, have to draw path in the opposite direction when outboundTrackDeg > 180
                if (this.outboundTrackDeg <= 180) {
                    const reverseLine = this.entryGroup.path(`M ${cx} ${cy} L ${cx} ${cy + this.legLength}`)
                        .rotate(this.inboundTrackDeg, cx, cy);
                    reverseLineText.path(reverseLine).attr({ startOffset: '40%' });
                    reverseLine.marker('end', endArrow);
                } else {            
                    const reverseLine = this.entryGroup.path(`M ${cx} ${cy + this.legLength} L ${cx} ${cy}`)
                        .rotate(this.inboundTrackDeg, cx, cy);
                    reverseLineText.path(reverseLine).attr({ startOffset: '60%' });
                    reverseLine.marker('start', endArrowReversed);
                }
                // Draw over the outbound turn
                const xr = this.lefthand ? cx - this.circuitWidth : cx + this.circuitWidth;
                this.entryGroup.path(`M ${cx} ${cy + this.legLength} A ${this.turnRadius} ${this.turnRadius} 0 0 ${this.lefthand ? 1 : 0} ${xr} ${cy + this.legLength}`)
                    .fill({ opacity: 0 })
                    .rotate(this.inboundTrackDeg, cx, cy) ;
                // At completion of outbound turn in reverse, turn again back to the course to the fix
                // Find the point of return at the start of the 'outbound' turn
                const yr = cy + this.legLength;
                // Let's use a 45-degree angle - so yintercept = cy + this.circuitWidth
                const yintercept = yr - this.circuitWidth;

                let returnHeading = (this.inboundTrackDeg + (this.lefthand ? 45 : - 45)) % 360;
                if (returnHeading < 0) {
                    returnHeading = 360 + returnHeading
                }
                const returnLineText = this.entryGroup.text(txt => {
                    txt.tspan(`${returnHeading}°`).attr('text-anchor', 'middle');
                });

                // can't use 'side' for text above/below path as that's a SVG 2 feature :-(
                // Instead, have to draw path in the opposite direction when returnHeading > 180
                if (returnHeading <= 180) {
                    const returnLine = this.entryGroup.path(`M ${xr} ${yr} L ${cx} ${yintercept}`)
                        .rotate(this.inboundTrackDeg, cx, cy);
                    returnLineText.path(returnLine).attr({ startOffset: '40%' });
                    returnLine.marker('end', endArrow);
                } else {
                    const returnLine = this.entryGroup.path(`M ${cx} ${yintercept} L ${xr} ${yr}`)
                        .rotate(this.inboundTrackDeg, cx, cy);
                    returnLineText.path(returnLine).attr({ startOffset: '60%' });
                    returnLine.marker('start', endArrowReversed);
                }
                break;
            }
        }
    }

    protected drawPlane(planePosition: Coord) {        
        let plane = this.entryGroup!.use(this.defs.plane);
        plane.center(...planePosition.asArray);
        plane.rotate(this._heading, ...planePosition.asArray);
    }
}