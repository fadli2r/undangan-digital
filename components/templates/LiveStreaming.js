import React from 'react';

export default function LiveStreaming({ data }) {
  if (!data?.enabled || !data?.youtube_url) {
    return null;
  }

  // Extract video ID from YouTube URL
  const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeVideoId(data.youtube_url);
  if (!videoId) return null;

  return (
    <div className="max-w-4xl mx-auto my-8 px-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-red-500 to-red-600">
          <h2 className="text-xl font-semibold text-white text-center">
            Live Streaming
          </h2>
        </div>
        <div className="relative pb-[56.25%] h-0 overflow-hidden">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="Live Streaming"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="p-4 text-center">
          <a
            href={data.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Buka di YouTube
          </a>
        </div>
      </div>
    </div>
  );
}
