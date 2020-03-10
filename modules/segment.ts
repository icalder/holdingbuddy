export class Segment {
    public endAngle: number;

    constructor(public name: string, public startAngle: number, public sweepDegrees: number) {
        if (startAngle < 0) {
            this.startAngle = 360 + startAngle;
        }
        this.endAngle = (startAngle + sweepDegrees) % 360
    }

    coversHeading(heading: number) {
        if (this.startAngle + this.sweepDegrees > 359) {      
            // This segment spans 0/360 - treat it as two separate segments for matching
            return Segment.headingBetween(this.startAngle, 359, heading) || Segment.headingBetween(0, this.endAngle, heading);
        } else {
            return Segment.headingBetween(this.startAngle, this.endAngle, heading);
        }
    }

    static headingBetween(start: number, end: number, heading: number) {
        return heading >= start && heading <= end;
    }
    
}