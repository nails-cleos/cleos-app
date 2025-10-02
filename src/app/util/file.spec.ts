import { formatBytes, getImage, dataURLToBlob, resizeImage } from './file';

describe('File Utils', () => {

  describe('formatBytes', () => {
    it('should return "0 Bytes" for 0', () => {
      expect(formatBytes(0, 2)).toBe('0 Bytes');
    });

    it('should format bytes correctly', () => {
      expect(formatBytes(1024, 0)).toBe('1 KB');
      expect(formatBytes(1048576, 2)).toBe('1 MB');
      expect(formatBytes(123456789, 2)).toBe('117.74 MB');
    });

    it('should default decimals to 2 if not provided', () => {
      expect(formatBytes(1500, 2)).toBe('1.46 KB');
    });
  });

  describe('dataURLToBlob', () => {
    it('should convert a data URL to a Blob', () => {
      const dataUrl = 'data:text/plain;base64,SGVsbG8gd29ybGQ=';
      const blob = dataURLToBlob(dataUrl);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('text/plain');

      // Convert back to string to verify content
      const reader = new FileReader();
      reader.readAsText(blob);
      reader.onload = () => {
        expect(reader.result).toBe('Hello world');
      };
    });
  });

  describe('getImage', () => {
    it('should call URL.createObjectURL with a blob', () => {
      const spy = spyOn(URL, 'createObjectURL').and.returnValue('blob://fake-url');
      const b64 = btoa('fake data');
      const result = getImage(b64, 'image/png');
      expect(spy).toHaveBeenCalled();
      expect(result).toBe('blob://fake-url');
    });
  });

  describe('resizeImage', () => {
    it('should resize an image using canvas and return a data URL', () => {
      const canvas = document.createElement('canvas');
      const img = document.createElement('img');
      img.width = 400;
      img.height = 200;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        spyOn(ctx, 'drawImage').and.callThrough();
      }
      spyOn(canvas, 'toDataURL').and.returnValue('data:image/jpeg;base64,fake');

      const result = resizeImage(img, canvas);
      expect(canvas.width).toBe(200);
      expect(canvas.height).toBe(100);
      expect(canvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.92);
      expect(result).toBe('data:image/jpeg;base64,fake');
    });

    it('should return empty string if no canvas is provided', () => {
      const img = document.createElement('img');
      expect(resizeImage(img)).toBe('');
    });
  });

});
