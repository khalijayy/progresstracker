import React, { useEffect, useState } from 'react';

// Reusable DielinePreview component. Now supports dynamic columns (based on dielineCount)
// and basic width scaling driven by measurementCount. It also briefly highlights when
// props change so users notice updates.
export default function DielinePreview({ measurementCount, dielineCount, segmentationPct, creasingPct, highlight = false }) {
  const measurementsLabel = measurementCount == null || measurementCount === '—' ? '—' : `${measurementCount} mm`;
  const dielineLabel = dielineCount == null || dielineCount === '—' ? '—' : String(dielineCount);
  const segLabel = segmentationPct == null ? '—' : `${segmentationPct}%`;
  const creaseLabel = creasingPct == null ? '—' : `${creasingPct}%`;

  // Determine columns from dielineCount (clamped)
  const parsedCols = Number(dielineCount);
  const cols = Number.isFinite(parsedCols) && parsedCols > 0 ? Math.min(8, Math.max(1, Math.round(parsedCols))) : 4;

  // Determine panel width from measurementCount (basic scaling). We map mm->scale factor.
  const basePanelW = 80;
  const parsedMeasure = Number(measurementCount);
  const scale = Number.isFinite(parsedMeasure) ? Math.min(2, Math.max(0.6, parsedMeasure / 200)) : 1; // 200mm -> scale 1
  const panelW = Math.round(basePanelW * scale);
  const panelH = Math.round(panelW * 0.75);
  const gap = 8;
  const bleed = 6;
  const totalW = cols * panelW + (cols - 1) * gap + bleed * 2;
  const totalH = panelH + bleed * 2;
  const creaseY = bleed + panelH / 2;

  const [flash, setFlash] = useState(false);
  // Flash briefly when key props change
  useEffect(() => {
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 700);
    return () => clearTimeout(t);
  }, [measurementCount, dielineCount, segmentationPct, creasingPct]);

  return (
    <div className={`w-full overflow-auto ${highlight ? 'border-2 border-red-300 rounded' : ''}`}>
      <svg viewBox={`0 0 ${totalW} ${totalH}`} width="100%" height={Math.min(220, totalH + 20)} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        {/* Outside bleed (green) */}
        <rect x={0.5} y={0.5} width={totalW - 1} height={totalH - 1} fill="none" stroke="#008000" strokeWidth="1.5" />

        {/* Panels (cut lines - black) */}
        {Array.from({ length: cols }).map((_, i) => {
          const x = bleed + i * (panelW + gap);
          // if there's no meaningful live data, render a light placeholder fill so the panels are visible
          const isPlaceholder = !Number.isFinite(parsedMeasure) && !Number.isFinite(parsedCols);
          return (
            <rect
              key={i}
              x={x}
              y={bleed}
              width={panelW}
              height={panelH}
              fill={isPlaceholder ? '#f3f4f6' : 'none'}
              stroke={isPlaceholder ? '#cbd5e1' : '#000'}
              strokeWidth="1.2"
            />
          );
        })}

        {/* Crease (soft crease - red dashed) */}
        <line x1={bleed} y1={creaseY} x2={totalW - bleed} y2={creaseY} stroke="#cc0000" strokeWidth="1" strokeDasharray="6 4" />

        {/* Vertical cut slits shown as short gaps on top/bottom */}
        {Array.from({ length: Math.max(0, cols - 1) }).map((_, i) => {
          const x = bleed + (i + 1) * (panelW + gap) - gap / 2;
          const slitH = Math.min(20, Math.round(panelH * 0.16));
          const slitYTop = bleed;
          const slitYBottom = bleed + panelH - slitH;
          return (
            <g key={`slit-${i}`}>
              <rect x={x - 1} y={slitYTop} width={2} height={slitH} fill="#000" />
              <rect x={x - 1} y={slitYBottom} width={2} height={slitH} fill="#000" />
            </g>
          );
        })}

        {/* Labels - show measurements and percentages */}
        <g fontSize="8" fontFamily="Arial" fill="#0d1b2a">
          <text x={bleed + 6} y={12}>{`Measurements: ${measurementsLabel}`}</text>
          <text x={bleed + 6} y={24}>{`Dielines: ${dielineLabel}`}</text>
          <text x={bleed + 6} y={36}>{`Segmentation: ${segLabel}`}</text>
          <text x={bleed + 6} y={48}>{`Creasing: ${creaseLabel}`}</text>
        </g>

        {/* If placeholder mode, render prominent placeholder label */}
        {(!Number.isFinite(parsedMeasure) && !Number.isFinite(parsedCols)) && (
          <text x={totalW / 2} y={totalH / 2 + 6} textAnchor="middle" fontSize={14} fontFamily="Arial" fill="#6b7280">Preview (no live data)</text>
        )}

        {/* Dimension arrows (simple) */}
        <g stroke="#0b63ff" strokeWidth="1">
          <line x1={bleed} y1={totalH - 4} x2={totalW - bleed} y2={totalH - 4} />
          <polyline points={`${bleed},${totalH - 6} ${bleed},${totalH - 2} ${bleed + 4},${totalH - 4}`} fill="#0b63ff" />
          <polyline points={`${totalW - bleed},${totalH - 6} ${totalW - bleed},${totalH - 2} ${totalW - bleed - 4},${totalH - 4}`} fill="#0b63ff" />
        </g>

        {/* Flash highlight overlay */}
        {flash && (
          <rect x={bleed} y={bleed} width={totalW - bleed * 2} height={panelH} fill="#fdff0040" />
        )}
          {/* Debug label when highlight enabled */}
          {highlight && (
            <text x={totalW / 2} y={totalH / 2} textAnchor="middle" fontSize={Math.max(10, Math.round(panelH / 6))} fontWeight="600" fill="#b91c1c" opacity="0.85">DIELINE PREVIEW</text>
          )}
      </svg>
    </div>
  );
}
