import { SeatState } from './seat-state.enum';

export interface Seat {
    name: string,
    row: number,
    column: number,
    state: SeatState

}