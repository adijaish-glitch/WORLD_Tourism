import React from 'react';

/**
 * Universal TIMS Loading Animation
 * Powered by LK Jing's LottieFiles Loading Animation
 * Asset source: /loading.lottie / /loading.json
 */
export default function LoadingAnimation({
  size = 120,
  message = 'Loading experiences...',
  subtext = null,
  fullPage = false,
  style = {}
}) {
  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        textAlign: 'center',
        ...style
      }}
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        <dotlottie-player
          src="/loading.lottie"
          background="transparent"
          speed="1"
          style={{ width: `${size}px`, height: `${size}px` }}
          loop
          autoplay
        />
      </div>

      {message && (
        <h3
          style={{
            margin: '0.75rem 0 0.25rem 0',
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#1e293b'
          }}
        >
          {message}
        </h3>
      )}

      {subtext && (
        <p
          style={{
            margin: 0,
            fontSize: '0.85rem',
            color: '#64748b',
            maxWidth: '360px',
            lineHeight: 1.4
          }}
        >
          {subtext}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%'
        }}
      >
        {content}
      </div>
    );
  }

  return content;
}

