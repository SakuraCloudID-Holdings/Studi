// api/unzip.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import JSZip from 'jszip';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Only POST is allowed' });
  }

  try {
    // Kumpulin raw body jadi Buffer
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk as Buffer);
    }
    const zipBuffer = Buffer.concat(chunks);

    if (!zipBuffer || zipBuffer.length === 0) {
      return res.status(400).json({ error: 'Empty body, send ZIP as request body' });
    }

    // Load ZIP di memory
    const zip = await JSZip.loadAsync(zipBuffer);

    // Ekstrak semua file (non-folder) jadi base64
    const files: Record<string, string> = {};

    await Promise.all(
      Object.keys(zip.files).map(async (fileName) => {
        const file = zip.files[fileName];
        if (file.dir) return; // skip folder
        const content = await file.async('nodebuffer');
        files[fileName] = content.toString('base64');
      })
    );

    return res.status(200).json({
      success: true,
      fileCount: Object.keys(files).length,
      files, // { "path/dalam.zip": "base64..." }
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: 'Failed to unzip file',
      detail: err?.message || 'Unknown error',
    });
  }
}
