import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { FileUpload } from '../models/fileupload';


@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor(private httpClient: HttpClient) { }


  getFileUploadList(): Observable<FileUpload[]> {

    return this.httpClient.get<FileUpload[]>(environment.getApiUrl + '/fileUploads/getall')
  }

  getFileUploadById(id: number): Observable<FileUpload> {
    return this.httpClient.get<FileUpload>(environment.getApiUrl + '/fileUploads/getbyid?id='+id)
  }

  addFileUpload(fileUpload: FileUpload): Observable<any> {
    const formData = new FormData();
    formData.append('fileData', fileUpload.fileData);
    formData.append('createdUserId', fileUpload.createdUserId.toString());
    formData.append('lastUpdatedUserId', fileUpload.lastUpdatedUserId.toString());
    formData.append('status', fileUpload.status ? 'true' : 'false');
    formData.append('isDeleted', fileUpload.isDeleted ? 'true' : 'false');
  

  
    return this.httpClient.post(environment.getApiUrl + '/fileUploads/', formData, { responseType: 'text' });
  }

  updateFileUpload(fileUpload: FileUpload): Observable<any> {
    return this.httpClient.put(environment.getApiUrl + '/fileUploads/', fileUpload, { responseType: 'text' });

  }

  deleteFileUpload(id: number) {
    return this.httpClient.request('delete', environment.getApiUrl + '/fileUploads/', { body: { id: id } });
  }


}