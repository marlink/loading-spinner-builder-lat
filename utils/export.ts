// This file relies on `html2canvas` and `gif.js` being loaded from a CDN.
declare const html2canvas: any;
declare const GIF: any;

export type ExportQuality = 'low' | 'medium' | 'high';

// FIX: Add a label to each quality setting for use in the UI.
export const qualityMap = {
    low: { res: 300, fps: 20, label: 'Low, 300px, 20fps' },
    medium: { res: 500, fps: 30, label: 'Medium, 500px, 30fps' },
    high: { res: 800, fps: 30, label: 'High, 800px, 30fps' },
};

interface GifExportOptions {
  backgroundColor: string | null;
  quality: ExportQuality;
}

const captureCanvas = async (element: HTMLElement, options: { backgroundColor: string | null; scale: number; }) => {
    return await html2canvas(element, options);
};

const downloadDataURL = (dataURL: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportPng = async (element: HTMLElement, fileName: string, options: { transparent: boolean; scale: number; }) => {
    const canvas = await captureCanvas(element, { backgroundColor: options.transparent ? null : '#ffffff', scale: options.scale });
    downloadDataURL(canvas.toDataURL('image/png'), fileName);
};

export const exportJpg = async (element: HTMLElement, fileName:string, options: { backgroundColor: string; scale: number; }) => {
    const canvas = await captureCanvas(element, { backgroundColor: options.backgroundColor, scale: options.scale });
    downloadDataURL(canvas.toDataURL('image/jpeg', 0.95), fileName);
};


export const exportSvg = (svgData: string, fileName: string) => {
  const blob = new Blob([svgData], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  downloadDataURL(url, fileName);
  URL.revokeObjectURL(url);
};

export const exportGif = (
  element: HTMLElement, 
  durationMs: number, 
  fileName: string, 
  onFinish: () => void, 
  options: GifExportOptions
) => {
  const gif = new GIF({
    workers: 2,
    quality: 10,
    workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js'
  });

  const qualitySettings = qualityMap[options.quality];
  const scale = qualitySettings.res / 250;
  const frameRate = qualitySettings.fps;
  const frameDelay = 1000 / frameRate;
  const totalFrames = Math.max(1, Math.floor(durationMs / frameDelay));
  let frameCount = 0;

  const captureFrame = async () => {
    if (frameCount >= totalFrames) {
      gif.render();
      return;
    }

    try {
        const canvas = await html2canvas(element, { 
          backgroundColor: options.backgroundColor,
          scale: scale
        });
        gif.addFrame(canvas, { copy: true, delay: frameDelay });
    } catch(e) {
        console.error("html2canvas failed:", e);
    }
    
    frameCount++;
    setTimeout(captureFrame, 0); 
  };

  gif.on('finished', (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    downloadDataURL(url, fileName);
    URL.revokeObjectURL(url);
    onFinish();
  });

  captureFrame();
};
