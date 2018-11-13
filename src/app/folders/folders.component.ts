import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-folders',
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.css']
})
export class FoldersComponent implements OnInit {
  @Input() name: string;
  @Output() pathEvent = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  changeFolder() {
    this.pathEvent.emit(this.name);
  }

}
