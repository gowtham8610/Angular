import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-calculator';
  inputValue = 100;
  updateValue = 0;
  resultValue = 0;


  onResult(res: any) {
    console.log('onResult', res);
    this.resultValue = res.result;
  }

  onUpdate(res:any){
    console.log('onUpdate', res);
    this.updateValue = res.result;
  }
}
