import React from 'react';

// Static background stars with deterministic properties
const STATIC_STARS = [
  { angle: 292, duration: 16, delay: 1, alpha: 0.85, size: 3.5, distance: 38 },
  { angle: 79, duration: 20, delay: 6, alpha: 0.75, size: 4, distance: 48 },
  { angle: 147, duration: 13, delay: 3, alpha: 0.95, size: 2.8, distance: 68 },
  { angle: 57, duration: 17, delay: 4, alpha: 0.8, size: 4.5, distance: 52 },
  { angle: 12, duration: 15, delay: 2, alpha: 0.9, size: 3.2, distance: 30 },
];

// Ring stars rotating in 3D orbit around the button
const RING_STARS = [
  { angle: 130, duration: 17, delay: 7, alpha: 0.65, size: 4.5, distance: 82 },
  { angle: 348, duration: 19, delay: 4, alpha: 0.8, size: 4, distance: 105 },
  { angle: 13, duration: 13, delay: 8, alpha: 0.9, size: 3.5, distance: 58 },
  { angle: 250, duration: 10, delay: 9, alpha: 0.95, size: 2.8, distance: 38 },
  { angle: 189, duration: 16, delay: 8, alpha: 0.9, size: 3.8, distance: 110 },
  { angle: 59, duration: 20, delay: 4, alpha: 0.65, size: 3.5, distance: 92 },
  { angle: 302, duration: 14, delay: 2, alpha: 0.85, size: 4.2, distance: 74 },
  { angle: 95, duration: 18, delay: 6, alpha: 0.7, size: 3, distance: 98 },
  { angle: 211, duration: 12, delay: 1, alpha: 0.9, size: 3.8, distance: 52 },
  { angle: 333, duration: 21, delay: 5, alpha: 0.65, size: 4.2, distance: 120 },
  { angle: 167, duration: 15, delay: 3, alpha: 0.85, size: 3, distance: 68 },
  { angle: 24, duration: 19, delay: 7, alpha: 0.75, size: 4.5, distance: 86 },
  { angle: 75, duration: 15, delay: 5, alpha: 0.8, size: 3.2, distance: 78 },
  { angle: 220, duration: 18, delay: 2, alpha: 0.75, size: 4, distance: 95 },
  { angle: 285, duration: 12, delay: 6, alpha: 0.9, size: 2.8, distance: 46 },
  { angle: 160, duration: 22, delay: 8, alpha: 0.6, size: 3.5, distance: 102 },
  { angle: 40, duration: 14, delay: 3, alpha: 0.85, size: 4, distance: 64 },
  { angle: 310, duration: 16, delay: 9, alpha: 0.7, size: 3.2, distance: 115 },
  { angle: 115, duration: 19, delay: 1, alpha: 0.8, size: 2.8, distance: 70 },
  { angle: 195, duration: 13, delay: 4, alpha: 0.92, size: 3.5, distance: 84 },
];

/**
 * GalaxyButton
 * A transparent, starry cosmic button with 3D orbiting stars,
 * bottom-right crescent nebula glow, and a spinning rim spark.
 */
const GalaxyButton = ({
  children = 'Transaction',
  onClick,
  className = '',
  id = 'nav-transaction-btn',
  type = 'button',
  title,
  style = {},
  href,
  target,
  rel,
  icon,
  shape = 'pill',
  variant = 'purple',
  ...props
}) => {
  const handleClick = (e) => {
    if (onClick) onClick(e);
  };

  const Component = href ? 'a' : 'button';
  const componentProps = href
    ? {
        href,
        target: target || '_blank',
        rel: rel || 'noopener noreferrer',
        id,
        title,
        onClick: handleClick,
        ...props,
      }
    : {
        type,
        id,
        onClick: handleClick,
        title,
        ...props,
      };

  const shapeClass = shape === 'square' ? 'is-square' : '';
  const variantClass = `theme-${variant}`;

  return (
    <div
      className={`galaxy-button ${shapeClass} ${variantClass} ${className}`.trim()}
      style={style}
    >
      <Component {...componentProps}>
        <span className="spark" aria-hidden="true" />
        <span className="backdrop" aria-hidden="true" />
        
        {/* Ambient static stars inside the button container */}
        <span className="galaxy__container" aria-hidden="true">
          {STATIC_STARS.map((s, i) => (
            <span
              key={`static-${i}`}
              className="star star--static"
              style={{
                '--angle': `${s.angle}deg`,
                '--duration': `${s.duration}s`,
                '--delay': `${s.delay}s`,
                '--alpha': s.alpha,
                '--size': `${s.size}px`,
                '--distance': `${s.distance}px`,
              }}
            />
          ))}
        </span>

        {/* 3D-tilted galaxy ring with orbiting stars */}
        <span className="galaxy" aria-hidden="true">
          <span className="galaxy__ring">
            {RING_STARS.map((s, i) => (
              <span
                key={`ring-${i}`}
                className="star"
                style={{
                  '--angle': `${s.angle}deg`,
                  '--duration': `${s.duration}s`,
                  '--delay': `${s.delay}s`,
                  '--alpha': s.alpha,
                  '--size': `${s.size}px`,
                  '--distance': `${s.distance}px`,
                }}
              />
            ))}
          </span>
        </span>

        {/* Button label */}
        <span className="text">
          {icon && (
            <span
              className="galaxy-btn-icon"
              style={{ display: 'inline-flex', alignItems: 'center', marginRight: '6px' }}
            >
              {icon}
            </span>
          )}
          {children}
        </span>
      </Component>

      {/* Ambient diffuse cosmic glow behind the button */}
      <div className="bodydrop" aria-hidden="true" />
    </div>
  );
};

export default GalaxyButton;
