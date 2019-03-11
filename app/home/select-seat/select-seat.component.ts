import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { Page } from "tns-core-modules/ui/page/page";
import { EventData } from "tns-core-modules/data/observable";
import { AnimationCurve } from 'tns-core-modules/ui/enums/enums';
import { Image } from 'tns-core-modules/ui/image/image';
import { ListPicker } from 'tns-core-modules/ui/list-picker/list-picker';
import { RouterExtensions } from 'nativescript-angular/router';
import { Seat } from './seat.model';
import { SeatState } from './seat-state.enum';
import { seats } from './seats';


@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./select-seat.component.html",
    styleUrls: ['./select-seat.component.css']
})
export class SelectSeatComponent implements OnInit {

    @ViewChild('selectTimeDialog')
    private selectTimeDialog: ElementRef;

    isDismissed: boolean = true;
    seatsSelected: number = 0;
    selectedHoursIndex: number = 0;
    selectedDateIndex: number = 0;

    hours: String[] = [
        '10.00', '12:00', '14:00', '15:30', '10.00', '12:00', '14:00', '15:30', '10.00', '12:00', '14:00', '15:30'
    ];

    days: String[] = [
        'Nov 10, Friday',
        'Nov 11, Saturday',
        'Nov 12, Sunday',
        'Nov 13, Monday',
        'Nov 14, Tuesday',
        'Nov 15, Wednesday',
        'Nov 16, Thursday',
        'Nov 17, Friday',
        'Nov 18, Saturday',
        'Nov 19, Sunday',
        'Nov 20, Monday'
    ];
    seats: Seat[] = seats;

    constructor(private page: Page, private routerExtensions: RouterExtensions) {
        this.page.actionBarHidden = true;
    }

    ngOnInit(): void {
        this.selectTimeDialog.nativeElement.marginBottom = -300;
    }

    showDialog() {


        this.isDismissed = false;

        this.selectTimeDialog.nativeElement.animate({
            translate: {
                x: 0,
                y: -300
            },
            duration: 400,
            delay: 50,
            curve: AnimationCurve.cubicBezier(0.03, 0.073, 0.36, 1)
        });

    }

    hideDialog() {
        this.selectTimeDialog.nativeElement
            .animate({
                translate: {
                    x: 0,
                    y: 300
                },
                duration: 200,
                curve: AnimationCurve.easeIn
            })
            .then(() => {
                this.isDismissed = true;
            });
    }

    getSeatImageSource(seat: Seat): string {

        if (seat.state === SeatState.Taken) {
            return '~/assets/seat_taken.png';
        }
        if (seat.state === SeatState.Selected) {
            return '~/assets/seat_selected.png';
        }
        return '~/assets/seat_available.png'
    }


    animateTest(args: EventData, seat: Seat) {

        if (seat.state === SeatState.Taken) {
            return;
        }

        if (seat.state === SeatState.Available) {
            seat.state = SeatState.Selected;
            this.seatsSelected++;
        } else if (seat.state === SeatState.Selected) {
            seat.state = SeatState.Available;
            this.seatsSelected--;
        }

        let seatView = <Image>args.object;

        console.log('lets animate');

        const animation1 = seatView.createAnimation(
            {
                scale: { x: 1.3, y: 1.3 },
                duration: 200,
                curve: AnimationCurve.linear
            }
        );
        const animation2 = seatView.createAnimation({
            scale: { x: 1, y: 1 },
            duration: 200,
            curve: AnimationCurve.easeOut
        });

        animation1
            .play()
            .then(() => animation2.play())
            .catch(e => {
                console.error(e.message);
            });
    }

    listPickerHoursIndexChanged(args) {
        const picker = <ListPicker>args.object;
        this.selectedHoursIndex = picker.selectedIndex;

    }

    listPickerDateIndexChanged(args) {
        const picker = <ListPicker>args.object;
        this.selectedDateIndex = picker.selectedIndex;

    }

    navigateBack() {
        this.routerExtensions.back();
    }

}
