/**
 * Validates whether a file is intact and can be properly parsed/opened.
 * Catches damaged xref tables, corrupted PDF objects, or truncated payloads
 * before uploading to the server.
 */
export async function validateFileIntegrity(file: File): Promise<{ valid: boolean; error?: string }> {
  const name = file.name.toLowerCase();
  const ext = name.substring(name.lastIndexOf("."));

  // Check PDF files
  if (ext === ".pdf" || file.type === "application/pdf") {
    return validatePdfIntegrity(file);
  }

  // Check image files (png, jpg, jpeg)
  if ([".png", ".jpg", ".jpeg"].includes(ext) || file.type.startsWith("image/")) {
    return validateImageIntegrity(file);
  }

  // Check Word documents (.docx)
  if (ext === ".docx") {
    return validateDocxIntegrity(file);
  }

  return { valid: true };
}

async function validatePdfIntegrity(file: File): Promise<{ valid: boolean; error?: string }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return {
        valid: false,
        error: `"${file.name}" is completely empty (0 bytes) and cannot be uploaded.`,
      };
    }

    // Dynamic import so pdf-lib is loaded on-demand
    const { PDFDocument } = await import("pdf-lib");
    
    // Temporarily silence pdf-lib warnings during corrupt parsing
    const origWarn = console.warn;
    console.warn = () => {};

    let doc;
    try {
      doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    } finally {
      console.warn = origWarn;
    }

    const pageCount = doc.getPageCount();
    if (pageCount < 1) {
      return {
        valid: false,
        error: `"${file.name}" appears to be empty or contains no readable pages.`,
      };
    }

    return { valid: true };
  } catch (err: any) {
    return {
      valid: false,
      error: `"${file.name}" is corrupted or unreadable. Please check the file and try uploading again.`,
    };
  }
}

async function validateImageIntegrity(file: File): Promise<{ valid: boolean; error?: string }> {
  if (typeof window === "undefined") return { valid: true };
  if (file.size === 0) {
    return {
      valid: false,
      error: `"${file.name}" is completely empty (0 bytes) and cannot be uploaded.`,
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        resolve({
          valid: false,
          error: `"${file.name}" is corrupted and has invalid image dimensions.`,
        });
      } else {
        resolve({ valid: true });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        valid: false,
        error: `"${file.name}" is corrupted or is not a valid image. Please select a valid file.`,
      });
    };

    img.src = objectUrl;
  });
}

async function validateDocxIntegrity(file: File): Promise<{ valid: boolean; error?: string }> {
  try {
    // DOCX files are standard zip archives and start with the PK header bytes: 0x50, 0x4B, 0x03, 0x04
    if (file.size < 4) {
      return {
        valid: false,
        error: `"${file.name}" is corrupted or incomplete.`,
      };
    }
    const headerSlice = await file.slice(0, 4).arrayBuffer();
    const bytes = new Uint8Array(headerSlice);
    const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
    if (!isZip) {
      return {
        valid: false,
        error: `"${file.name}" is corrupted or not a valid Word (.docx) document.`,
      };
    }
    return { valid: true };
  } catch {
    return { valid: true };
  }
}
