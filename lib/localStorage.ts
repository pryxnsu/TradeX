export function getLocalStorage<T>(key: string): T {
    const data = localStorage.getItem(key);
    if (!data) {
        throw new Error('Data not found');
    }
    return JSON.parse(data);
}

export function setLocalStorage<T>(key: string, data: T): boolean {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
}
