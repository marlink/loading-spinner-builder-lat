export enum ShapeType {
  Circle = 'circle',
  Square = 'square',
  Line = 'line',
  Triangle = 'triangle',
  Star = 'star',
  Heart = 'heart',
  Random = 'random',
}

export enum AnimationType {
  None = 'none',
  Chase = 'chase',
  Pulse = 'pulse',
  Wave = 'wave',
  Orbit = 'orbit',
  Distort = 'distort',
  Fade = 'fade',
  Spiral = 'spiral',
}

export enum EasingType {
    Linear = 'linear',
    EaseIn = 'ease-in',
    EaseOut = 'ease-out',
    EaseInOut = 'ease-in-out',
    Spring = 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
    EaseInBack = 'cubic-bezier(0.36, 0, 0.66, -0.56)',
}

export enum SizeVariation {
    None = 'none',
    SmallToLarge = 'sm-lg',
    LargeToSmall = 'lg-sm',
}

export enum RadiusVariation {
    Even = 'even',
    Uneven = 'uneven',
    Random = 'random',
}

export enum PlaybackMode {
    Loop = 'loop',
    Once = 'once',
    Repeat = 'repeat',
    Alternate = 'alternate',
}

export enum GradientType {
    PerDuplicate = 'per-duplicate',
    Linear = 'linear',
    Radial = 'radial',
    Sweep = 'sweep',
    None = 'none', // Represents single color mode
}

export interface ColorStop {
  id: string;
  color: string;
  position: number; // 0-100
}

export interface SpinnerConfig {
  shape: ShapeType;
  count: number;
  size: number;
  radius: number;
  colors: string[];
  gradientStops: ColorStop[];
  animationType: AnimationType;
  duration: number;
  stagger: number;
  easing: EasingType;
  copies: number;
  copySpread: number;
  sizeVariation: SizeVariation;
  radiusVariation: RadiusVariation;
  gradientType: GradientType;
  playbackMode: PlaybackMode;
  repeatCount: number;
  shadow: boolean;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowBlur: number;
  shadowColor: string;
  shadowOpacity: number;
  backgroundBlur: number;
  stroke: boolean;
  strokeWidth: number;
  strokeColor: string;
}