import Instrument from './Instrument';

export default function FavoriteInstruments() {
    return (
        <div className="flex w-full gap-3">
            <Instrument symbol="AAPL" iconSize={32} />
            <Instrument symbol="BTC" iconSize={32} />
            <Instrument symbol="EUR/USD" iconSize={32} />
        </div>
    );
}
