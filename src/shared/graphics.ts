import { Point } from './geometry';

export enum Color {
  Green = '#4CAF50',
  Red = '#F2495C',
  Blue = '#039BE5'
}

interface LineStyle {
  strokeStyle: Color | string;
  join: CanvasLineJoin;
  width: number;
}

const defaultLineStyle: LineStyle = {
  strokeStyle: Color.Green,
  join: 'bevel',
  width: 2,
};

const FONT = '12px Fira Code';

const applyLineStyle = (context: CanvasRenderingContext2D, style: Partial<LineStyle>): void => {
  const actualStyle = { ...defaultLineStyle, ...style };
  context.strokeStyle = actualStyle.strokeStyle;
  context.lineJoin = actualStyle.join;
  context.lineWidth = actualStyle.width;
};

export const drawLine = (
  context: CanvasRenderingContext2D,
  a: Point,
  b: Point,
  style: Partial<LineStyle> = {}
): void => {
  applyLineStyle(context, style);

  context.save();

  context.beginPath();
  context.moveTo(a.x, a.y);
  context.lineTo(b.x, b.y);
  context.closePath();

  context.restore();
  context.stroke();
};

export const drawConnectedPoints = (
  context: CanvasRenderingContext2D,
  points: Point[],
  style: Partial<LineStyle> = {}
): void => {
  if (points.length === 0) {
    return;
  }

  if (points.length === 1) {
    drawLine(context, points[0], points[0]);
  }

  applyLineStyle(context, style);

  context.save();

  context.beginPath();
  context.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i += 1) {
    context.lineTo(points[i].x, points[i].y);
    context.moveTo(points[i].x, points[i].y);
  }

  context.closePath();
  context.restore();
  context.stroke();
};

export const drawLeftAdjustedText = (context: CanvasRenderingContext2D, text: string, p: Point): void => {
  context.font = FONT;
  context.fillStyle = "white";
  const measure = context.measureText(text);
  context.fillText(text, p.x - measure.actualBoundingBoxRight, p.y + measure.actualBoundingBoxAscent / 2);
};

export const drawCenterAdjustedText = (context: CanvasRenderingContext2D, text: string, p: Point): void => {
  context.font = FONT;
  const measure = context.measureText(text);
  context.fillText(text, p.x - measure.actualBoundingBoxRight / 2, p.y + measure.actualBoundingBoxAscent);
};

// This operation is needed to paint a 1 pixel width line
export const pointToPixelBoundary = (p: Point): Point => {
  return { x: Math.floor(p.x) + 0.5, y: Math.floor(p.y) + 0.5 };
};
