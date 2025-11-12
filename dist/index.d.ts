type Hotkey = KeyboardEvent["key"];
interface Options {
    adapter?: {
        open: (text: string) => void;
    };
    enabled?: boolean;
    hotkey?: Hotkey | Hotkey[];
    keyHoldDuration?: number;
    highlightColor?: string;
    labelTextColor?: string;
    showTagHint?: boolean;
    filter?: {
        ignoreSelectors?: string[];
        ignoreTags?: string[];
        skipCommonComponents?: boolean;
    };
}
declare const init: (options?: Options) => () => void;

export { type Hotkey, type Options, init };
