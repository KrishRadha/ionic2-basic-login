import { Component } from '@angular/core';
import { Platform, NavParams, ViewController } from 'ionic-angular';
import { TruncatePipe } from '../pipes/truncate';
import { AppStore } from 'angular2-redux';
import { selectedClientsListSelector, appliedClientsListSelector } from '../reducers/select-clients.reducer';
import { SelectClientsActions }from '../actions/select-clients.actions';

@Component({
    template: `
<ion-header>
    <ion-toolbar>
        <ion-title>Select clients</ion-title>
        <ion-buttons start>
            <button (click)="dismiss()">
                <span primary showWhen="ios">Cancel</span>
                <ion-icon name="md-close" showWhen="android,windows"></ion-icon>
            </button>
        </ion-buttons>
    </ion-toolbar>
</ion-header>
<ion-segment [(ngModel)]="segmentView" class="ion-segment-outside">
    <ion-segment-button value="all">
        All clients
    </ion-segment-button>
    <ion-segment-button value="applied">
        Selected clients
    </ion-segment-button>
</ion-segment>
<div class="client-select-toolbar">
    <button (click)="deselectAll()">Deselect all</button>
</div>
<ion-content class="client-select-modal">
    <div [ngSwitch]="segmentView" class="client-select-modal-list">
        <div *ngSwitchCase="'all'">
            <ion-list>
                <ion-item *ngFor="let client of allClients$ | async" (click)="updateClientStatus(client)" [ngClass]="setClasses(client)">
                    <h2><span class="client-id">{{client.id}}</span><span class="client-title">{{client.clientName | truncate : 10}}($ID{{client.currencyId}})</span></h2>
                </ion-item>
            </ion-list>
        </div>
        <div *ngSwitchCase="'applied'">
            <ion-list>
                <ion-item *ngFor="let client of appliedClients$ | async" (click)="updateClientStatus(client)" [ngClass]="setClasses(client)">
                    <h2><span class="client-id">{{client.id}}</span><span class="client-title">{{client.clientName}}</span></h2>
                </ion-item>  
            </ion-list>
        </div>
    </div>
</ion-content>
<div class="modal-button-bottom">
    <button secondary (click)="applySelect()">Apply</button>
</div>
`,
    pipes:[TruncatePipe]
})
export class ClientSelectModalComponent {
    private allClients$;
    private appliedClients$;

    public segmentView:string = 'all';
    public test = true;

    constructor(public platform:Platform,
                public params:NavParams,
                public viewCtrl:ViewController,
                private _appStore:AppStore,
                private _clientActions:SelectClientsActions) {
        this.allClients$ = _appStore.select(selectedClientsListSelector);
        this.appliedClients$ = _appStore.select(appliedClientsListSelector);
        _appStore.select(selectedClientsListSelector).subscribe((data) => console.log("all", data));
        _appStore.select(appliedClientsListSelector).subscribe((data) => console.log("applied", data));
    }

    ionViewWillEnter() {
        this._appStore.dispatch(this._clientActions.fetchClients());
    }

    setClasses(item) {
        let classes = {
            'depth-level-0': item.depth == 0,
            'depth-level-1': item.depth == 1,
            'depth-level-2': item.depth == 2,
            'state-selected': item.state == 'selected',
            'state-deselected': item.state == 'deselected',
            'state-applied': item.state == 'applied'
        };
        return classes;
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }

    updateClientStatus(client) {
        var newClientState = '';
        if(this.segmentView === 'all') {
            newClientState = client.state !== 'selected' ? 'selected' : '';
        } else {
            newClientState = client.state !== 'applied' ? 'applied' : 'deselected';
        }

        this._appStore.dispatch(this._clientActions.updateClientState(client.id, newClientState));
    }

    applySelect() {
        if(this.segmentView === 'all') {
            this._appStore.dispatch((this._clientActions.applySelectedClients()));
            console.log('apply select: ' + this.segmentView);
        } else {
            this._appStore.dispatch((this._clientActions.applyDeselectedClients()));
            console.log('apply deselect: ' + this.segmentView);
        }

    }
}