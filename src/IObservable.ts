interface IObservable
{
    subscribe(observer: IObserver) : void;

    unsubscribe(observer: IObserver) : void;

    notify() : void;
}