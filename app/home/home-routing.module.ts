import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { SelectSeatComponent } from "./select-seat/select-seat.component";

import { HomeComponent } from "./home.component";

const routes: Routes = [
    { path: "", component: HomeComponent },
    { path: "select-seat", component: SelectSeatComponent }
];

@NgModule({
    imports: [NativeScriptRouterModule.forChild(routes)],
    exports: [NativeScriptRouterModule]
})
export class HomeRoutingModule { }
