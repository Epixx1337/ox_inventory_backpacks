import React, { useEffect, useState } from 'react';

const BODY_PART_NAMES: Record<string, string> = {
  HEAD: 'Head',
  NECK: 'Neck',
  SPINE: 'Spine',
  UPPER_BODY: 'Chest',
  LARM: 'Left Arm',
  LHAND: 'Left Hand',
  LFINGER: 'Left Fingers',
  RARM: 'Right Arm',
  RHAND: 'Right Hand',
  RFINGER: 'Right Fingers',
  LLEG: 'Left Leg',
  LFOOT: 'Left Foot',
  RLEG: 'Right Leg',
  RFOOT: 'Right Foot',
};

const INJURY_OUTLINE_COLORS: Record<number, string> = {
  0: 'rgba(74, 222, 128, 0.9)',
  1: 'rgba(250, 204, 21, 1)',
  2: 'rgba(251, 146, 60, 1)',
  3: 'rgba(239, 68, 68, 1)',
  4: 'rgba(185, 28, 28, 1)',
};

const PATH_DATA =
  'M104.265,117.959c-0.304,3.58,2.126,22.529,3.38,29.959c0.597,3.52,2.234,9.255,1.645,12.3 c-0.841,4.244-1.084,9.736-0.621,12.934c0.292,1.942,1.211,10.899-0.104,14.175c-0.688,1.718-1.949,10.522-1.949,10.522 c-3.285,8.294-1.431,7.886-1.431,7.886c1.017,1.248,2.759,0.098,2.759,0.098c1.327,0.846,2.246-0.201,2.246-0.201 c1.139,0.943,2.467-0.116,2.467-0.116c1.431,0.743,2.758-0.627,2.758-0.627c0.822,0.414,1.023-0.109,1.023-0.109 c2.466-0.158-1.376-8.05-1.376-8.05c-0.92-7.088,0.913-11.033,0.913-11.033c6.004-17.805,6.309-22.53,3.909-29.24 c-0.676-1.937-0.847-2.704-0.536-3.545c0.719-1.941,0.195-9.748,1.072-12.848c1.692-5.979,3.361-21.142,4.231-28.217 c1.169-9.53-4.141-22.308-4.141-22.308c-1.163-5.2,0.542-23.727,0.542-23.727c2.381,3.705,2.29,10.245,2.29,10.245 c-0.378,6.859,5.541,17.342,5.541,17.342c2.844,4.332,3.921,8.442,3.921,8.747c0,1.248-0.273,4.269-0.273,4.269l0.109,2.631 c0.049,0.67,0.426,2.977,0.365,4.092c-0.444,6.862,0.646,5.571,0.646,5.571c0.92,0,1.931-5.522,1.931-5.522 c0,1.424-0.348,5.687,0.42,7.295c0.919,1.918,1.595-0.329,1.607-0.78c0.243-8.737,0.768-6.448,0.768-6.448 c0.511,7.088,1.139,8.689,2.265,8.135c0.853-0.407,0.073-8.506,0.073-8.506c1.461,4.811,2.569,5.577,2.569,5.577 c2.411,1.693,0.92-2.983,0.585-3.909c-1.784-4.92-1.839-6.625-1.839-6.625c2.229,4.421,3.909,4.257,3.909,4.257 c2.174-0.694-1.9-6.954-4.287-9.953c-1.218-1.528-2.789-3.574-3.245-4.789c-0.743-2.058-1.304-8.674-1.304-8.674 c-0.225-7.807-2.155-11.198-2.155-11.198c-3.3-5.282-3.921-15.135-3.921-15.135l-0.146-16.635 c-1.157-11.347-9.518-11.429-9.518-11.429c-8.451-1.258-9.627-3.988-9.627-3.988c-1.79-2.576-0.767-7.514-0.767-7.514 c1.485-1.208,2.058-4.415,2.058-4.415c2.466-1.891,2.345-4.658,1.206-4.628c-0.914,0.024-0.707-0.733-0.707-0.733 C115.068,0.636,104.01,0,104.01,0h-1.688c0,0-11.063,0.636-9.523,13.089c0,0,0.207,0.758-0.715,0.733 c-1.136-0.03-1.242,2.737,1.215,4.628c0,0,0.572,3.206,2.058,4.415c0,0,1.023,4.938-0.767,7.514c0,0-1.172,2.73-9.627,3.988 c0,0-8.375,0.082-9.514,11.429l-0.158,16.635c0,0-0.609,9.853-3.922,15.135c0,0-1.921,3.392-2.143,11.198 c0,0-0.563,6.616-1.303,8.674c-0.451,1.209-2.021,3.255-3.249,4.789c-2.408,2.993-6.455,9.24-4.29,9.953 c0,0,1.689,0.164,3.909-4.257c0,0-0.046,1.693-1.827,6.625c-0.35,0.914-1.839,5.59,0.573,3.909c0,0,1.117-0.767,2.569-5.577c0,0-0.779,8.099,0.088,8.506c1.133,0.555,1.751-1.047,2.262-8.135c0,0,0.524-2.289,0.767,6.448 c0.012,0.451,0.673,2.698,1.596,0.78c0.779-1.608,0.429-5.864,0.429-7.295c0,0,0.999,5.522,1.933,5.522 c0,0,1.099,1.291,0.648-5.571c-0.073-1.121,0.32-3.422,0.369-4.092l0.106-2.631c0,0-0.274-3.014-0.274-4.269 c0-0.311,1.078-4.415,3.921-8.747c0,0,5.913-10.488,5.532-17.342c0,0-0.082-6.54,2.299-10.245c0,0,1.69,18.526,0.545,23.727 c0,0-5.319,12.778-4.146,22.308c0.864,7.094,2.53,22.237,4.226,28.217c0.886,3.094,0.362,10.899,1.072,12.848 c0.32,0.847,0.152,1.627-0.536,3.545c-2.387,6.71-2.083,11.436,3.921,29.24c0,0,1.848,3.945,0.914,11.033 c0,0-3.836,7.892-1.379,8.05c0,0,0.192,0.523,1.023,0.109c0,0,1.327,1.37,2.761,0.627c0,0,1.328,1.06,2.463,0.116 c0,0,0.91,1.047,2.237,0.201c0,0,1.742,1.175,2.777-0.098c0,0,1.839,0.408-1.435-7.886c0,0-1.254-8.793-1.945-10.522 c-1.318-3.275-0.387-12.251-0.106-14.175c0.453-3.216,0.21-8.695-0.618-12.934c-0.606-3.038,1.035-8.774,1.641-12.3 c1.245-7.423,3.685-26.373,3.38-29.959l1.008,0.354C103.809,118.312,104.265,117.959,104.265,117.959z';

