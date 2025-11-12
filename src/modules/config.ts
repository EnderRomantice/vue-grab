export type HighlightConfig = {
  color?: string; // main accent color for border/label background
  labelTextColor?: string; // text color inside label
  boxShadow?: string; // optional custom shadow
};

export type FilterConfig = {
  ignoreSelectors?: string[];
  ignoreTags?: string[];
  skipCommonComponents?: boolean;
};

export type RuntimeConfig = {
  highlight: HighlightConfig;
  filter: FilterConfig;
  showTagHint: boolean;
};

const DEFAULT_COLOR = "#77E1D5";
const DEFAULT_LABEL_TEXT = "#222";
const DEFAULT_BOX_SHADOW = "0 0 0 1px rgba(143, 253, 218, 0.3), 0 0 0 6px rgba(119,225,213,0.1)";

let runtimeConfig: RuntimeConfig = {
  highlight: {
    color: DEFAULT_COLOR,
    labelTextColor: DEFAULT_LABEL_TEXT,
    boxShadow: DEFAULT_BOX_SHADOW,
  },
  filter: {
    ignoreSelectors: [],
    ignoreTags: [],
    skipCommonComponents: false,
  },
  showTagHint: true,
};

export const getConfig = () => runtimeConfig;

export const updateConfig = (partial: Partial<RuntimeConfig>) => {
  runtimeConfig = {
    ...runtimeConfig,
    ...partial,
    highlight: { ...runtimeConfig.highlight, ...(partial.highlight ?? {}) },
    filter: { ...runtimeConfig.filter, ...(partial.filter ?? {}) },
  };
};

export const DEFAULTS = {
  DEFAULT_COLOR,
  DEFAULT_LABEL_TEXT,
  DEFAULT_BOX_SHADOW,
};


