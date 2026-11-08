import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CDN_MEDIA_BASE = "https://cdn.jsdelivr.net/gh/DuarteSantos8/openGym@main/catalogue/media";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ type: string; filename: string }> }
) {
    const { type, filename } = await context.params;

    // Sanitize type and filename to avoid path traversal
    const safeType = type === "clip" ? "clip" : "still";
    const safeFilename = path.basename(filename);

    const mediaDir = path.resolve(process.cwd(), "../workout-engine/catalogue/media", safeType);
    const filePath = path.join(mediaDir, safeFilename);

    // If local file does not exist (e.g. deployed to Vercel), redirect to ultra-fast jsDelivr CDN
    if (!fs.existsSync(filePath)) {
        return NextResponse.redirect(`${CDN_MEDIA_BASE}/${safeType}/${safeFilename}`, 307);
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    // Video Streaming with HTTP Range Support
    if (safeType === "clip") {
        const range = req.headers.get("range");

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = end - start + 1;

            const stream = fs.createReadStream(filePath, { start, end });
            // Convert Node ReadStream to Web ReadableStream
            const readable = new ReadableStream({
                start(controller) {
                    stream.on("data", (chunk) => controller.enqueue(chunk));
                    stream.on("end", () => controller.close());
                    stream.on("error", (err) => controller.error(err));
                },
            });

            return new NextResponse(readable as any, {
                status: 206,
                headers: {
                    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                    "Accept-Ranges": "bytes",
                    "Content-Length": chunksize.toString(),
                    "Content-Type": "video/mp4",
                    "Cache-Control": "public, max-age=31536000, immutable",
                },
            });
        }

        const stream = fs.createReadStream(filePath);
        const readable = new ReadableStream({
            start(controller) {
                stream.on("data", (chunk) => controller.enqueue(chunk));
                stream.on("end", () => controller.close());
                stream.on("error", (err) => controller.error(err));
            },
        });

        return new NextResponse(readable as any, {
            headers: {
                "Content-Length": fileSize.toString(),
                "Content-Type": "video/mp4",
                "Accept-Ranges": "bytes",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    }

    // Static Image Serving (.webp)
    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
        headers: {
            "Content-Type": "image/webp",
            "Content-Length": fileSize.toString(),
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    });
}
