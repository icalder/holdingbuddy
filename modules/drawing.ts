import * as SVG from '@svgdotjs/svg.js';

export class Coord {
    constructor(public x: number, public y: number) {}
    get asArray(): [number, number] { return [this.x, this.y]; }
}

// Move to x,y
// M x y

// Draw a line from current position to x,y
// L x y
// l dx dy

// Draw a Arc
// A rx ry x-axis-rotation large-arc-flag sweep-flag x y
// x,y is end of the arc coords
// large-arc flag determines if arc should be > 180deg or < 180 deg 
// sweep-flag determines if arc should start moving at positive or negative angles

/**
 * @param cx: The centre of the circle x coord
 * @param cy: The centre of the circle y coord
 * @param radius The radius of the circle
 * @param thetaDeg The angle subtended by the arc in degrees
 * @param centreDeg The offset of the centre of the arc from 0 (+/- 180)
 */
export function getSegmentPath(cx: number, cy: number, radius: number,
        thetaDeg: number, centreDeg: number): string {
        
    // We are using 0 deg == North and rotating clockwise
    // Maths has 0 deg == East and rotating anti-clockwise
    // Convert here from geographic to maths orientation
    centreDeg = (450 - centreDeg) % 360;

    let centre = centreDeg * Math.PI / 180.0;
    let theta = thetaDeg * Math.PI / 180.0;    

    // 1. Start at the centre of the circle
    let result = `M ${cx} ${cy} `;
    // 2. Draw a line to the radius, offset by centre - theta/2
    let dx = Math.round(radius * Math.cos(centre - theta/2));
    let dy = -Math.round(radius * Math.sin(centre - theta/2));
    result += `l ${dx} ${dy} `;
    // 3. Arc end coords are at the opposite end of the chord from x,y
    let x = cx + Math.round(radius * Math.cos(centre + theta/2));
    let y = cy - Math.round(radius * Math.sin(centre + theta/2));
    result += `A ${radius} ${radius} 0 0 0 ${x} ${y} `
    // 4 and finally draw a line back to the centre
    result += `L ${cx} ${cy}`;
    return result;
}

export function labelSegment(segment: SVG.Path, label: string, group: SVG.G) {
    const t = group.text(add => {
        add.tspan(label).attr('text-anchor', 'middle').addClass('segment-label');
    });
    t.path(segment); 
    t.textPath().attr('startOffset', '50%');
}