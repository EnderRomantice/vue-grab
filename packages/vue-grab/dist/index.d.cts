type Hotkey = KeyboardEvent['key'];
interface Options {
    adapter?: {
        open: (text: string) => void;
    };
    enabled?: boolean;
    hotkey?: Hotkey | Hotkey[];
    keyHoldDuration?: number;
    agent?: {
        type: 'claude' | 'opencode';
        endpoint?: string;
        provider?: string;
        model?: string;
        apiKey?: string;
    };
    highlightColor?: string;
    labelTextColor?: string;
    showTagHint?: boolean;
    includeLocatorTag?: boolean;
    filter?: {
        ignoreSelectors?: string[];
        ignoreTags?: string[];
        skipCommonComponents?: boolean;
    };
}
declare const init: (options?: Options) => () => void;

export { type Hotkey, type Options, init };
