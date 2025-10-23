export function getLocalStorage<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
        const data = localStorage.getItem(key);
        if (!data) return null;
        return JSON.parse(data) as T;
    } catch (err: unknown) {
        console.error('Error reading localStorage key:', key, err);
        return null;
    }
}

export function setLocalStorage<T>(key: string, data: T): boolean {
    if (typeof window === 'undefined') return false;
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (err: unknown) {
        console.error('Error setting localStorage key:', key, err);
        return false;
    }
}
