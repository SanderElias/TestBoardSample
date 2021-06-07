import {Component, Directive, ElementRef, HostBinding, Input, NgZone, OnInit} from '@angular/core';
import { BoardColComponent } from '../board-col/board-col.component';

@Component({
  selector: 'app-panel',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./panel.component.css'],
})
export class PanelComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}


@Directive({
  selector: 'app-panel[active]',
})
export class PannelActiveDirective {

  constructor(private col:BoardColComponent) {}

}

@Directive({
  selector: 'app-panel[collapsed]',
})
export class PanelCollapsedDirective {
  // @HostBinding('class.collapsed') #isCollapsed:boolean
  #elm = this.elmRef.nativeElement as HTMLElement;
  #lastState: boolean;
  @Input() set collapsed(isCollapsed: boolean) {
    if (this.#elm) {
      if (isCollapsed) {
        this.#elm.classList.add('collapsed');
      } else {
        this.#elm.classList.remove('collapsed');
      }
      if (typeof this.#lastState === 'boolean' && this.#lastState !== isCollapsed) {
        console.log('needs animation');
        // this.#animate(isCollapsed);
      }
      this.#lastState = isCollapsed;
    }
  }
  // @Input() collapsed:boolean;

  constructor(private elmRef: ElementRef, private zone: NgZone) {}

  /**
   * yes, this should be an css animation!
   * But I'm just playing with popmotion.
   */
  #animate = x => {
    this.zone.runOutsideAngular(async () => {
      const {animate} = await import('popmotion');
      const maxHeight = this.#elm.scrollHeight;
      const minHeight = 27;
      const from = x ? maxHeight : minHeight;
      const to = x ? minHeight : maxHeight;

      animate({
        from,
        to,
        onUpdate: l => {
          this.#elm.style.height = `${l}px`;
        },
      });
    });
  };
}
