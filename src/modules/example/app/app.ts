import { LightningElement } from 'lwc';

export default class HelloWorldApp extends LightningElement {
    whoIsGuest = 'not set';
    whoIsTheProxy = 'not set';

    connectedCallback(): void{
        const getGuest = async (): Promise<void> => {
            const { default: guestName } = await import('example/guest');
            this.whoIsGuest = guestName;
        };
        const getProxy = async (): Promise<void> => {
            const { default: guestName } = await import('example/guestProxy');
            this.whoIsTheProxy = guestName;
        };
        getGuest();
        getProxy();
    }
}
