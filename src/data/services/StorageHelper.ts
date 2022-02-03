
export class StorageHelper<T> {

    constructor(private key: string, private default_value: T = null) { }

    get(): T|null {
        const str = localStorage.getItem(this.key);

        return str ? JSON.parse(str) : this.default_value;
    }

    set(value: T|null) {
        if(value) {
            localStorage.setItem(this.key, JSON.stringify(value));
        } else {
            localStorage.removeItem(this.key);
        }
    }

    mutate(mapper: (x:T|null)=>T|null) {
        this.set(mapper(this.get()));
    }

};


