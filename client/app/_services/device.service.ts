import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

@Injectable()
export class DeviceService {
    constructor(private http: Http) { }

    testRabbitmq(name: string) {
        return this.http.get('/devices/testRabbitmq').map((response: Response) => response.json());
    }
}