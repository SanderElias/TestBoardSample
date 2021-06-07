import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { ScrollingModule as ScrollOriginalModule } from '@angular/cdk/scrolling';
import { ScrollingModule } from '@angular/cdk-experimental/scrolling';

import { AppComponent } from './app.component';
import { HelloComponent } from './hello.component';
import { BoardColComponent } from './board-col/board-col.component';
import { BoardComponent } from './board/board.component';
import { BoardItemComponent } from './board-item/board-item.component';
import { PanelCollapsedDirective, PanelComponent } from './panel/panel.component';
import { ActiveItemDirective } from './active-item.directive';
import { SideBarComponent } from './side-bar/side-bar.component';

@NgModule({
  imports: [BrowserModule, FormsModule, ScrollOriginalModule, ScrollingModule],
  declarations: [
    AppComponent,
    HelloComponent,
    BoardColComponent,
    BoardComponent,
    BoardItemComponent,
    PanelComponent,
    PanelCollapsedDirective,
    ActiveItemDirective,
    SideBarComponent,
  ],
  bootstrap: [AppComponent],
  providers: [],
})
export class AppModule { }
