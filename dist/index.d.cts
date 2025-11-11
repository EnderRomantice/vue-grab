type Hotkey = KeyboardEvent["key"];
interface Options {
    adapter?: {
        open: (text: string) => void;
    };
    enabled?: boolean;
    hotkey?: Hotkey | Hotkey[];
    keyHoldDuration?: number;
}
declare const init: (options?: Options) => () => void;

export { type Hotkey, type Options, init };
