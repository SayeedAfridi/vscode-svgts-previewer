export type ISettings = { showBoundingBox: boolean, showTransparencyGrid: boolean };
export type ISource = { uri: string, data: string, settings: ISettings, svg?: string };
export type IBackground = 'dark' | 'light';

export interface IState {
  source: ISource;
  scale: number;
  background: IBackground;
  sourceImageValidity: boolean;
}
