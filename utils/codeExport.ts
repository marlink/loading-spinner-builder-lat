import type { SpinnerConfig } from '../types';
import { ShapeType, AnimationType, RadiusVariation, SizeVariation, GradientType, PlaybackMode } from '../types';

export enum ExportType {
  SVG = 'svg',
  CSS = 'css',
  GSAP = 'gsap',
}

interface ExportOutput {
  html?: string;
  css?: string;
  js?: string;
}

// ... (utility code remains the same)
const getAnimationKeyframes = (animationType: AnimationType, shape: ShapeType, forCssDiv: boolean = false) => {
  const t = forCssDiv ? '' : 'transform:';
  switch (animationType) {
    case AnimationType.Chase:
      return `@keyframes chase { 0% { ${t} scale(1); opacity: 1; } 50% { ${t} scale(0.3); opacity: 0.3; } 100% { ${t} scale(1); opacity: 1; } }`;
    case AnimationType.Pulse:
      return `@keyframes pulse { 0%, 100% { ${t} scale(1); } 50% { ${t} scale(1.3); } }`;
    case AnimationType.Wave:
      return `@keyframes wave { 0%, 100% { ${t} translateY(0); } 50% { ${t} translateY(-20px); } }`;
    case AnimationType.Orbit:
      return `@keyframes orbit { from { ${t} rotate(0deg); } to { ${t} rotate(360deg); } }`;
    case AnimationType.Spiral:
      return `@keyframes spiral { from { ${t} rotate(0deg) scale(1); opacity: 1; } to { ${t} rotate(360deg) scale(0); opacity: 0; } }`;
    case AnimationType.Fade:
      return `@keyframes fade { 0% { opacity: 1; } 50% { opacity: 0.2; } 100% { opacity: 1; } }`;
    case AnimationType.Distort:
      if (shape === ShapeType.Square && forCssDiv) {
         return `@keyframes distort { 0%, 100% { border-radius: 0; transform: rotate(0deg) scale(1); } 50% { border-radius: 50%; transform: rotate(180deg) scale(0.7); } }`;
      }
      if (shape === ShapeType.Square) {
         return `@keyframes distort { 0%, 100% { rx: 0; ${t} rotate(0deg) scale(1); } 50% { rx: 15; ${t} rotate(180deg) scale(0.7); } }`;
      }
      return `@keyframes distort { 0%, 100% { ${t} scale(1) skew(0); } 50% { ${t} scale(0.7) skew(30deg); } }`;
    default:
      return '';
  }
};

const getIterationCount = (playbackMode: PlaybackMode, repeatCount: number) => {
    return playbackMode === PlaybackMode.Loop || playbackMode === PlaybackMode.Alternate 
        ? 'infinite' 
        : (playbackMode === PlaybackMode.Once ? 1 : repeatCount);
};

const SHAPES = [ShapeType.Circle, ShapeType.Square, ShapeType.Line, ShapeType.Triangle, ShapeType.Star, ShapeType.Heart];
const getRandomShape = () => SHAPES[Math.floor(Math.random() * SHAPES.length)];

