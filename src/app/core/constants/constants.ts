import { Injectable, signal, Signal } from '@angular/core';
import { HttpResponseBase, HttpResponse, HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class Constants {
  public static readonly preferredProvinceIdKey = 'preferredProvinceId';
}
