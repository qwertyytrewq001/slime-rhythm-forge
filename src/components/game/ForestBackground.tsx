import type { FC } from 'react';

interface ForestBackgroundProps {
  /**
   * Kept for API compatibility with previous implementation.
   * The new background image is not tinted per element.
   */
  elementTint?: string;
  /**
   * Scroll offset from the main content area, used for subtle parallax.
   */
  parallaxOffset?: number;
}

export const ForestBackground: FC<ForestBackgroundProps> = ({ parallaxOffset = 0 }) => {
  const parallaxY = -(parallaxOffset * 0.2);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        // Uses your uploaded public asset.
        backgroundImage: "url('/Gemini_Generated_Image_hea39dhea39dhea3.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transform: `translateY(${parallaxY}px)`,
      }}
    />
  );
};

