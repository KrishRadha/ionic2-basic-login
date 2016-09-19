import {Injectable} from "@angular/core";
import {Actions, AppStore} from "angular2-redux";
import { ClientService } from '../services/client.service';

type Types = 'SELECT_CLIENT | REQUEST_CLIENTS | RECEIVE_CLIENTS | RESET_NEXT_OFFSET | UPDATE_CLIENT_STATE | APPLY_SELECTED_CLIENTS | APPLY_DESELECTED_CLIENTS';
export const SelectClientsActionTypes = {
    SELECT_CLIENT: 'SELECT_CLIENT' as Types,
    REQUEST_CLIENTS: 'REQUEST_CLIENTS' as Types,
    RECEIVE_CLIENTS: 'RECEIVE_CLIENTS' as Types,
    RESET_NEXT_OFFSET: 'RESET_NEXT_OFFSET' as Types,
    UPDATE_CLIENT_STATE: 'UPDATE_CLIENT_STATE' as Types,
    APPLY_SELECTED_CLIENTS: 'APPLY_SELECTED_CLIENTS' as Types,
    APPLY_DESELECTED_CLIENTS: 'APPLY_DESELECTED_CLIENTS' as Types
};

export interface SelectClientsAction {
    type:string;
    clientId?;
    total?;
    list?;
    nextOffset?;
    state?;
}

// export interface ContentActionsInterface {
//   type:string;
//
// }

@Injectable()
export class SelectClientsActions extends Actions {
    constructor(
        appStore: AppStore,
        private clientService: ClientService) {
            super(appStore);
    }

    updateClientState(clientId, state) {
        return {
            type: SelectClientsActionTypes.UPDATE_CLIENT_STATE,
            clientId: clientId,
            state: state
        }
    }
    applySelectedClients() {
        return {
            type: SelectClientsActionTypes.APPLY_SELECTED_CLIENTS
        }
    }
    applyDeselectedClients() {
        return {
            type: SelectClientsActionTypes.APPLY_DESELECTED_CLIENTS
        }
    }
    selectClient(clientId) {
        return {
            type: SelectClientsActionTypes.SELECT_CLIENT,
            clientId: clientId
        }
    }

    fetchClients( offset = 0) {
        return (dispatch) => {
            let path = '/?1=1' + (offset > 0 ? '&offset=' + offset : '');
            dispatch(this.requestClients());

            this.clientService.getClients(path)
                .map(data => this.setInitialValues(data))
                .map(data => {
                  dispatch(this.receiveClients(data));
                })
                .subscribe();

        };
    }

    requestClients() {
        return {type: SelectClientsActionTypes.REQUEST_CLIENTS};
    }

    receiveClients(data) {
        return {
            type: SelectClientsActionTypes.RECEIVE_CLIENTS,
            list: data.data,
            nextOffset: data.nextOffset,
            total: data.total
        }
    }

    resetNextOffset() {
        return {
            type: SelectClientsActionTypes.RESET_NEXT_OFFSET
        }
    }

    /**
     * add initial properties to data
     * @param data
     * @returns {any}
     */
    setInitialValues(data) {
        // add property 'state' (initially empty '') to all client items
        data = Object.assign({}, data, {data: data.data.map(client => {
            return Object.assign({}, client, {state: 'test'});
        })});

        return data;
    }
}