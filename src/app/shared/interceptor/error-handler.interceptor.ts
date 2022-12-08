import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ErrorComponent } from 'src/app/error/error.component';

@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
  constructor(public dialog: MatDialog) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        let errorMeesage;
        if (error.error.message) errorMeesage = error.error.message;
        else errorMeesage = 'An unknown error occurred!';
        this.dialog.open(ErrorComponent, {
          data: { message: errorMeesage },
        });
        return throwError(() => new Error(`${error}`));
      })
    );
  }
}
