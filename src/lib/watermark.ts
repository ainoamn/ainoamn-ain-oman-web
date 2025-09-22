export async function applyWatermark(file: File, options?: { text?: string; opacity?: number; font?: string }) {
  const text = options?.text ?? "Ain Oman";
  const opacity = options?.opacity ?? 0.2;
  const font = options?.font ?? "bold 36px sans-serif";

  const imgUrl = URL.createObjectURL(file);
  const img = new Image();
  img.src = imgUrl;
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  ctx.globalAlpha = opacity;
  ctx.font = font;
  ctx.fillStyle = "#000";
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((-25 * Math.PI) / 180);

  const metrics = ctx.measureText(text);
  const step = metrics.width + 200;
  for (let y = -canvas.height; y < canvas.height; y += 220) {
    for (let x = -canvas.width; x < canvas.width; x += step) {
      ctx.fillText(text, x, y);
    }
  }

  return new Promise<File>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob!], file.name.replace(/\.(\w+)$/, "_wm.$1"), { type: file.type }));
      URL.revokeObjectURL(imgUrl);
    }, file.type, 0.92);
  });
}