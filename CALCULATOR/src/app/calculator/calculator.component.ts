import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss']
})
export class CalculatorComponent implements OnInit {
  @Input() input: any = 0;
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onResult = new EventEmitter<any>();
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onUpdate = new EventEmitter<any>();

  keyBinding = [
    {charCode: 49, value: 1},
    {charCode: 50, value: 2},
    {charCode: 51, value: 3},
    {charCode: 52, value: 4},
    {charCode: 53, value: 5},
    {charCode: 54, value: 6},
    {charCode: 55, value: 7},
    {charCode: 56, value: 8},
    {charCode: 57, value: 0},
    {charCode: 48, value: 0},
    {charCode: 44, value: 'decimal'},
    {charCode: 45, value: 'decimal'},
    {charCode: 46, value: 'decimal'},
    {charCode: 47, value: 'divide'},
    {charCode: 42, value: 'multiply'},
    {charCode: 45, value: 'subtract'},
    {charCode: 43, value: 'add'},
    {charCode: 32, value: 'result'},
    {keyCode: 8, value: 'erase'},
    {keyCode: 37, value: 'erase'},
    {keyCode: 27, value: 'clear'},
    {charCode: 40, value: 'bracket'},
    {charCode: 41, value: 'bracket'},
  ];

  calculatorElement;
  output = '0';
  result = 0;
  operators = [];
  history = [];
  bracketSet = false;
  showHistory = false;
  lastOperation;
  nextOperationIfNumber;

  currentPressed;
  pressTimeout = 250;
  pressTimer;

  constructor() {
  }

  ngOnInit() {
    if (this.input) {
      this.result = <number>this.input;
      this.output = this.result + '';
    }
  }

  onKeyDown(event: any) {
    for (const binding of this.keyBinding) {
      if (binding['keyCode'] && event.keyCode === binding['keyCode']) {
        event.preventDefault();
        this.keyPress(binding.value);
      }
    }
  }

  onKeyPress(event: any) {
    for (const binding of this.keyBinding) {
      if (binding['charCode'] && event.charCode === binding['charCode']) {
        event.preventDefault();
        this.keyPress(binding.value);
      }
    }
  }

  keyPress(value: any) {
    const oValue = value;
    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
    }
    this.currentPressed = value;
    this.pressTimer = setTimeout(() => {
      this.currentPressed = null;
    }, this.pressTimeout);
    if (value === 'result' && this.operators.length) {
      this.getFinalResult();
    } else if (value === 'erase') {
      this.eraseLastOperator();
    } else if (value === 'clear') {
      this.clearOperation();
    } else {
      if (value === 'bracket') {
        if (!this.bracketSet) {
          this.bracketSet = true;
          if (this.isNumeric(this.lastOperator())) {
            this.operators.push('*');
          }
          value = '(';
        } else {
          this.bracketSet = false;
          value = ')';
        }
      } else if (value === 'multiply') {
        value = '*';
      } else if (value === 'divide') {
        value = '/';
      } else if (value === 'add') {
        value = '+';
      } else if (value === 'subtract') {
        value = '-';
      } else if (value === 'decimal') {
        value = '.';
      }
      if (this.isNumeric(value) || (!this.isNumeric(value) && this.isNumeric(this.lastOperator()) && this.lastOperator() !== '.')) {
        if (this.nextOperationIfNumber && this.isNumeric(value)) {
          this.operators.push(this.nextOperationIfNumber);
        }
        if (this.isNumeric(value) && this.lastOperator() === ')') {
          this.operators.push('*');
        }
        this.operators.push(value);
        this.nextOperationIfNumber = null;
      } else {
        this.eraseLastOperator();
        this.keyPress(oValue);
        return;
      }
    }

    this.renderResult();
  }

  beforeLastOperator() {
    if (this.operators.length >= 2) {
      return this.operators[this.operators.length - 2];
    }
    return null;
  }

  lastOperator() {
    if (this.operators.length) {
      return this.operators[this.operators.length - 1];
    }
    return null;
  }

  isNumeric(value) {
    if (value) {
      return (parseInt(value, 10) > 0) || value === 0 || value === '.' || value === '(' || value === ')';
    }
    return false;
  }

  eraseLastOperator() {
    if (this.operators.length) {
      if (this.operators[this.operators.length - 1] === ')') {
        this.bracketSet = true;
      } else if (this.operators[this.operators.length - 1] === '(') {
        this.bracketSet = false;
      }
      this.operators.splice(this.operators.length - 1, 1);
    }
  }


  renderResult() {
    this.output = '';
    this.showHistory = false;
    let lastNumber = false;
    if (this.operators.length === 1 && !this.isNumeric(this.lastOperator())) {
      this.operators = [];
      this.output = '0';
    }
    for (const operator of this.operators) {
      let space = '';
      const number = this.isNumeric(operator);
      if (this.output.length && (lastNumber !== number)) {
        space = ' ';
      }
      this.output += space + operator;
      lastNumber = number;
    }
    if (this.output === '') {
      this.output = '0';
    }


    let result = this.checkValues(this.output, this.bracketSet);
    const bracketSet = result[1];
    if (bracketSet) {
      result += ' )';
    }
    // tslint:disable-next-line:no-eval
    this.result = eval(result[0]);
    this.onUpdate.emit({
      result: this.result,
      operators: this.operators,
      history: this.history
    });
  }

  checkValues(valueString, bracketSet) {
    valueString = valueString.replace(/ /g, '');
    const lastChar = valueString.substr(-1, 1);
    if (lastChar === '.' || lastChar === '(' || !this.isNumeric(lastChar)) {
     valueString = valueString.substr(0, valueString.length - 1);
      if (lastChar === '(' && bracketSet) {
        bracketSet = false;
      }
      return this.checkValues(valueString, bracketSet);
    }
    return [valueString, bracketSet];
  }

  getFinalResult() {
    this.history.push({
      operators: this.operators,
      result: this.result,
      output: this.output,
    });
    this.lastOperation = this.history[this.history.length - 1];
    this.output = this.result + '';
    this.onResult.emit({
      result: this.result,
      operators: this.operators,
      history: this.history
    });
    this.prepareNextOperation();
  }

  prepareNextOperation() {
    this.operators = [];
    this.operators = [this.output];
    this.nextOperationIfNumber = '+';
    this.renderResult();
  }

  clearOperation() {
    this.operators = [];
    this.nextOperationIfNumber = null;
    this.renderResult();
  }

  clearHistory() {
    this.lastOperation = null;
    this.history = [];
    this.showHistory = false;
  }

  copyToClipboard(text: any) {
    text = text + '';
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    const selected = document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false;
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    if (selected) {
      document.getSelection().removeAllRanges();
      document.getSelection().addRange(selected);
    }
  }

}
