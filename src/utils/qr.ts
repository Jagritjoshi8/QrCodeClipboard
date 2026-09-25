// Byte-mode capacity for a QR code at error-correction level L (single symbol,
// version 40) — the level this app always encodes with, since it holds the
// most data per module and keeps the code as physically scannable as possible.
export const QR_BYTE_CAPACITY: Record<'L' | 'M' | 'Q' | 'H', number> = {
  L: 2953,
  M: 2331,
  Q: 1663,
  H: 1273,
};

export function downloadUri(uri: string, filename: string) {
  const link = document.createElement('a');
  link.href = uri;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadSvgAsPng(svgElement: SVGSVGElement, filename: string, scale = 4) {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const image = new Image();
  image.onload = () => {
    const width = svgElement.viewBox.baseVal.width || svgElement.width.baseVal.value;
    const height = svgElement.viewBox.baseVal.height || svgElement.height.baseVal.value;

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      URL.revokeObjectURL(url);
      return;
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    downloadUri(canvas.toDataURL('image/png'), filename);
  };
  image.src = url;
}
