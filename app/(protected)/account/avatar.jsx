'use client'

// Code modified from https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

/// <summary>
/// Avatar component that allows users to upload and display their profile picture.
/// </summary>
export default function Avatar({ uid, url, size, onUpload }) {
  const supabase = createClient()
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (url) {
      // Check if the URL is already a full HTTP URL.
      // If so, use it directly. Otherwise, get the public URL.
      if (url.startsWith('http')) {
        setAvatarUrl(url)
      } else {
        const { data } = supabase.storage.from('avatars').getPublicUrl(url)
        setAvatarUrl(data.publicUrl)
      }
    }
  }, [url, supabase])

  const uploadAvatar = async (event) => {
    try {
      setUploading(true)
      if (!event.target.files || event.target.files.length === 0) {
        toast.error('You must select an image to upload.');
        return;
      }
      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${uid}-${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)
      if (uploadError) {
        throw uploadError
      }
      // onUpload passes the file path to the parent component to save in the database.
      onUpload(filePath)
    } catch (error) {
      toast.error('Error uploading avatar!')
      console.error('Error uploading avatar: ', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {avatarUrl ? (
        <Image
          width={size}
          height={size}
          src={avatarUrl}
          alt="Avatar"
          className="avatar image rounded-full object-cover"
          style={{ height: size, width: size }}
        />
      ) : (
        <Skeleton
          className="avatar no-image rounded-full"
          style={{ height: size, width: size }}
        />
      )}
      <div style={{ width: size }}>
        <Label
          className="button primary block text-center cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
          htmlFor="single"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Label>
        <Input
          style={{
            visibility: 'hidden',
            position: 'absolute',
          }}
          type="file"
          id="single"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </div>
    </div>
  )
}