export interface ScormPlayerSettings {
  allowFastForward: boolean;
  allowRewind: boolean;
  allowSeek: boolean;
  allowKeyboardShortcuts: boolean;
  showProgressBar: boolean;
  allowVolumeControl: boolean;
  enableOverlayBlocking: boolean;
  requireFullCompletion: boolean;
  showCustomControlBar: boolean;
}

export const defaultScormSettings: ScormPlayerSettings = {
  allowFastForward: false,
  allowRewind: true,
  allowSeek: false,
  allowKeyboardShortcuts: false,
  showProgressBar: true,
  allowVolumeControl: true,
  enableOverlayBlocking: true,
  requireFullCompletion: true,
  showCustomControlBar: false,
};