export default function SymbolSelector({ onSelect }: { onSelect: (s: string) => void }) {
    const symbols = ['XAUUSD', 'EURUSD', 'GBPUSD', 'BTCUSD'];
    return (
        <div className="flex gap-2 p-2">
            {symbols.map(s => (
                <button
                    key={s}
                    onClick={() => onSelect(s)}
                    className="rounded bg-neutral-800 px-3 py-1 text-white hover:bg-neutral-600"
                >
                    {s}
                </button>
            ))}
        </div>
    );
}
