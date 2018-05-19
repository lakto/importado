import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {CurrencyService} from '../currency.service';
import {HttpErrorResponse} from '@angular/common/http';

import * as _moment from 'moment';

const moment = _moment;

@Component({
  selector: 'app-currency-converter',
  templateUrl: './currency-converter.component.html',
  styleUrls: ['./currency-converter.component.scss']
})
export class CurrencyConverterComponent implements OnInit {

  cForm: FormGroup;

  labels: any = {
    'country': 'Import from',
    'productValue': 'Product value',
    'date': 'Date',
    'submit': 'Calculate'
  };

  // error checking on the following fields
  formErrors = {
    'productValue': ''
  };

  // ...and the error hints
  validationMessages = {
    'productValue': {
      'required': 'The product value is required.'
    }
  };

  amount: number;
  postTax: number;
  postTaxPerCountry: number;
  customsTax: number;
  total: number;

  countries: any = [
    {
      'label': 'D, A, F, I',
      'tax': 11.50
    },
    {
      'label': 'other',
      'tax': 16
    }

  ];

  currencies: string[] = [
    'CHF',
    'EUR',
    'USD'
  ];

  selectedCurr: string;

  maxDate = new Date();

  constructor(private _formBuilder: FormBuilder,
              private _currencyService: CurrencyService) {
  }


  ngOnInit() {
    this.buildForm();

    this.updateCurrency();

    this.cForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now

  }

  buildForm() {

    this.cForm = new FormGroup({
      productValue: new FormControl({value: 100, disabled: false}, Validators.required),
      date: new FormControl({value: this.maxDate, disabled: true}, Validators.required),
      country: new FormControl({value: this.countries[0].tax, disabled: false}, Validators.required)
    });

  }

  onValueChanged(data?: any) {

    const form = this.cForm;

    Object.keys(this.formErrors).map(field => {
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        Object.keys(control.errors).map(key => {
          this.formErrors[field] += messages[key] + ' ';
        });

      }
    });
  }

  submitData() {

    const from_to = this.selectedCurr + '_CHF';

    // date must be in format as: 2018-05-18
    const date: string = moment(new Date(this.cForm.controls['date'].value)).format('YYYY-MM-DD');

    this._currencyService.calCur(from_to, date)
      .subscribe(
        (result: any) => {

          const chfValue = result.body[from_to].val[date];

          this.calculate(chfValue);

        },
        (error: HttpErrorResponse) => {

          console.error(error);
        }
      );

  }

  calculate(val: number) {

    const productValue: number = this.cForm.controls['productValue'].value;

    this.amount = val * productValue;

    this.postTax = this.cForm.controls['country'].value + (this.amount * 3 / 100);

    this.customsTax = (this.amount + this.postTax) * 7.7 / 100;

    this.total = this.amount + this.postTax + this.customsTax;
  }

  setCurrency(curr: string) {
    this.selectedCurr = curr;
  }

  updateCurrency() {
    if (this.cForm.controls['country'].value === 16) {
      this.selectedCurr = 'USD';
    } else {
      this.selectedCurr = 'EUR';
    }

  }

}
