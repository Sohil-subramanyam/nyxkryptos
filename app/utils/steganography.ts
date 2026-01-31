// Delimiter to mark end of message
const END_MARKER = "||END||";

const stringToBinary = (str: string): string => {
  return str.split('').map(char => {
    return char.charCodeAt(0).toString(2).padStart(8, '0');
  }).join('');
};

const binaryToString = (binary: string): string => {
  const bytes = binary.match(/.{1,8}/g) || [];
  return bytes.map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
};

export const embedDataInImage = async (
  base64Image: string, 
  data: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject("Could not get canvas context");
        return;
      }
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      // Prepare payload
      const fullMessage = data + END_MARKER;
      const binaryMessage = stringToBinary(fullMessage);
      
      if (binaryMessage.length > pixels.length / 4) {
        reject("Data too large for this image.");
        return;
      }

      // Modify LSBs
      for (let i = 0; i < binaryMessage.length; i++) {
        // We target the R, G, B channels (indices 0, 1, 2, 4, 5, 6...)
        // Skipping Alpha (3, 7, 11...) to prevent visual artifacts or transparency issues
        let pixelIndex = Math.floor(i / 3) * 4 + (i % 3);
        
        const bit = parseInt(binaryMessage[i], 10);
        // Clear LSB and set new bit
        pixels[pixelIndex] = (pixels[pixelIndex] & 0xFE) | bit;
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject("Failed to load image");
    img.src = base64Image;
  });
};

export const extractDataFromImage = async (file: File): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject("No context");
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        let binaryData = "";
        let extractedString = "";
        
        // We need to read enough to find the marker. 
        // We'll read in chunks or until end of pixels.
        // Optimization: Check for marker every 8 bits (1 char)
        
        for (let i = 0; i < pixels.length; i++) {
           // Skip Alpha channel
           if ((i + 1) % 4 === 0) continue;

           const bit = pixels[i] & 1;
           binaryData += bit;
        }
        
        // Convert full binary to string (this is computationally heavy for 4k images, 
        // in prod use a streaming decoder or stop when null char found)
        // For this demo, we'll try to decode the first X bytes or search.
        
        // Heuristic: The message is at the beginning. 
        // Let's decode the first 10000 characters (80000 bits) which is plenty for a key share.
        const maxBits = 80000; 
        const bitsToRead = Math.min(binaryData.length, maxBits);
        
        const chunk = binaryData.substring(0, bitsToRead);
        extractedString = binaryToString(chunk);

        if (extractedString.includes(END_MARKER)) {
          resolve(extractedString.split(END_MARKER)[0]);
        } else {
          resolve(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};