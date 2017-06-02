import { Pipe, PipeTransform } from '@angular/core';
import { BeaconDetection } from '../zetapush/zetapush.service';

@Pipe({
    name: 'orderByDistance'
})

export class OrderByDistancePipe implements PipeTransform {
    transform(array: Array<BeaconDetection>, args: number): Array<BeaconDetection> {

        if(!array || array === undefined || array.length === 0) return null;

        array.sort((a: any, b: any) => {
            if (a.distance < b.distance){
                return -1;
            } else if ( a.distance > b.distance) {
                return 1;
            } else {
                return 0;
            }
        });
        return array;
    }
}
