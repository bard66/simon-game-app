/**
 * Landscape Warning Component
 * 
 * Shows a full-screen overlay when device is in landscape orientation
 * on mobile phones only. Desktop users are not affected.
 * Design: Dark theme with Simon color accents
 */

export function LandscapeWarning() {
  return (
    <div className="landscape-warning">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="text-6xl animate-bounce">
          📱
        </div>
        <h2 className="text-2xl font-bold text-center px-4 text-text-primary">
          Please Rotate Your Device
        </h2>
        <p className="text-lg text-center px-6 text-text-secondary">
          Bar Says works best in portrait mode
        </p>
        <div className="text-4xl mt-4 text-simon-blue">
          🔄
        </div>
      </div>
      
      <style>{`
        /* Show warning only on landscape MOBILE devices (touch + small screen) */
        .landscape-warning {
          display: none;
        }
        
        /* Only show on touch devices in landscape with very small height (phones) */
        @media (orientation: landscape) and (max-height: 450px) and (hover: none) and (pointer: coarse) {
          .landscape-warning {
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--bg-primary);
            z-index: 9999;
            align-items: center;
            justify-content: center;
          }
          
          /* Hide main content when warning is shown */
          body > #root > * {
            display: none;
          }
          
          body > #root > .landscape-warning {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
}
