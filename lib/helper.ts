export function normalizeSymbol(sym: string) {
    return sym.includes('/') ? sym.replace('/', '') : sym;
}
