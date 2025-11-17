/**
 * Skip to Content Link
 * Accessibility component for keyboard navigation
 * Allows users to skip repetitive navigation and go straight to main content
 */
export const SkipToContent = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      tabIndex={0}
    >
      Skip to main content
    </a>
  );
};
