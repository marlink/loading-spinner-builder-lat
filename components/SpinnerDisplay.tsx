import React, { useMemo } from 'react';
import type { SpinnerConfig } from '../types';
import { ShapeType, AnimationType, RadiusVariation, SizeVariation, GradientType, PlaybackMode } from '../types';

interface SpinnerDisplayProps {
  config: SpinnerConfig;
}

const getAnimationKeyframes = (animationType: AnimationType, shape: ShapeType) => {
  switch (animationType) {
    case AnimationType.Chase:
      return `@keyframes chase { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(0.3); opacity: 0.3; } 100% { transform: scale(1); opacity: 1; } }`;
    case AnimationType.Pulse:
      return `@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.3); } }`;
    case AnimationType.Wave:
      return `@keyframes wave { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }`;
    case AnimationType.Orbit:
      return `@keyframes orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
    case AnimationType.Spiral:
        return `@keyframes spiral { from { transform: rotate(0deg) scale(1); opacity: 1; } to { transform: rotate(360deg) scale(0); opacity: 0; } }`;
    case AnimationType.Fade:
        return `@keyframes fade { 0% { opacity: 1; } 50% { opacity: 0.2; } 100% { opacity: 1; } }`;
    case AnimationType.Distort:
       if (shape === ShapeType.Square) {
          return `@keyframes distort { 0%, 100% { rx: 0; transform: rotate(0deg) scale(1); } 50% { rx: 15; transform: rotate(180deg) scale(0.7); } }`;
       }
      return `@keyframes distort { 0%, 100% { transform: scale(1) skew(0); } 50% { transform: scale(0.7) skew(30deg); } }`;
    default:
      return '';
  }
};

const SHAPES = [ShapeType.Circle, ShapeType.Square, ShapeType.Line, ShapeType.Triangle, ShapeType.Star, ShapeType.Heart];
const getRandomShape = () => SHAPES[Math.floor(Math.random() * SHAPES.length)];


export const SpinnerDisplay: React.FC<SpinnerDisplayProps> = ({ config }) => {
  const { 
    shape, count, size, radius, colors, gradientStops, animationType, duration, stagger, easing,
    copies, copySpread, sizeVariation, radiusVariation, gradientType, playbackMode, repeatCount, shadow,
    shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor, shadowOpacity,
    stroke, strokeWidth, strokeColor
  } = config;

  const randomFactors = useMemo(() => {
    return {
        radius: Array.from({ length: count }, () => 0.8 + Math.random() * 0.4),
        shape: Array.from({ length: count * copies }, () => getRandomShape()),
    };
  }, [count, copies, radiusVariation, shape]);


  const elements = useMemo(() => {
    const els: React.ReactNode[] = [];
    const groupAnimationTypes = [AnimationType.Orbit, AnimationType.Spiral];
    const isAnimated = animationType !== AnimationType.None;
    const iterationCount = playbackMode === PlaybackMode.Loop || playbackMode === PlaybackMode.Alternate ? 'infinite' : (playbackMode === PlaybackMode.Once ? 1 : repeatCount);
    const direction = playbackMode === PlaybackMode.Alternate ? 'alternate' : 'normal';

    for (let i = 0; i < count; i++) {
        let currentRadius = radius;
        if (radiusVariation === RadiusVariation.Uneven) {
            currentRadius = radius + Math.sin((i / count) * Math.PI * 4) * (radius * 0.2);
        } else if (radiusVariation === RadiusVariation.Random) {
            currentRadius = radius * randomFactors.radius[i];
        }

        let currentSize = size;
        if (sizeVariation === SizeVariation.SmallToLarge) {
            currentSize = (size * 0.25) + (size * 0.75) * (i / (count - 1 || 1));
        } else if (sizeVariation === SizeVariation.LargeToSmall) {
            currentSize = size - (size * 0.75) * (i / (count - 1 || 1));
        }

      for (let j = 0; j < copies; j++) {
        const angle = (i / count) * 2 * Math.PI;
        const copyRadiusOffset = copies > 1 ? (j - (copies - 1) / 2) * copySpread : 0;
        const finalRadius = currentRadius + copyRadiusOffset;
        const x = finalRadius * Math.cos(angle);
        const y = finalRadius * Math.sin(angle);
        const animationDelay = `${i * stagger}s`;

        let fill = colors[0] || '#000';
        if (gradientType === GradientType.None) {
            fill = colors[0] || '#000';
        } else if (gradientType === GradientType.PerDuplicate) {
            fill = colors[j % colors.length] || colors[0];
        } else if (gradientType === GradientType.Sweep) {
            fill = colors[i % colors.length] || colors[0];
        } else {
            fill = 'url(#spinner-gradient)';
        }

        const style: React.CSSProperties = isAnimated ? {
          animationName: groupAnimationTypes.includes(animationType) ? 'none' : animationType,
          animationDuration: `${duration}s`,
          animationTimingFunction: easing,
          animationIterationCount: groupAnimationTypes.includes(animationType) ? undefined : String(iterationCount),
          animationDirection: groupAnimationTypes.includes(animationType) ? undefined : direction,
          animationDelay,
        } : {};

        // FIX: Moved `transformOrigin` into style object and removed explicit typing
        // on `commonProps` to resolve type incompatibilities with specific SVG elements.
        const commonProps = {
          style: { ...style, transformOrigin: 'center center' },
          fill,
          stroke: stroke ? strokeColor : 'none',
          strokeWidth: stroke ? strokeWidth : 0,
          filter: shadow ? 'url(#spinner-shadow)' : undefined,
        };
        
        const key = `${i}-${j}`;
        const currentShape = shape === ShapeType.Random ? randomFactors.shape[i * copies + j] : shape;

        switch (currentShape) {
          case ShapeType.Square:
            els.push(<rect key={key} x={x - currentSize / 2} y={y - currentSize / 2} width={currentSize} height={currentSize} {...commonProps} />);
            break;
          case ShapeType.Line:
            els.push(<rect key={key} x={x - currentSize / 8} y={y - currentSize / 2} width={currentSize / 4} height={currentSize} transform={`rotate(${angle * 180 / Math.PI} ${x} ${y})`} {...commonProps} />);
            break;
           case ShapeType.Triangle:
            const h = currentSize * (Math.sqrt(3)/2);
            els.push(<polygon key={key} points={`${x},${y - 2*h/3} ${x - currentSize/2},${y + h/3} ${x + currentSize/2},${y + h/3}`} {...commonProps} />);
            break;
           case ShapeType.Star:
            const starPoints = Array.from({length: 10}).map((_, k) => {
                const r = k % 2 === 0 ? currentSize / 2 : currentSize / 4;
                const a = (k / 10) * 2 * Math.PI - Math.PI/2;
                return `${x + r * Math.cos(a)},${y + r * Math.sin(a)}`;
            }).join(' ');
            els.push(<polygon key={key} points={starPoints} {...commonProps} />);
            break;
           case ShapeType.Heart:
            const s = currentSize * 0.08;
            const path = `M ${x} ${y + s*2} C ${x + s*4} ${y - s*2}, ${x + s*9} ${y - s*0.5}, ${x} ${y - s*5} C ${x - s*9} ${y - s*0.5}, ${x - s*4} ${y - s*2}, ${x} ${y + s*2} Z`;
            els.push(<path key={key} d={path} {...commonProps} />);
            break;
          case ShapeType.Circle:
          default:
            els.push(<circle key={key} cx={x} cy={y} r={currentSize / 2} {...commonProps} />);
            break;
        }
      }
    }
    return els;
  }, [config, randomFactors]);

  const isAnimated = animationType !== AnimationType.None;
  const keyframes = isAnimated ? getAnimationKeyframes(animationType, shape) : '';

  const maxCopyOffset = copies > 1 ? ((copies - 1) / 2) * copySpread : 0;
  const effectiveRadius = radius + maxCopyOffset;
  const viewBoxSize = effectiveRadius * 2 + size * 2;
  const viewBox = `-${viewBoxSize / 2} -${viewBoxSize / 2} ${viewBoxSize} ${viewBoxSize}`;

  const groupAnimationTypes = [AnimationType.Orbit, AnimationType.Spiral];
  const iterationCount = playbackMode === PlaybackMode.Loop || playbackMode === PlaybackMode.Alternate ? 'infinite' : (playbackMode === PlaybackMode.Once ? 1 : repeatCount);
  const direction = playbackMode === PlaybackMode.Alternate ? 'alternate' : 'normal';

  const groupStyle: React.CSSProperties = isAnimated && groupAnimationTypes.includes(animationType)
    ? {
        animationName: animationType,
        animationDuration: `${duration}s`,
        animationTimingFunction: easing,
        animationIterationCount: String(iterationCount),
        animationDirection: direction,
        transformOrigin: 'center center'
      }
    : {};

  return (
    <>
      <style>{keyframes}</style>
      <svg
        width="250"
        height="250"
        viewBox={viewBox}
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
            {(gradientType === GradientType.Linear || gradientType === GradientType.Radial) && (
                React.createElement(
                    gradientType === GradientType.Linear ? 'linearGradient' : 'radialGradient',
                    { id: 'spinner-gradient', x1: "0%", y1: "0%", x2: "100%", y2: "100%" },
                    gradientStops.map((stop) => (
                        <stop key={stop.id} offset={`${stop.position}%`} stopColor={stop.color} />
                    ))
                )
            )}
            {shadow && (
                 <filter id="spinner-shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow 
                        dx={shadowOffsetX} 
                        dy={shadowOffsetY} 
                        stdDeviation={shadowBlur} 
                        floodColor={shadowColor} 
                        floodOpacity={shadowOpacity}
                    />
                </filter>
            )}
        </defs>
        <g style={groupStyle}>
          {elements}
        </g>
      </svg>
    </>
  );
};