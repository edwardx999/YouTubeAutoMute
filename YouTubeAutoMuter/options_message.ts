export enum VarLabel {
    FIRST,
    AutoMute = FIRST,
    Prepause,
    AutoSkip,
    MAX
}

export type Storable = number | boolean | string | Date | Storable[];

export interface OptionsMessage {
    ["automuteVar"]: VarLabel;
    ["value"]: Storable;
}