const generateAnimatedSvg = (config: SpinnerConfig): ExportOutput => {
    const { 
    shape, count, size, radius, colors, gradientStops, animationType, duration, stagger, easing,
    copies, copySpread, sizeVariation, radiusVariation, gradientType, playbackMode, repeatCount, shadow,
    shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor, shadowOpacity,
    stroke, strokeWidth, strokeColor
  } = config;

  const randomFactors = {
      radius: Array.from({ length: count }, () => 0.8 + Math.random() * 0.4),
      shape: Array.from({ length: count * copies }, () => getRandomShape()),
  };

  let elements = '';
  const groupAnimationTypes = [AnimationType.Orbit, AnimationType.Spiral];
  const isAnimated = animationType !== AnimationType.None;
  const iterationCount = getIterationCount(playbackMode, repeatCount);
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
        
        const style = isAnimated ? `animation-name: ${groupAnimationTypes.includes(animationType) ? 'none' : animationType}; animation-duration: ${duration}s; animation-timing-function: ${easing}; animation-iteration-count: ${groupAnimationTypes.includes(animationType) ? 'unset' : iterationCount}; animation-direction: ${groupAnimationTypes.includes(animationType) ? 'unset' : direction}; animation-delay: ${i * stagger}s;` : '';
        
        let fill;
        if (gradientType === GradientType.None) fill = colors[0] || '#000';
        else if (gradientType === GradientType.PerDuplicate) fill = colors[j % colors.length] || colors[0];
        else if (gradientType === GradientType.Sweep) fill = colors[i % colors.length] || colors[0];
        else fill = 'url(#spinner-gradient)';
        
        const commonProps = `style="${style}" fill="${fill}" ${shadow ? 'filter="url(#spinner-shadow)"' : ''} stroke="${stroke ? strokeColor : 'none'}" stroke-width="${stroke ? strokeWidth : 0}" transform-origin="center center"`;
        const currentShape = shape === ShapeType.Random ? randomFactors.shape[i * copies + j] : shape;

        switch (currentShape) {
          case ShapeType.Square:
            elements += `\n    <rect x="${x - currentSize / 2}" y="${y - currentSize / 2}" width="${currentSize}" height="${currentSize}" ${commonProps} />`;
            break;
          case ShapeType.Line:
            elements += `\n    <rect x="${x - currentSize / 8}" y="${y - currentSize / 2}" width="${currentSize / 4}" height="${currentSize}" transform="rotate(${angle * 180 / Math.PI} ${x} ${y})" ${commonProps} />`;
            break;
           case ShapeType.Triangle:
            const h = currentSize * (Math.sqrt(3)/2);
            elements += `\n    <polygon points="${x},${y - 2*h/3} ${x - currentSize/2},${y + h/3} ${x + currentSize/2},${y + h/3}" ${commonProps} />`;
            break;
           case ShapeType.Star:
            const starPoints = Array.from({length: 10}).map((_, k) => {
                const r = k % 2 === 0 ? currentSize / 2 : currentSize / 4;
                const a = (k / 10) * 2 * Math.PI - Math.PI/2;
                return `${x + r * Math.cos(a)},${y + r * Math.sin(a)}`;
            }).join(' ');
            elements += `\n    <polygon points="${starPoints}" ${commonProps} />`;
            break;
           case ShapeType.Heart:
            const s = currentSize * 0.08;
            const path = `M ${x} ${y + s*2} C ${x + s*4} ${y - s*2}, ${x + s*9} ${y - s*0.5}, ${x} ${y - s*5} C ${x - s*9} ${y - s*0.5}, ${x - s*4} ${y - s*2}, ${x} ${y + s*2} Z`;
            elements += `\n    <path d="${path}" ${commonProps} />`;
            break;
          case ShapeType.Circle:
          default:
            elements += `\n    <circle cx="${x}" cy="${y}" r="${currentSize / 2}" ${commonProps} />`;
            break;
        }
    }
  }

  const maxCopyOffset = copies > 1 ? ((copies - 1) / 2) * copySpread : 0;
  const effectiveRadius = radius + maxCopyOffset;
  const viewBoxSize = effectiveRadius * 2 + size * 2;
  const viewBox = `-${viewBoxSize / 2} -${viewBoxSize / 2} ${viewBoxSize} ${viewBoxSize}`;
  
  const groupStyle = isAnimated && groupAnimationTypes.includes(animationType) ? `style="animation-name: ${animationType}; animation-duration: ${duration}s; animation-timing-function: ${easing}; animation-iteration-count: ${iterationCount}; animation-direction: ${direction}; transform-origin: center center;"` : '';

  const keyframes = isAnimated ? getAnimationKeyframes(animationType, shape) : '';
  
  const gradientDef = (type: GradientType) => {
    if (type !== GradientType.Linear && type !== GradientType.Radial) return '';
    const stops = gradientStops.map(stop => `<stop offset="${stop.position}%" stop-color="${stop.color}" />`).join('');
    if (type === GradientType.Linear) return `<linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">${stops}</linearGradient>`;
    return `<radialGradient id="spinner-gradient">${stops}</radialGradient>`;
  };

  const svg = `<svg width="250" height="250" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">
  ${isAnimated ? `<style>
    ${keyframes}
  </style>` : ''}
  <defs>
    ${gradientDef(gradientType)}
    ${shadow ? `<filter id="spinner-shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="${shadowOffsetX}" dy="${shadowOffsetY}" stdDeviation="${shadowBlur}" flood-color="${shadowColor}" flood-opacity="${shadowOpacity}"/></filter>` : ''}
  </defs>
  <g ${groupStyle}>${elements}
  </g>
