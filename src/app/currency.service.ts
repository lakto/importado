import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {throwError} from 'rxjs/internal/observable/throwError';
import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';

import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  constructor(public http: HttpClient) {
  }

  /**
   *
   * @param {string} from_to
   * @param {string} date | format yyyy-mm-dd
   * @returns {Observable<any>}
   */
  calCur(from_to: string, date?: string): Observable<any> {

    const url: string = environment.currencyconverterapi + 'convert?q=' + from_to + '&compact=y' + '&date=' + date + '&apiKey=' + environment.apikey;

    return this.http.get(url, {observe: 'response'}).pipe(
      map((response: HttpResponse<any>): any => {
        return response;
      }),
      catchError((error: HttpErrorResponse) => {

        console.error(error);

        return throwError(error);

      })
    );
  }

}
