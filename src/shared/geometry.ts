const TransformPointRectangle = (source: Rectangle, dest: Rectangle, p: Point): Point => {
  const { x, y } = p;
  const { left: a, top: b, right: c, bottom: d } = source;
  const { left: e, top: f, right: g, bottom: h } = dest;
  return {
    x: e + ((x - a) * (g - e)) / (c - a),
    y: f + ((y - b) * (h - f)) / (d - b),
  };
};

export interface Point {
  x: number;
  y: number;
}

export interface Rectangle {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export type Transform = (point: Point) => Point;

export const RectangleTransform = (source: Rectangle, dest: Rectangle): Transform => (
  p: Point
): Point => TransformPointRectangle(source, dest, p);
