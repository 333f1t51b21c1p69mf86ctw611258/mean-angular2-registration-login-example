import { Component, OnInit } from '@angular/core';

import { User } from '../_models/index';
import { UserService } from '../_services/index';
import { DeviceService } from '../_services/index';

@Component({
    moduleId: module.id,
    templateUrl: 'home.component.html',
    providers: [UserService, DeviceService]
})

export class HomeComponent implements OnInit {
    currentUser: User;
    users: User[] = [];

    constructor(private userService: UserService, 
        private deviceService: DeviceService) {

        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }

    ngOnInit() {
        this.loadAllUsers();
    }

    deleteUser(_id: string) {
        this.userService.delete(_id).subscribe(() => { this.loadAllUsers() });
    }

    private loadAllUsers() {
        this.userService.getAll().subscribe((users) => { this.users = users; });
    }

    testRabbitmq() {
        this.deviceService.testRabbitmq("rabbitmq").subscribe((result) => {
            console.log(result);
        });
    }
}