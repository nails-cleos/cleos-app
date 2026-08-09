export const formatBytes = (bytes: any, decimals: number): string => {
  if (bytes === 0) {
    return '0 Bytes';
  }
  const k = 1024;
  const dm = decimals <= 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const getImage = (
  b64Data: string,
  contentType = '',
  sliceSize = 512,
): string => URL.createObjectURL(b64toBlob(b64Data, contentType, sliceSize));

export const dataURLToBlob = (dataUrl: string): Blob => {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1];
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
};

export const resizeImage = (
  img: HTMLImageElement,
  canvas?: HTMLCanvasElement,
): string => {
  if (!canvas) {
    console.error('No canvas element');
    return '';
  }
  const ctx = canvas.getContext('2d');
  const maxWidth = 200; // Desired width
  const maxHeight = 200; // Desired height

  let width = img.width;
  let height = img.height;

  if (width > height) {
    if (width > maxWidth) {
      height *= maxWidth / width;
      width = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      width *= maxHeight / height;
      height = maxHeight;
    }
  }

  canvas.width = width;
  canvas.height = height;
  ctx?.drawImage(img, 0, 0, width, height);

  // Convert canvas to JPEG
  return canvas.toDataURL('image/jpeg', 0.92); // 0.92 is the quality (92%)
};

const b64toBlob = (
  b64Data: string,
  contentType = '',
  sliceSize = 512,
): Blob => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
};
