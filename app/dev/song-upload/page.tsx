'use client';

// Code modified from (https://vercel.com/docs/vercel-blob/client-upload?package-manager=npm) official documentation for blob server storage to fit with file uploads

import { type PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';
import { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SongUploadPage() {
    const inputFileRef = useRef<HTMLInputElement>(null);
    const [blob, setBlob] = useState<PutBlobResult | null>(null);
    return (
        <>
            <h1>Upload a song</h1>
            <form onSubmit={async (e) => {
                e.preventDefault();
                if (!inputFileRef.current?.files)
                {
                    throw new Error('No file selected');
                }
                const file = inputFileRef.current.files[0];

                const newBlob = await upload(file.name, file, {
                    access: 'public',
                    handleUploadUrl: "/api/song/upload",
                });

                setBlob(newBlob);
            }}>
                <Label htmlFor='file'>File</Label>
                <Input type='file' ref={inputFileRef} name="file" required />
                <Button type='submit' className='mt-2'>Upload</Button>
            </form>

            {blob && (
                <div>
                    Blob Url: <a href={blob.url} target="_blank" rel="noopener noreferrer">{blob.url}</a>
                </div>
            )}
        </>
    )
}