export interface DeviceInfo {
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isMobile: boolean;
  isDesktop: boolean;
}

export const detectDevice = (): DeviceInfo => {
  const ua = navigator.userAgent;
  const width = window.innerWidth;
  
  return {
    isIOS: /iPad|iPhone|iPod/.test(ua),
    isAndroid: /Android/.test(ua),
    isSafari: /Safari/.test(ua) && !/Chrome/.test(ua),
    isMobile: width < 768,
    isDesktop: width >= 768
  };
};
