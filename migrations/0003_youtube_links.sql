-- Add video_url column for YouTube links instead of Cloudflare Stream
ALTER TABLE lessons ADD COLUMN video_url TEXT;
