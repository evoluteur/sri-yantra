/* The nine interlocking triangles of the Sri Yantra, in a 300 x 300 space
   with the center at (150, 150) and the circle of radius 100 that passes
   through every outer vertex. Each entry is [left x, base y, apex y, right x,
   points up]. The base runs from (left, base y) to (right, base y) and the
   apex is at (150, apex y). y grows downward, as on screen.

   The numbers are from the Sri Yantra example on TeXample.net (CC BY-SA
   4.0). The two largest triangles have all their vertices on the circle, and
   every triangle is symmetric left to right. */
const YANTRA_TRIANGLES = [
  { id: "D1", data: [53.65669559977147, 123.20508075688774, 250, 246.34330440022853, 0] },
  { id: "U1", data: [52.984011026495736, 174.24660560764943, 50, 247.01598897350425, 1] },
  { id: "U3", data: [98.71823312733801, 220.03828947357886, 123.20508075688774, 201.281766872662, 1] },
  { id: "U2", data: [78.26467997914015, 197.92315674002487, 78.10499177949904, 221.73532002085986, 1] },
  { id: "D3", data: [90.4856922951427, 78.10499177949904, 160.66014976539617, 209.51430770485734, 0] },
  { id: "D2", data: [80.98384838952128, 103.12199145016105, 220.03828947357886, 219.0161516104787, 0] },
  { id: "U4", data: [114.9488500600036, 160.66014976539617, 103.12199145016105, 185.0511499399964, 1] },
  { id: "D4", data: [116.35142605010424, 134.30757626706648, 197.92315674002487, 183.64857394989576, 0] },
  { id: "D5", data: [124.61190803072795, 144.79777263138968, 174.24660560764943, 175.38809196927207, 0] },
];
