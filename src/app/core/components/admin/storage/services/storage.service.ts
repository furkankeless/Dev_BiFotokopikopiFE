import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { StorageDto } from '../models/storageDto';
import { Storage } from '../models/storage';


@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private httpClient: HttpClient) { }


  getStorageList(): Observable<Storage[]> {

    return this.httpClient.get<Storage[]>(environment.getApiUrl + '/storages/getall')
  }
  getStorageDtoList(): Observable<StorageDto[]> {

    return this.httpClient.get<StorageDto[]>(environment.getApiUrl + '/Storages/getdtos')
  }

  getStorageById(id: number): Observable<Storage> {
    return this.httpClient.get<Storage>(environment.getApiUrl + '/storages/getbyid?id='+id)
  }

  addStorage(storage: Storage): Observable<any> {

    return this.httpClient.post(environment.getApiUrl + '/Storages', storage, { responseType: 'text' });
  }

  updateStorage(storage: Storage): Observable<any> {
    return this.httpClient.put(environment.getApiUrl + '/Storages', storage, { responseType: 'text' });

  }

  deleteStorage(id: number) {
    return this.httpClient.request('delete', environment.getApiUrl + '/storages/', { body: { id: id } });
  }


}