import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class S3Service {
  constructor(private http: HttpClient) { }

  requestUploadUrl(file: File): Observable<{ url: string; requiredHeaders?: Record<string, string> }> {
    return this.http.post<{ url: string; requiredHeaders?: Record<string, string> }>(
      '/api/s3/upload-url',
      {
        fileName: file.name,
        contentType: file.type || 'application/octet-stream'
      }
    );
  }

  uploadFileToS3(file: File, presigned: { url: string; requiredHeaders?: Record<string, string> }): Observable<HttpEvent<any>> {
    let headers = new HttpHeaders();
    if (presigned.requiredHeaders) {
      for (const [k, v] of Object.entries(presigned.requiredHeaders)) {
        headers = headers.set(k, v);
      }
    } else {
      headers = headers.set('Content-Type', file.type || 'application/octet-stream');
    }

    return this.http.put(presigned.url, file, {
      headers,
      reportProgress: true,
      observe: 'events'
    });
  }
}
