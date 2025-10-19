declare module 'jspdf' {
  const jsPDF: any;
  export default jsPDF;
}

declare module 'html2canvas' {
  const html2canvas: any;
  export default html2canvas;
}

// Minimal canvas types used by server-side image helpers (node-canvas)
declare module 'canvas' {
  export function createCanvas(width: number, height: number): any;
  export function loadImage(src: any): Promise<any>;
}
