class MemoryCacheCommon {

    public cache;

    init() {
        this.cache = {};
    }

    set(key: string, value: any) {
        this.cache[key] = value;
    }

    get(key: string) {
        return this.cache[key];
    }

    getAll() {
        return this.cache;
    }

    has(key: string) {
        return this.cache[key] === undefined ? false : true;
    }

    remove(key: string) {
        delete this.cache[key];
        return true;
    }

}

const common = new MemoryCacheCommon();
export { common as MemoryCacheCommon };