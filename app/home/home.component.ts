import { ItemEventData } from "ui/list-view"
import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { GridLayout } from "ui/layouts/grid-layout";
import { Page } from "ui/page";
import { screen } from "platform";
import { isIOS } from "platform";
import { ScrollEventData } from "tns-core-modules/ui/scroll-view";
import { PanGestureEventData, GestureStateTypes, GestureEventData } from "ui/gestures";
import { setTimeout, clearInterval } from "timer";
import { registerElement } from "nativescript-angular/element-registry";
import { AnimationCurve } from "ui/enums";
import { RouterExtensions } from 'nativescript-angular/router';
import { Movie } from '././movie.model';
import { movies } from '././movies';

import { Video } from '../nativescript-videoplayer';
registerElement("VideoPlayer", () => Video);

declare const UITableViewCellSelectionStyle;


@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html",
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    movies: Movie[] = movies;

    trailer: string;
    @ViewChild('playButton')
    private playButton: ElementRef;
    @ViewChild('headerImage') headerImg: ElementRef;
    headerImageSrc: string = this.movies[0].imageSrc;
    currentY: number;
    @ViewChild('headerOverlay') headerOvrly: ElementRef;
    @ViewChild('detailContent') detailCtnt: ElementRef;

    @ViewChild('scrollView') sv: ElementRef;
    @ViewChild('videoModal') videoMdl: ElementRef;
    @ViewChild('collapseHeader') collapseHdr: ElementRef;

    isDetail: boolean = false;
    indexSelected: number = 0;

    onItemTap(args: ItemEventData): void {

        this.trailer = this.movies[args.index].trailer;
        console.log(this.trailer);

        this.sv.nativeElement.scrollToVerticalOffset(0);

        const loc = args.view.getLocationOnScreen();
        const ctx = args.view.bindingContext;
        //console.log("ctx: " + JSON.stringify(ctx));

        this.isDetail = true;
        this.indexSelected = args.index;

        this.collapseHdr.nativeElement.translateY = - 70;

        this.headerImg.nativeElement.translateY = loc.y - 20;
        this.currentY = loc.y - 20;
        this.headerImg.nativeElement.scaleY = (args.view.getActualSize().height - 10) / 300;
        this.headerImg.nativeElement.scaleX = (args.view.getActualSize().width - 10) / screen.mainScreen.widthDIPs;
        this.headerImageSrc = ctx.imageSrc;
        this.headerImg.nativeElement.visibility = 'visible';
        this.detailCtnt.nativeElement.animate({
            translate: { x: 0, y: 0 },
            duration: 200
        });
        this.headerImg.nativeElement.animate({
            scale: { x: 1, y: 1 },
            translate: { x: 0, y: this.first && isIOS ? - 20 : 0 },
            curve: AnimationCurve.cubicBezier(.34, .8, .96, .98),
            duration: 200
        }).then(
            () => {
                this.first = false;
                this.headerOvrly.nativeElement.animate({
                    opacity: 1,
                    duration: 200
                });
            });
    }
    // workaround for ios header weirdness
    first: boolean = true;

    constructor(
        private page: Page,
        private routerExtensions: RouterExtensions
    ) {
        this.page.actionBarHidden = true;
    }

    ngOnInit(): void {
        this.detailCtnt.nativeElement.translateY = 1000;
        this.headerImg.nativeElement.visibility = 'collapsed';
        this.headerOvrly.nativeElement.opacity = 0;

        this.videoMdl.nativeElement.visibility = 'collapsed';
    }

    onItemLoading(args: any) {
        if (isIOS) {
            const iosCell = args.ios;
            iosCell.selectionStyle = UITableViewCellSelectionStyle.None;
        }
    }

    toggleBookmark(index: number) {
        console.log(index);
        this.movies[index].bookmark = !this.movies[index].bookmark;
    }

    // Scroll to reveal hidden actionbar
    onScroll(args: ScrollEventData) {
        if (this.sv.nativeElement && isIOS) {
            this.sv.nativeElement.ios.bounces = false;
        }

        if ((this.sv.nativeElement.verticalOffset > 60) && (this.collapseHdr.nativeElement.translateY == - 70)) {
            this.collapseHdr.nativeElement.animate({
                translate: { x: 0, y: 0 },
                curve: AnimationCurve.cubicBezier(.34, .8, .96, .98),
                duration: 200
            });
        }
        else if ((this.sv.nativeElement.verticalOffset <= 60) && (this.collapseHdr.nativeElement.translateY == 0)) {
            this.collapseHdr.nativeElement.animate({
                translate: { x: 0, y: - 70 },
                curve: AnimationCurve.cubicBezier(.34, .8, .96, .98),
                duration: 200
            });
        }
    }

    // Clicking back when header Image is in view - animate the image
    onBack() {
        this.detailCtnt.nativeElement.animate({
            translate: { x: 0, y: 1000 },
            duration: 200
        });
        this.headerOvrly.nativeElement.animate({
            opacity: 0,
            duration: 200
        }).then(
            () => {
                this.headerImg.nativeElement.animate({
                    scale: { x: (screen.mainScreen.widthDIPs - 10) / screen.mainScreen.widthDIPs, y: 250 / 300 },
                    translate: { x: 0, y: this.currentY - 30 },
                    curve: AnimationCurve.cubicBezier(.34, .8, .96, .98),
                    duration: 200
                }).then(
                    () => {
                        this.headerImg.nativeElement.visibility = 'collapsed';
                        this.isDetail = false;
                    });
            });
    }

    // Clicking back when headerImage is not in view - skip header image animation
    onBackScrolled() {
        this.detailCtnt.nativeElement.animate({
            translate: { x: 0, y: 1000 },
            duration: 200
        }).then(
            () => {
                this.headerOvrly.nativeElement.opacity = 0;
                this.headerImg.nativeElement.visibility = 'collapsed';
                this.isDetail = false;
            });
    }

    // --------------------------------------------------------------------------------------
    // Video modal

    openVideoModal() {
        // Pavlo: insert fancy play animation here
        const animation1 = this.playButton.nativeElement.createAnimation(
            {
                scale: { x: 1.3, y: 1.3 },
                duration: 200,
                curve: AnimationCurve.linear
            }
        );
        const animation2 = this.playButton.nativeElement.createAnimation({
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

        this.videoMdl.nativeElement.visibility = 'visible';
        this.videoMdl.nativeElement.animate({
            //scale: { x: 1, y: 1 },
            opacity: 1,
            duration: 200
        });
    }

    closeVideoModal(vPlayer: Video) {
        vPlayer.pause();
        this.videoMdl.nativeElement.animate({
            //scale: { x: 0, y: 0 },
            opacity: 0,
            duration: 200
        }).then(
            () => {
                this.videoMdl.nativeElement.visibility = 'collapsed';
            });
    }

    // --------------------------------------------------------------------------------------
    // Navigation

    selectSeats() {
        this.routerExtensions.navigate(['home/select-seat']);
    }

    // --------------------------------------------------------------------------------------
    // Not Used


    // NOT USED -- this was dragging the image to close details
    prevDeltaY: number = 0;
    maxPan: number = 80;
    onHeaderPan(args: PanGestureEventData) {
        let img: GridLayout = <GridLayout>args.object;
        let newY: number = img.translateY + args.deltaY - this.prevDeltaY;

        if (args.state === 1) {
            this.prevDeltaY = 0;
        }
        else if (args.state === 2) {
            if (newY > 0) {
                img.translateY = newY;
                this.prevDeltaY = args.deltaY;
                this.detailCtnt.nativeElement.opacity = 0.9;
            }
        }
        else if (args.state === 3) {
            this.prevDeltaY = 0;
            this.detailCtnt.nativeElement.opacity = 1;
            if (newY > this.maxPan) {
                this.onBackFromSwipe(newY);
            }
            else {
                this.headerImg.nativeElement.animate({
                    translate: { x: 0, y: 0 },
                    curve: AnimationCurve.cubicBezier(.34, .8, .96, .98),
                    duration: 200
                })
            }
        }
    }

    // NOT USED -- this was part of the dragging to close details page
    onBackFromSwipe(newY: number) {
        this.detailCtnt.nativeElement.animate({
            translate: { x: 0, y: 1000 },
            duration: 200
        });
        this.headerOvrly.nativeElement.animate({
            opacity: 0,
            duration: 200
        });
        this.headerImg.nativeElement.animate({
            scale: { x: (screen.mainScreen.widthDIPs - 10) / screen.mainScreen.widthDIPs, y: 250 / 300 },
            translate: { x: 0, y: this.currentY - 20 },
            curve: AnimationCurve.cubicBezier(.34, .8, .96, .98),
            duration: 200
        }).then(
            () => {
                this.headerImg.nativeElement.visibility = 'collapsed';
                this.isDetail = false;
            });
    }

}
