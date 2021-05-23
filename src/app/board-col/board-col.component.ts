import {Component, Input, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {pluck, switchMap} from 'rxjs/operators';
import {BoardDataService, Item} from '../board-data.service';

@Component({
  selector: 'app-board-col',
  template: `
    <ng-container *ngIf="item$ | async as item">
      <h2>
        {{ item.name }}
        <span (click)="addOne(item)">+</span>
        <span (click)="openClose(item, true)">🌂</span>
        <span (click)="openClose(item, false)">☔</span>
        <span (click)="openClose(item, 'random')">🎲</span>
      </h2>
      <app-board-item *ngFor="let bi of item.children; trackBy: byId" [itemId]="bi.id"></app-board-item>
    </ng-container>
  `,
  styleUrls: ['./board-col.component.css'],
})
export class BoardColComponent implements OnInit {
  localState = new BehaviorSubject({
    id: '',
  });
  @Input() set itemId(id: string) {
    if (id) {
      this.localState.next({...this.localState.value, id});
    }
  }
  item$ = this.localState.pipe(
    pluck('id'),
    switchMap(id => this.data.getItemById(id))
  );

  byId = (_, item: Item) => item.id;

  constructor(private data: BoardDataService) {}

  addOne(item: Item) {
    // const curentState = typeof items['allClosed'] === 'boolean' ? items['allClosed'] : false;
    // items.children.forEach(i => (i.collapsed = !curentState));
    // items['allClosed'] = !curentState;
    this.data.addItem(item.id);
  }

  openClose(item: Item, newState: boolean | 'random') {
    item.children.forEach(ch => {
      ch.collapsed = newState === 'random' ? Math.random() < 0.5 : newState;
      this.data.saveItem(ch);
    });
  }

  ngOnInit() {}
}
