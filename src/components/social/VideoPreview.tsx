import { Helmet } from 'react-helmet';

interface VideoPreviewProps {
  videoUrl: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration?: string; // ISO 8601 duration format (e.g., "PT5M30S")
  uploadDate?: string; // ISO 8601 date
}

export function VideoPreview({
  videoUrl,
  title,
  description,
  thumbnailUrl,
  duration = "PT5M",
  uploadDate = new Date().toISOString()
}: VideoPreviewProps) {
  const baseUrl = window.location.origin;

  // Video structured data for rich results
  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": title,
    "description": description,
    "thumbnailUrl": thumbnailUrl,
    "uploadDate": uploadDate,
    "duration": duration,
    "contentUrl": videoUrl,
    "embedUrl": videoUrl
  };

  return (
    <>
      <Helmet>
        {/* Open Graph Video Tags */}
        <meta property="og:type" content="video.other" />
        <meta property="og:video" content={videoUrl} />
        <meta property="og:video:secure_url" content={videoUrl} />
        <meta property="og:video:type" content="video/mp4" />
        <meta property="og:video:width" content="1280" />
        <meta property="og:video:height" content="720" />
        
        {/* Twitter Video Card */}
        <meta name="twitter:card" content="player" />
        <meta name="twitter:player" content={videoUrl} />
        <meta name="twitter:player:width" content="1280" />
        <meta name="twitter:player:height" content="720" />
        
        {/* TikTok Embed Optimization */}
        <meta name="tiktok:card" content="player" />
        <meta name="tiktok:player" content={videoUrl} />
        
        {/* Pinterest Video Pin */}
        <meta property="og:video:tag" content="Polish Citizenship" />
        <meta property="og:video:tag" content="Legal Services" />
        
        {/* Video Schema */}
        <script type="application/ld+json">
          {JSON.stringify(videoSchema)}
        </script>
      </Helmet>

      <div 
        className="video-preview-wrapper" 
        itemScope 
        itemType="https://schema.org/VideoObject"
        data-video-preview
      >
        <meta itemProp="name" content={title} />
        <meta itemProp="description" content={description} />
        <meta itemProp="thumbnailUrl" content={thumbnailUrl} />
        <meta itemProp="uploadDate" content={uploadDate} />
        <meta itemProp="duration" content={duration} />
        <meta itemProp="contentUrl" content={videoUrl} />
      </div>
    </>
  );
}
