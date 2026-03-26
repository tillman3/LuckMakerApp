import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { verifyTicketPhoto } from '@/lib/ticket-verify';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, poolId, gameId, drawDate } = body;
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Validate base64 image
    const base64Match = image.match(/^data:image\/(jpeg|png|webp|jpg);base64,(.+)$/);
    if (!base64Match) {
      return NextResponse.json({ error: 'Invalid image format. Use JPEG, PNG, or WebP.' }, { status: 400 });
    }

    const ext = base64Match[1] === 'jpg' ? 'jpeg' : base64Match[1];
    const imageData = base64Match[2];
    const buffer = Buffer.from(imageData, 'base64');

    // Limit file size (5MB)
    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large. Max 5MB.' }, { status: 400 });
    }

    // AI verification
    const verification = await verifyTicketPhoto(image, gameId, drawDate);

    if (!verification.isValid) {
      return NextResponse.json({
        error: 'This doesn\'t appear to be a valid lottery ticket photo.',
        verification: {
          isValid: false,
          confidence: verification.confidence,
          issues: verification.issues,
          summary: verification.summary,
        },
      }, { status: 400 });
    }

    // Save to disk
    const filename = `${crypto.randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'tickets');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    const photoUrl = `/uploads/tickets/${filename}`;

    return NextResponse.json({
      success: true,
      photoUrl,
      verification: {
        isValid: verification.isValid,
        confidence: verification.confidence,
        extractedData: verification.extractedData,
        issues: verification.issues,
        summary: verification.summary,
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
