import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = error.error?.message || 'Something went wrong. Please try again.';

      if (error.status === 0) {
        snackBar.open('Cannot reach the server. Check your connection.', 'Dismiss', { duration: 4000 });
      } else {
        snackBar.open(message, 'Dismiss', { duration: 4000 });
      }

      return throwError(() => error);
    })
  );
};