</svg>`;

    return { html: svg };
};

const generateCss = (config: SpinnerConfig): ExportOutput => {
    const { count, size, radius, colors, animationType, duration, stagger, easing, copies, copySpread, shape, playbackMode, repeatCount, gradientType, stroke } = config;
    
    if (shape === ShapeType.Random || shape === ShapeType.Star || shape === ShapeType.Heart || shape === ShapeType.Triangle) {
        return { html: `<!-- CSS export for '${shape}' shape is not supported due to its complexity. Please use the Animated SVG export. -->` };
    }

    if (stroke) {
        return { html: `<!-- CSS export with 'stroke' is not supported. Please use the Animated SVG export for this effect. -->` };
    }

    let html = '<div class="spinner-container">';
    const totalElements = count * copies;
    for (let i = 0; i < totalElements; i++) {
        html += `<div class="spinner-element spinner-element-${i+1}"></div>`;
    }
    html += '</div>';

    const isAnimated = animationType !== AnimationType.None;
    const keyframes = isAnimated ? getAnimationKeyframes(animationType, shape, true) : '';
    const iterationCount = getIterationCount(playbackMode, repeatCount);
    const direction = playbackMode === PlaybackMode.Alternate ? 'alternate' : 'normal';

    let css = `${keyframes}

.spinner-container {
  width: 250px;
  height: 250px;
  position: relative;
  /* For centering */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.spinner-element {
  position: absolute;
  top: 50%;
  left: 50%;
  width: ${size}px;
  height: ${size}px;
  margin-left: ${-size/2}px;
  margin-top: ${-size/2}px;
  ${isAnimated ? `animation-name: ${animationType};` : ''}
  animation-duration: ${duration}s;
  animation-timing-function: ${easing};
  animation-iteration-count: ${iterationCount};
  animation-direction: ${direction};
  background-color: ${colors[0]}; /* Default color */
`;
    
    if(shape === ShapeType.Circle) css += '  border-radius: 50%;\n';

    css += '}\n\n';

    for (let i = 0; i < count; i++) {
        for (let j = 0; j < copies; j++) {
            const index = i * copies + j;
            const angle = (i / count) * 360;
            const copyRadiusOffset = copies > 1 ? (j - (copies - 1) / 2) * copySpread : 0;
            const finalRadius = radius + copyRadiusOffset;
            let color = colors[0];
            if (gradientType === GradientType.PerDuplicate) color = colors[j % colors.length];
            else if (gradientType === GradientType.Sweep) color = colors[i % colors.length];

            css += `.spinner-element-${index + 1} {\n`;
            css += `  transform: rotate(${angle}deg) translateY(${-finalRadius}px) rotate(${-angle}deg);\n`;
            if(isAnimated) css += `  animation-delay: ${i * stagger}s;\n`;
            if (gradientType !== GradientType.None && gradientType !== GradientType.Linear && gradientType !== GradientType.Radial) {
                 css += `  background-color: ${color};\n`;
            }
            css += `}\n\n`;
        }
    }
    
    return { html, css };
};

const generateGsap = (config: SpinnerConfig): ExportOutput => {
    const { html: svgHtml } = generateAnimatedSvg(config);
    const cleanedHtml = svgHtml!
        .replace(/<style>[\s\S]*?<\/style>/, '')
        .replace(/style="[^"]*"/g, '')
        .replace(/<g >/g, '<g class="spinner-group">')
        .replace(/<(circle|rect|polygon|path)/g, '<$1 class="spinner-element"');
    
    const { animationType, duration, stagger, easing, playbackMode, repeatCount } = config;
    
    if(animationType === AnimationType.None) {
        return { html: cleanedHtml, js: "// Animation type is set to 'None'. No JavaScript is needed for a static image."}
    }

    const repeatVal = playbackMode === PlaybackMode.Loop || playbackMode === PlaybackMode.Alternate ? -1 : (playbackMode === PlaybackMode.Once ? 0 : repeatCount -1);
    const yoyo = playbackMode === PlaybackMode.Alternate;

    let js = `// Make sure to include the GSAP library, e.g., from a CDN:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>

gsap.registerPlugin();

const elements = ".spinner-element";
const tl = gsap.timeline({ repeat: ${repeatVal}, yoyo: ${yoyo} });

`;
    
    const easeMap: {[key: string]: string} = {
        'ease-in': 'power1.in', 'ease-out': 'power1.out', 'ease-in-out': 'power1.inOut', 'linear': 'none',
        'cubic-bezier(0.68, -0.55, 0.27, 1.55)': 'back.inOut(1.7)',
        'cubic-bezier(0.36, 0, 0.66, -0.56)': 'back.in(1.7)',
    }
    const gsapEase = easeMap[easing] || 'power1.inOut';

    switch(animationType) {
        case AnimationType.Chase:
        case AnimationType.Fade:
            js += `tl.to(elements, { 
                scale: 0.3, opacity: 0.3, duration: ${duration / 2}, stagger: { each: ${stagger}, from: 'start' }, ease: '${gsapEase}',
            }).to(elements, {
                scale: 1, opacity: 1, duration: ${duration / 2}, stagger: { each: ${stagger}, from: 'start' }, ease: '${gsapEase}',
            });`;
            break;
        case AnimationType.Pulse:
             js += `tl.to(elements, { 
                scale: 1.3, duration: ${duration / 2}, stagger: { each: ${stagger}, from: 'start' }, ease: '${gsapEase}',
            }).to(elements, {
                scale: 1, duration: ${duration / 2}, stagger: { each: ${stagger}, from: 'start' }, ease: '${gsapEase}',
            });`;
            break;
        case AnimationType.Wave:
             js += `tl.to(elements, { 
                y: -20, duration: ${duration / 2}, stagger: { each: ${stagger}, from: 'start' }, ease: '${gsapEase}',
            }).to(elements, {
                y: 0, duration: ${duration / 2}, stagger: { each: ${stagger}, from: 'start' }, ease: '${gsapEase}',
            });`;
            break;
        case AnimationType.Orbit:
        case AnimationType.Spiral:
            js += `gsap.to('.spinner-group', {
                rotation: 360, duration: ${duration}, ease: 'none', repeat: -1,
            });\n`;
            if (animationType === AnimationType.Spiral) {
                 js += `gsap.to(elements, {
                    scale: 0, opacity: 0, duration: ${duration}, ease: 'power1.in', repeat: -1,
                });\n`;
            }
            break;
        default:
             js += `// Animation type '${animationType}' is not yet fully supported for GSAP export.\n`;
    }

    return { html: cleanedHtml, js };
};


export const generateCode = (config: SpinnerConfig, type: ExportType): ExportOutput => {
  switch (type) {
    case ExportType.SVG:
      return generateAnimatedSvg(config);
    case ExportType.CSS:
        return generateCss(config);
    case ExportType.GSAP:
        return generateGsap(config);
    default:
      return {};
  }
};