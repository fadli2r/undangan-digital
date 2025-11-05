export default function Maps({ url }) {
  if (!url) return null;

  // Clean and validate the maps URL
  const getCleanUrl = (url) => {
    try {
      // If it's an iframe code, extract the src URL
      if (url.includes('<iframe')) {
        const srcMatch = url.match(/src=["'](.*?)["']/);
        if (srcMatch) return srcMatch[1];
      }

      // If it's a share link, convert to embed
      if (url.includes('google.com/maps')) {
        // Already an embed URL
        if (url.includes('google.com/maps/embed')) {
          return url;
        }

        // Share URL - extract location
        let location = '';
        
        if (url.includes('?q=')) {
          location = url.split('?q=')[1].split('&')[0];
        } else if (url.includes('/place/')) {
          location = url.split('/place/')[1].split('/')[0];
        } else if (url.includes('@')) {
          const parts = url.split('@')[1].split(',');
          if (parts.length >= 2) {
            location = `${parts[0]},${parts[1]}`;
          }
        }

        if (location) {
          return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15000!2d${location}!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2sid!4v1`;
        }
      }

      // Return original URL if we can't process it
      return url;
    } catch (error) {
      console.error('Error processing maps URL:', error);
      return url;
    }
  };

  // Get URL for direct navigation
  const getDirectUrl = (url) => {
    try {
      // If it's an iframe code or embed URL, convert to normal maps URL
      if (url.includes('<iframe') || url.includes('google.com/maps/embed')) {
        // Extract coordinates or location if possible
        const match = url.match(/!2d([\d.-]+)!3d([\d.-]+)/);
        if (match) {
          return `https://www.google.com/maps/@${match[2]},${match[1]},15z`;
        }
      }
      
      // Return original URL if it's already a direct maps URL
      if (url.includes('google.com/maps') && !url.includes('google.com/maps/embed')) {
        return url;
      }

      // Default to original URL
      return url;
    } catch (error) {
      console.error('Error processing direct URL:', error);
      return url;
    }
  };

  const embedUrl = getCleanUrl(url);
  const directUrl = getDirectUrl(url);

  return (
    <div className="space-y-4">
      {/* Maps Embed */}
      <div className="relative w-full h-[300px] rounded-lg overflow-hidden shadow-lg">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      {/* View in Maps Button */}
      <div className="text-center">
        <a
          href={directUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          Lihat di Google Maps
        </a>
      </div>
    </div>
  );
}
