"use server";
// Code modified from (https://vercel.com/docs/vercel-blob/client-upload?package-manager=npm) official documentation for blob server storage to fit with file uploads
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

/// <summery>
/// POST route for handling file uploads.
/// It processes the request body, generates a token for the upload,
/// and returns a JSON response with the upload details.
/// </summery>
export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (
                pathname,
                // Client payload
            ) => {
                return {
                    allowedContentTypes: undefined,
                    addRandomSuffix: false,
                    tokenPayload: null,
                };
            },
            onUploadCompleted: async ({blob, tokenPayload}) => {
                console.log("Upload completed:", blob, tokenPayload);
            }
        });

        return NextResponse.json(jsonResponse);

            
    } catch (error) {
        
        return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // The webhook will retry 5 times waiting for a 200
    );
}
}