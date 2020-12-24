import {
  Point,
  Rectangle,
  RectangleTransform,
  Transform
} from './geometry';

import {
  drawConnectedPoints,
  drawLine,
  drawCenterAdjustedText,
  drawLeftAdjustedText,
  Color,
  pointToPixelBoundary,
} from './graphics';

import {
  getDefaultYTicks,
  Tick
} from './ticks';

interface PlotContext {
  sourceRectangle: Rectangle;
  canvasRectangle: Rectangle;
  transform: Transform; // Transforms to a point in the canvas
}

export class Plotter {

  readonly getMinY = (points: Point[]): number => Math.min(...points.map(p => p.y));
  readonly getMaxY = (points: Point[]): number => Math.max(...points.map(p => p.y));
  readonly getMinX = (points: Point[]): number => Math.min(...points.map(p => p.x));
  readonly getMaxX = (points: Point[]): number => Math.max(...points.map(p => p.x));

  readonly plotMargin = 50;
  readonly textMargin = 5;

  readonly canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  plot(points: Point[], xTicks: Tick[] = [],
    yTicks: Tick[] | 'auto' = 'auto', lineColor: Color = Color.Green) {
    const plotContext = this.plotContext(this.canvas, points);
    const actualYTicks = yTicks === 'auto'
      ? getDefaultYTicks(plotContext.sourceRectangle.bottom,
        plotContext.sourceRectangle.top, 5)
      : yTicks;
    const context = this.canvas.getContext('2d');

    if (!context) {
      throw Error("Couldn't get the context to draw in the canvas");
    }

    context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawXLabels(context, plotContext, xTicks);
    this.drawYLabels(context, plotContext, actualYTicks);
    this.drawDataPoints(context, plotContext, points, lineColor);
  }

  plotContext(canvas: HTMLCanvasElement, points: Point[]): PlotContext {
    const rangeMinY = this.getMinY(points);
    const rangeMaxY = this.getMaxY(points);
    const rangeMinX = this.getMinX(points);
    const rangeMaxX = this.getMaxX(points);

    const sourceRectangle: Rectangle = {
      bottom: rangeMinY,
      left: rangeMinX,
      top: rangeMaxY,
      right: rangeMaxX
    };

    const canvasRectangle: Rectangle = {
      top: this.plotMargin,
      left: this.plotMargin,
      bottom: canvas.height - this.plotMargin,
      right: canvas.width - this.plotMargin,
    };

    const transformation = RectangleTransform(sourceRectangle, canvasRectangle);

    return {
      sourceRectangle,
      canvasRectangle,
      transform: transformation,
    };
  };

  drawXLabels(context: CanvasRenderingContext2D,
    plotContext: PlotContext, labels: Tick[]) {
    labels.forEach(label => {
      if (
        label.position < plotContext.sourceRectangle.left ||
        plotContext.sourceRectangle.right < label.position
      ) {
        return;
      }

      const aPoint = pointToPixelBoundary(
        plotContext.transform({
          x: label.position,
          y: plotContext.sourceRectangle.bottom,
        })
      );

      const bPoint = pointToPixelBoundary(
        plotContext.transform({
          x: label.position,
          y: plotContext.sourceRectangle.top,
        })
      );

      const textPoint = { x: aPoint.x, y: aPoint.y + this.textMargin };

      drawLine(context, aPoint, bPoint, { width: 1, strokeStyle: 'gray' });
      drawCenterAdjustedText(context, label.label, textPoint);
    });
  };

  drawYLabels(context: CanvasRenderingContext2D,
    plotContext: PlotContext, labels: Tick[]) {
    labels.forEach(label => {
      if (
        label.position < plotContext.sourceRectangle.bottom ||
        plotContext.sourceRectangle.top < label.position
      ) {
        return;
      }

      const aPoint = pointToPixelBoundary(
        plotContext.transform({
          x: plotContext.sourceRectangle.left,
          y: label.position,
        })
      );

      const bPoint = pointToPixelBoundary(
        plotContext.transform({
          x: plotContext.sourceRectangle.right,
          y: label.position,
        })
      );

      const textPoint = { x: aPoint.x - this.textMargin, y: aPoint.y };

      drawLine(context, aPoint, bPoint, { width: 1, strokeStyle: 'gray' });
      drawLeftAdjustedText(context, label.label, textPoint);
    });
  };

  drawDataPoints(
    context: CanvasRenderingContext2D,
    plotContext: PlotContext,
    ps: Point[],
    color: Color
  ) {
    const dstPoints = ps.map(p => pointToPixelBoundary(plotContext.transform(p)));
    drawConnectedPoints(context, dstPoints, { strokeStyle: color });
  };
};
