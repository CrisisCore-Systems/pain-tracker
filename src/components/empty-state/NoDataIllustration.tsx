/**
 * NoDataIllustration - SVG illustration for empty states
 */

export function NoDataIllustration() {
  return (
    <div className="flex justify-center">
      <svg
        width="200"
        height="160"
        viewBox="0 0 200 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-muted-foreground"
      >
        {/* Background elements */}
        <circle cx="100" cy="80" r="60" fill="currentColor" opacity="0.1" />

        {/* Chart bars */}
        <rect x="60" y="100" width="8" height="20" rx="4" fill="currentColor" opacity="0.3" />
        <rect x="72" y="90" width="8" height="30" rx="4" fill="currentColor" opacity="0.4" />
        <rect x="84" y="85" width="8" height="35" rx="4" fill="currentColor" opacity="0.5" />
        <rect x="96" y="95" width="8" height="25" rx="4" fill="currentColor" opacity="0.4" />
        <rect x="108" y="105" width="8" height="15" rx="4" fill="currentColor" opacity="0.3" />
        <rect x="120" y="80" width="8" height="40" rx="4" fill="currentColor" opacity="0.5" />
        <rect x="132" y="88" width="8" height="32" rx="4" fill="currentColor" opacity="0.4" />

        {/* Floating elements */}
        <circle cx="70" cy="50" r="3" fill="currentColor" opacity="0.3" />
        <circle cx="130" cy="45" r="2" fill="currentColor" opacity="0.4" />
        <circle cx="150" cy="65" r="2.5" fill="currentColor" opacity="0.3" />

        {/* Activity icon in center */}
        <g transform="translate(85, 65)">
          <path
            d="M2 12L7 7L13 13L22 2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.6"
          />
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3" />
        </g>

        {/* Decorative lines */}
        <line
          x1="40"
          y1="130"
          x2="160"
          y2="130"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.2"
        />
        <line
          x1="50"
          y1="135"
          x2="150"
          y2="135"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.1"
        />
      </svg>
    </div>
  );
}

export function TrackingIllustration() {
  return (
    <div className="flex justify-center">
      <svg
        width="200"
        height="160"
        viewBox="0 0 200 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        {/* Background circle */}
        <circle cx="100" cy="80" r="70" fill="currentColor" opacity="0.1" />

        {/* Calendar grid */}
        <rect
          x="70"
          y="50"
          width="60"
          height="45"
          rx="4"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.4"
        />

        {/* Calendar days */}
        {[0, 1, 2, 3, 4].map(row =>
          [0, 1, 2, 3, 4, 5].map(col => {
            // Use deterministic pattern instead of Math.random() to avoid collapse vectors
            const isHighlighted = (row + col) % 3 === 0 || (row === 2 && col === 3);
            return (
              <rect
                key={`${row}-${col}`}
                x={75 + col * 8}
                y={57 + row * 7}
                width="6"
                height="5"
                rx="1"
                fill="currentColor"
                opacity={isHighlighted ? 0.6 : 0.2}
              />
            );
          })
        )}

        {/* Heart/health icon */}
        <g transform="translate(85, 105)">
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            fill="currentColor"
            opacity="0.6"
          />
        </g>

        {/* Progress indicators */}
        <circle cx="45" cy="80" r="8" stroke="currentColor" strokeWidth="2" opacity="0.3" />
        <circle
          cx="45"
          cy="80"
          r="8"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="15,10"
          opacity="0.6"
          transform="rotate(-90 45 80)"
        />

        <circle cx="155" cy="80" r="8" stroke="currentColor" strokeWidth="2" opacity="0.3" />
        <circle
          cx="155"
          cy="80"
          r="8"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="20,5"
          opacity="0.6"
          transform="rotate(-90 155 80)"
        />
      </svg>
    </div>
  );
}