const PATH_LENGTH = 1003.7691650390625;

const BODY_PART_SEGMENTS: Record<string, Array<{ start: number; end: number }>> = {
  HEAD: [{ start: 461.7338159179688, end: 538.0202724609376 }],
  NECK: [
    { start: 459.72627758789065, end: 469.7639692382813 },
    { start: 529.990119140625, end: 540.0278107910157 },
  ],
  UPPER_BODY: [
    { start: 453.70366259765626, end: 463.7413542480469 },
    { start: 216.8141396484375, end: 242.91213793945312 },
    { start: 758.8494887695313, end: 782.9399487304688 },
    { start: 538.0202724609376, end: 550.0655024414062 },
  ],
  LARM: [{ start: 242.91213793945312, end: 451.6961242675781 }],
  LHAND: [{ start: 281.0553662109375, end: 379.42474438476563 }],
  RARM: [{ start: 550.0655024414062, end: 756.8419504394532 }],
  RHAND: [{ start: 620.3293439941406, end: 718.6987221679688 }],
  LLEG: [{ start: 0, end: 190.7161413574219 }],
  LFOOT: [{ start: 68.25630322265626, end: 118.44476147460936 }],
  RLEG: [{ start: 809.0379470214845, end: 1001.7616267089844 }],
  RFOOT: [{ start: 883.316865234375, end: 929.4902468261719 }],
};

interface Injury {
  severity: number;
  weaponHash?: number;
}

const getInjuryLabel = (severity: number) => {
  switch (severity) {
    case 1:
      return 'Light Injury';
    case 2:
      return 'Moderate Injury';
    case 3:
      return 'Severe Injury';
    case 4:
      return 'Critical Injury';
    default:
      return 'Healthy';
  }
};

