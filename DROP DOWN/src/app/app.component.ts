import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'app';
  result!:string;

  display(val:string)
  {
    if(val=="tiger")
    {
      this.result="assets/tiger.jpg";
    }
    if(val=="lion")
    {
      this.result="assets/Lion.jpg";
    }
    if(val=="panda")
    {
      this.result="assets/kuttypanda.jpg";
    }
    if(val=="elephant")
    {
      this.result="assets/elephant.jpg";
    }
  }
}