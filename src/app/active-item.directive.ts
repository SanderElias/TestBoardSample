import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'app-panel'
})
export class ActiveItemDirective {
  defaultColor: string;
  @HostListener('mouseenter') active() {
   this.el.nativeElement.style.backgroundColor = "yellow";
  }
   @HostListener('mouseleave') deactive() {
       this.el.nativeElement.style.backgroundColor = this.defaultColor;

  }
  constructor(private el: ElementRef) {
    this.defaultColor = this.el.nativeElement.style.backgroundColor;
  }
}