const BodySvg: React.FC = () => {
  const [injuries, setInjuries] = useState<Record<string, Injury | null>>({});
  const [healthPercent, setHealthPercent] = useState(100);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.action === 'updateInjuries') {
        const newInjuries: Record<string, Injury | null> = event.data.injuries || {};

        setInjuries((prev) => (Object.keys(newInjuries).length > 0 || Object.keys(prev).length > 0 ? newInjuries : prev));
      }

      if (event.data?.action === 'updateHealthStatus') {
        setHealthPercent(event.data.healthPercent ?? 100);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const getBaseHealthColor = () => {
    if (healthPercent >= 75) return 'rgba(74, 222, 128, 0.85)';
    if (healthPercent >= 50) return 'rgba(250, 204, 21, 0.9)';
    if (healthPercent >= 25) return 'rgba(251, 146, 60, 0.9)';
    return 'rgba(239, 68, 68, 0.9)';
  };

  const injuredParts = Object.keys(BODY_PART_SEGMENTS).filter((part) => (injuries[part]?.severity || 0) > 0);

  const createDashArray = (segments: Array<{ start: number; end: number }>) => {
    const dashArray: number[] = [];
    let currentPos = 0;

    segments.forEach((segment) => {
      if (segment.start > currentPos) {
        dashArray.push(0, segment.start - currentPos);
      }
      dashArray.push(segment.end - segment.start, PATH_LENGTH);
    });

    return dashArray.join(' ');
  };

  const createInverseDashArray = () => {
    const injuredSegments = injuredParts
      .flatMap((part) => BODY_PART_SEGMENTS[part])
      .sort((a, b) => a.start - b.start);

    if (injuredSegments.length === 0) return undefined;

    const dashArray: number[] = [];
    let currentPos = 0;

    injuredSegments.forEach((segment) => {
      if (segment.start > currentPos) {
        dashArray.push(segment.start - currentPos, 0);
      }
      currentPos = segment.end;
    });

    if (currentPos < PATH_LENGTH) {
      dashArray.push(PATH_LENGTH - currentPos, 0);
    }

    return dashArray.join(' ');
  };

  const handleMouseMove = (event: React.MouseEvent, bodyPart: string) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    setHoveredPart(bodyPart);
  };

  return (
    <div className="body-svg-wrapper">
      <svg viewBox="50 -8 106 225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="bodyDotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.5" fill="rgba(255,255,255,0.1)" />
            <circle cx="12" cy="8" r="0.5" fill="rgba(255,255,255,0.1)" />
            <circle cx="8" cy="14" r="0.5" fill="rgba(255,255,255,0.1)" />
            <circle cx="16" cy="18" r="0.5" fill="rgba(255,255,255,0.1)" />
          </pattern>
        </defs>

        <rect x="50" y="-8" width="106" height="225" fill="url(#bodyDotPattern)" opacity="0.3" />

        <g>
          <path
            d={PATH_DATA}
            fill="none"
            stroke={getBaseHealthColor()}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={createInverseDashArray()}
          />

          {injuredParts.map((part) => {
            const severity = injuries[part]?.severity || 0;

            return (
              <path
                key={part}
                d={PATH_DATA}
                fill="none"
                stroke={INJURY_OUTLINE_COLORS[severity]}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={createDashArray(BODY_PART_SEGMENTS[part])}
                className="body-svg-injured"
                style={{ pointerEvents: 'stroke' }}
                onMouseMove={(event) => handleMouseMove(event, part)}
                onMouseLeave={() => setHoveredPart(null)}
              />
            );
          })}

          {(injuries.SPINE?.severity || 0) > 0 && (
            <path
              d="M 103.27748691099475 34.96346186226637 L 103 98.50816635797273"
              fill="none"
              stroke={INJURY_OUTLINE_COLORS[injuries.SPINE!.severity]}
              strokeWidth="2.2"
              strokeLinecap="round"
              className="body-svg-injured"
              onMouseMove={(event) => handleMouseMove(event, 'SPINE')}
              onMouseLeave={() => setHoveredPart(null)}
            />
          )}
        </g>
      </svg>

      {hoveredPart && (
        <div className="body-svg-tooltip" style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y - 35}px` }}>
          <p className="body-svg-tooltip-part">{BODY_PART_NAMES[hoveredPart] || hoveredPart}</p>
          <p style={{ color: INJURY_OUTLINE_COLORS[injuries[hoveredPart]?.severity || 0] }}>
            {getInjuryLabel(injuries[hoveredPart]?.severity || 0)}
          </p>
        </div>
      )}
    </div>
  );
};

export default BodySvg;
