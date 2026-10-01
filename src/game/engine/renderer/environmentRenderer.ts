import { GeneratedMap } from '../mapGenerator';
import { Obstacle, StreetLight } from '../types';

export interface EnvironmentRenderProps {
  map: GeneratedMap;
}

/**
 * Procedural top-down renderer for the abandoned apocalyptic city environment.
 * Generates asphalt roads, pedestrian crosswalks, concrete sidewalks, curb stones,
 * crumbling brick buildings, detailed abandoned cars (police, taxi, sedans, pickups),
 * street lights with light pools, rubble debris, and urban street props.
 */
export function renderDetailedCityEnvironment(bg: CanvasRenderingContext2D, map: GeneratedMap) {
  const width = map.width;
  const height = map.height;

  // 1. Base Ground (Dirt/Concrete Foundation)
  bg.fillStyle = '#0f172a';
  bg.fillRect(0, 0, width, height);

  // 2. City Grid Layout: Main intersecting avenues and streets
  // Avenue running horizontally across middle, Avenue running vertically
  const hRoadY = Math.round(height / 2);
  const hRoadWidth = 420; // 4-lane avenue
  const vRoadX = Math.round(width / 2);
  const vRoadWidth = 420; // 4-lane avenue

  // A. Concrete Sidewalk Belts
  const sidewalkPad = 120;
  drawSidewalk(bg, 0, hRoadY - hRoadWidth / 2 - sidewalkPad, width, hRoadWidth + sidewalkPad * 2);
  drawSidewalk(bg, vRoadX - vRoadWidth / 2 - sidewalkPad, 0, vRoadWidth + sidewalkPad * 2, height);

  // B. Asphalt Roads
  drawAsphaltRoad(bg, 0, hRoadY - hRoadWidth / 2, width, hRoadWidth, 'horizontal');
  drawAsphaltRoad(bg, vRoadX - vRoadWidth / 2, 0, vRoadWidth, height, 'vertical');

  // C. Road Markings & Intersection
  drawRoadMarkings(bg, width, height, hRoadY, hRoadWidth, vRoadX, vRoadWidth);

  // D. Sidewalk Curbs & Pavement Details
  drawSidewalkCurbs(bg, width, height, hRoadY, hRoadWidth, vRoadX, vRoadWidth);

  // E. Pavement Cracks, Blood Drags & Manholes
  drawUrbanStreetWear(bg, width, height, hRoadY, vRoadX);

  // F. Street Lights with Pre-baked Ground Glow
  drawStreetLights(bg, getCityStreetLights(width, height, hRoadY, vRoadX));

  // G. Static Obstacles: Buildings, Ruined Walls, and Abandoned Vehicles
  for (const obs of map.obstacles) {
    if (obs.type === 'car') {
      drawDetailedCar(bg, obs);
    } else if (obs.type === 'wall' || obs.type === 'building') {
      drawDestroyedBuilding(bg, obs);
    } else if (obs.type === 'barricade' || obs.type === 'sandbag') {
      drawBarricade(bg, obs);
    } else if (obs.type === 'crate') {
      drawCratesObstacle(bg, obs);
    } else {
      drawGenericObstacle(bg, obs);
    }
  }

  // H. Outer Boundary Reinforced Concrete Walls
  drawOuterBoundaryWalls(bg, width, height);
}

/**
 * Draws realistic weathered asphalt with cracks and texture.
 */
function drawAsphaltRoad(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  dir: 'horizontal' | 'vertical'
) {
  // Dark weathered asphalt
  ctx.fillStyle = '#181e29';
  ctx.fillRect(x, y, w, h);

  // Road surface noise/asphalt grain
  ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
  const step = 60;
  for (let px = x; px < x + w; px += step) {
    for (let py = y; py < y + h; py += step) {
      if ((px + py) % 120 === 0) {
        ctx.fillRect(px + 10, py + 15, 25, 25);
      }
    }
  }

  // Oil stains on asphalt
  ctx.fillStyle = 'rgba(10, 15, 25, 0.5)';
  ctx.beginPath();
  ctx.ellipse(x + w * 0.35, y + h * 0.4, 35, 20, 0.3, 0, Math.PI * 2);
  ctx.ellipse(x + w * 0.65, y + h * 0.6, 45, 28, -0.2, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draws concrete sidewalks with paving slab grooves.
 */
function drawSidewalk(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#242e3f'; // Weathered concrete tone
  ctx.fillRect(x, y, w, h);

  // Sidewalk slab tile grid
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.3)';
  ctx.lineWidth = 1.5;
  const slabSize = 50;
  for (let px = x; px < x + w; px += slabSize) {
    ctx.beginPath();
    ctx.moveTo(px, y);
    ctx.lineTo(px, y + h);
    ctx.stroke();
  }
  for (let py = y; py < y + h; py += slabSize) {
    ctx.beginPath();
    ctx.moveTo(x, py);
    ctx.lineTo(x + w, py);
    ctx.stroke();
  }
}

/**
 * Draws double yellow center lines, white lane dividers, crosswalk zebra stripes.
 */
function drawRoadMarkings(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  hRoadY: number,
  hRoadW: number,
  vRoadX: number,
  vRoadW: number
) {
  // --- HORIZONTAL ROAD MARKINGS ---
  // Double Yellow Center Lines
  ctx.strokeStyle = '#eab308'; // Weathered road yellow
  ctx.lineWidth = 3.5;
  ctx.setLineDash([24, 18]);

  // West side of intersection
  ctx.beginPath();
  ctx.moveTo(0, hRoadY - 4);
  ctx.lineTo(vRoadX - vRoadW / 2 - 40, hRoadY - 4);
  ctx.moveTo(0, hRoadY + 4);
  ctx.lineTo(vRoadX - vRoadW / 2 - 40, hRoadY + 4);
  // East side of intersection
  ctx.moveTo(vRoadX + vRoadW / 2 + 40, hRoadY - 4);
  ctx.lineTo(width, hRoadY - 4);
  ctx.moveTo(vRoadX + vRoadW / 2 + 40, hRoadY + 4);
  ctx.lineTo(width, hRoadY + 4);
  ctx.stroke();

  // White Outer Lane Dashes
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([20, 24]);
  // Upper lane
  ctx.beginPath();
  ctx.moveTo(0, hRoadY - hRoadW * 0.25);
  ctx.lineTo(vRoadX - vRoadW / 2 - 50, hRoadY - hRoadW * 0.25);
  ctx.moveTo(vRoadX + vRoadW / 2 + 50, hRoadY - hRoadW * 0.25);
  ctx.lineTo(width, hRoadY - hRoadW * 0.25);
  // Lower lane
  ctx.moveTo(0, hRoadY + hRoadW * 0.25);
  ctx.lineTo(vRoadX - vRoadW / 2 - 50, hRoadY + hRoadW * 0.25);
  ctx.moveTo(vRoadX + vRoadW / 2 + 50, hRoadY + hRoadW * 0.25);
  ctx.lineTo(width, hRoadY + hRoadW * 0.25);
  ctx.stroke();

  // --- VERTICAL ROAD MARKINGS ---
  // Double Yellow Center Lines
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 3.5;
  ctx.setLineDash([24, 18]);

  // North side of intersection
  ctx.beginPath();
  ctx.moveTo(vRoadX - 4, 0);
  ctx.lineTo(vRoadX - 4, hRoadY - hRoadW / 2 - 40);
  ctx.moveTo(vRoadX + 4, 0);
  ctx.lineTo(vRoadX + 4, hRoadY - hRoadW / 2 - 40);
  // South side of intersection
  ctx.moveTo(vRoadX - 4, hRoadY + hRoadW / 2 + 40);
  ctx.lineTo(vRoadX - 4, height);
  ctx.moveTo(vRoadX + 4, hRoadY + hRoadW / 2 + 40);
  ctx.lineTo(vRoadX + 4, height);
  ctx.stroke();

  // White Outer Lane Dashes (Vertical)
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([20, 24]);
  ctx.beginPath();
  // Left lane
  ctx.moveTo(vRoadX - vRoadW * 0.25, 0);
  ctx.lineTo(vRoadX - vRoadW * 0.25, hRoadY - hRoadW / 2 - 50);
  ctx.moveTo(vRoadX - vRoadW * 0.25, hRoadY + hRoadW / 2 + 50);
  ctx.lineTo(vRoadX - vRoadW * 0.25, height);
  // Right lane
  ctx.moveTo(vRoadX + vRoadW * 0.25, 0);
  ctx.lineTo(vRoadX + vRoadW * 0.25, hRoadY - hRoadW / 2 - 50);
  ctx.moveTo(vRoadX + vRoadW * 0.25, hRoadY + hRoadW / 2 + 50);
  ctx.lineTo(vRoadX + vRoadW * 0.25, height);
  ctx.stroke();

  // --- PEDESTRIAN CROSSWALKS (ZEBRA STRIPES) ---
  ctx.setLineDash([]);
  ctx.fillStyle = '#f1f5f9';
  const stripeW = 12;
  const stripeGap = 16;
  const crosswalkLen = 40;

  // West Crosswalk
  const wCrossX = vRoadX - vRoadW / 2 - 25;
  for (let py = hRoadY - hRoadW / 2 + 10; py < hRoadY + hRoadW / 2 - 10; py += stripeW + stripeGap) {
    ctx.fillRect(wCrossX - crosswalkLen / 2, py, crosswalkLen, stripeW);
  }

  // East Crosswalk
  const eCrossX = vRoadX + vRoadW / 2 + 25;
  for (let py = hRoadY - hRoadW / 2 + 10; py < hRoadY + hRoadW / 2 - 10; py += stripeW + stripeGap) {
    ctx.fillRect(eCrossX - crosswalkLen / 2, py, crosswalkLen, stripeW);
  }

  // North Crosswalk
  const nCrossY = hRoadY - hRoadW / 2 - 25;
  for (let px = vRoadX - vRoadW / 2 + 10; px < vRoadX + vRoadW / 2 - 10; px += stripeW + stripeGap) {
    ctx.fillRect(px, nCrossY - crosswalkLen / 2, stripeW, crosswalkLen);
  }

  // South Crosswalk
  const sCrossY = hRoadY + hRoadW / 2 + 25;
  for (let px = vRoadX - vRoadW / 2 + 10; px < vRoadX + vRoadW / 2 - 10; px += stripeW + stripeGap) {
    ctx.fillRect(px, sCrossY - crosswalkLen / 2, stripeW, crosswalkLen);
  }
}

/**
 * Concrete curbstones with raised 3D bevels.
 */
function drawSidewalkCurbs(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  hRoadY: number,
  hRoadW: number,
  vRoadX: number,
  vRoadW: number
) {
  ctx.fillStyle = '#475569';
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;

  const curbThick = 6;
  const topRoadEdge = hRoadY - hRoadW / 2;
  const btmRoadEdge = hRoadY + hRoadW / 2;
  const leftRoadEdge = vRoadX - vRoadW / 2;
  const rightRoadEdge = vRoadX + vRoadW / 2;

  // Horizontal Curbs (Top & Bottom)
  // NW corner
  ctx.fillRect(0, topRoadEdge - curbThick, leftRoadEdge, curbThick);
  // NE corner
  ctx.fillRect(rightRoadEdge, topRoadEdge - curbThick, width - rightRoadEdge, curbThick);
  // SW corner
  ctx.fillRect(0, btmRoadEdge, leftRoadEdge, curbThick);
  // SE corner
  ctx.fillRect(rightRoadEdge, btmRoadEdge, width - rightRoadEdge, curbThick);

  // Vertical Curbs (Left & Right)
  // NW corner
  ctx.fillRect(leftRoadEdge - curbThick, 0, curbThick, topRoadEdge);
  // SW corner
  ctx.fillRect(leftRoadEdge - curbThick, btmRoadEdge, curbThick, height - btmRoadEdge);
  // NE corner
  ctx.fillRect(rightRoadEdge, 0, curbThick, topRoadEdge);
  // SE corner
  ctx.fillRect(rightRoadEdge, btmRoadEdge, curbThick, height - btmRoadEdge);
}

/**
 * Manholes, street drainage grates, asphalt cracks, blood stains.
 */
function drawUrbanStreetWear(ctx: CanvasRenderingContext2D, width: number, height: number, hY: number, vX: number) {
  // Manhole Covers
  const manholes = [
    { x: vX - 120, y: hY - 100 },
    { x: vX + 130, y: hY + 110 },
    { x: vX - 450, y: hY + 80 },
    { x: vX + 500, y: hY - 90 },
  ];

  for (const mh of manholes) {
    // Outer iron rim
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(mh.x, mh.y, 16, 0, Math.PI * 2);
    ctx.fill();
    // Inner hatch pattern
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(mh.x, mh.y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Iron hatch grid
    ctx.strokeStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(mh.x - 9, mh.y);
    ctx.lineTo(mh.x + 9, mh.y);
    ctx.moveTo(mh.x, mh.y - 9);
    ctx.lineTo(mh.x, mh.y + 9);
    ctx.stroke();
  }

  // Asphalt Cracks
  ctx.strokeStyle = '#090d16';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(vX - 200, hY + 40);
  ctx.lineTo(vX - 170, hY + 60);
  ctx.lineTo(vX - 140, hY + 50);
  ctx.lineTo(vX - 110, hY + 75);
  ctx.moveTo(vX + 220, hY - 50);
  ctx.lineTo(vX + 260, hY - 30);
  ctx.lineTo(vX + 290, hY - 65);
  ctx.stroke();

  // Dark blood drag stains on asphalt
  ctx.fillStyle = 'rgba(88, 28, 28, 0.7)';
  ctx.beginPath();
  ctx.ellipse(vX + 80, hY - 60, 25, 8, 0.4, 0, Math.PI * 2);
  ctx.ellipse(vX - 90, hY + 80, 32, 10, -0.3, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Returns street lamp positions around sidewalks.
 */
function getCityStreetLights(w: number, h: number, hY: number, vX: number): StreetLight[] {
  const lights: StreetLight[] = [];
  const roadOffsets = [-220, 220];

  for (const off of roadOffsets) {
    // East-West avenue streetlights
    for (let x = 200; x <= w - 200; x += 350) {
      if (Math.abs(x - vX) < 180) continue; // Don't block intersection
      lights.push({
        x: x + 15,
        y: hY + off + (off > 0 ? 15 : -15),
        poleX: x,
        poleY: hY + off,
        color: '#fef08a',
        radius: 120,
      });
    }

    // North-South avenue streetlights
    for (let y = 200; y <= h - 200; y += 350) {
      if (Math.abs(y - hY) < 180) continue;
      lights.push({
        x: vX + off + (off > 0 ? 15 : -15),
        y: y + 15,
        poleX: vX + off,
        poleY: y,
        color: '#fef08a',
        radius: 120,
      });
    }
  }

  return lights;
}

/**
 * Draws street lights: metal base, curved arm, lamp lantern and pre-baked illumination pool.
 */
function drawStreetLights(ctx: CanvasRenderingContext2D, lights: StreetLight[]) {
  for (const l of lights) {
    // Pre-baked ambient light pool on ground
    const grad = ctx.createRadialGradient(l.x, l.y, 5, l.x, l.y, l.radius);
    grad.addColorStop(0, 'rgba(254, 240, 138, 0.16)');
    grad.addColorStop(0.5, 'rgba(253, 224, 71, 0.08)');
    grad.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(l.x, l.y, l.radius, 0, Math.PI * 2);
    ctx.fill();

    // Metal Pole Base
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(l.poleX, l.poleY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Curved Lamp Arm extending over sidewalk
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(l.poleX, l.poleY);
    ctx.lineTo(l.x, l.y);
    ctx.stroke();

    // Glowing Lamp Head Fixture
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(l.x, l.y, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

/**
 * Detailed 2D top-down Car renderer (Police Cruiser, Taxi, Civilian Sedan, Pickup).
 */
function drawDetailedCar(ctx: CanvasRenderingContext2D, obs: Obstacle) {
  const { x, y, width: w, height: h, carModel = 'sedan' } = obs;

  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);

  // Drop shadow under vehicle
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  ctx.roundRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, 8);
  ctx.fill();

  // Wheels / Rubber Tires (4 corners)
  const tireW = w * 0.18;
  const tireH = h * 0.22;
  ctx.fillStyle = '#090d16';
  ctx.fillRect(-w * 0.42, -h * 0.54, tireW, tireH); // Front-Left
  ctx.fillRect(-w * 0.42, h * 0.32, tireW, tireH);  // Front-Right
  ctx.fillRect(w * 0.24, -h * 0.54, tireW, tireH);  // Rear-Left
  ctx.fillRect(w * 0.24, h * 0.32, tireW, tireH);   // Rear-Right

  // Car Body Chassis
  let bodyColor = obs.color || '#334155';
  let roofColor = '#1e293b';

  if (carModel === 'police') {
    bodyColor = '#0f172a'; // Black & White police cruiser
    roofColor = '#f8fafc';
  } else if (carModel === 'taxi') {
    bodyColor = '#eab308'; // Yellow cab
    roofColor = '#ca8a04';
  } else if (carModel === 'pickup') {
    bodyColor = '#7c2d12'; // Rusted truck
    roofColor = '#451a03';
  }

  // Outer Body
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 6);
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Front Hood & Rear Trunk dividers
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-w * 0.25, -h / 2);
  ctx.lineTo(-w * 0.25, h / 2);
  ctx.moveTo(w * 0.25, -h / 2);
  ctx.lineTo(w * 0.25, h / 2);
  ctx.stroke();

  // Front Windshield (Glass)
  ctx.fillStyle = '#38bdf8'; // Tinted glass
  ctx.beginPath();
  ctx.roundRect(-w * 0.22, -h * 0.38, w * 0.15, h * 0.76, 3);
  ctx.fill();

  // Spiderweb crack on windshield
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-w * 0.18, -h * 0.1);
  ctx.lineTo(-w * 0.12, 0);
  ctx.lineTo(-w * 0.16, h * 0.15);
  ctx.stroke();

  // Rear Window (Glass)
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.roundRect(w * 0.14, -h * 0.36, w * 0.1, h * 0.72, 3);
  ctx.fill();

  // Cabin Roof
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.roundRect(-w * 0.08, -h * 0.4, w * 0.24, h * 0.8, 3);
  ctx.fill();

  // Police Light Bar (Red / Blue)
  if (carModel === 'police') {
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-w * 0.02, -h * 0.3, w * 0.08, h * 0.28);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(-w * 0.02, h * 0.02, w * 0.08, h * 0.28);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(-w * 0.02, -h * 0.3, w * 0.08, h * 0.6);
  }

  // Taxi Rooftop Sign
  if (carModel === 'taxi') {
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-w * 0.02, -h * 0.2, w * 0.08, h * 0.4);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(-w * 0.02, -h * 0.2, w * 0.08, h * 0.4);
  }

  // Headlights (Front of vehicle)
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(-w / 2, -h * 0.42, 3, h * 0.2);
  ctx.fillRect(-w / 2, h * 0.22, 3, h * 0.2);

  // Taillights (Rear of vehicle)
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(w / 2 - 3, -h * 0.42, 3, h * 0.2);
  ctx.fillRect(w / 2 - 3, h * 0.22, 3, h * 0.2);

  // Rust patches and bullet holes
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(-w * 0.35, -h * 0.2, 5, 0, Math.PI * 2);
  ctx.arc(w * 0.32, h * 0.15, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Destroyed Building / Ruined Concrete Structure with broken masonry and rubble.
 */
function drawDestroyedBuilding(ctx: CanvasRenderingContext2D, obs: Obstacle) {
  const { x, y, width: w, height: h } = obs;

  // Drop shadow around building walls
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(x + 8, y + 8, w, h);

  // Exterior weathered brick / industrial concrete
  ctx.fillStyle = obs.color || '#334155';
  ctx.fillRect(x, y, w, h);

  // Brick masonry lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = 1;
  const brickH = 16;
  const brickW = 32;
  for (let py = y; py < y + h; py += brickH) {
    ctx.beginPath();
    ctx.moveTo(x, py);
    ctx.lineTo(x + w, py);
    ctx.stroke();
  }

  // Inner Rooftop Area
  const wallBorder = 12;
  if (w > wallBorder * 2 && h > wallBorder * 2) {
    // Rooftop Gravel / Corrugated Tar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + wallBorder, y + wallBorder, w - wallBorder * 2, h - wallBorder * 2);

    // Rooftop Air Conditioning Unit / Vents
    if (w > 60 && h > 60) {
      ctx.fillStyle = '#475569';
      ctx.fillRect(x + wallBorder + 8, y + wallBorder + 8, 28, 22);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + wallBorder + 8, y + wallBorder + 8, 28, 22);

      // Fan Grill
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(x + wallBorder + 22, y + wallBorder + 19, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Heavy outer parapet border
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, h);

  // Ruined rubble debris spilling from corners
  ctx.fillStyle = '#64748b';
  ctx.fillRect(x - 6, y - 6, 12, 10);
  ctx.fillRect(x + w - 8, y + h - 8, 14, 12);
  ctx.fillStyle = '#475569';
  ctx.fillRect(x - 4, y + h - 4, 8, 8);
}

/**
 * Concrete highway barricade (Jersey barrier with hazard stripes).
 */
function drawBarricade(ctx: CanvasRenderingContext2D, obs: Obstacle) {
  const { x, y, width: w, height: h } = obs;

  // Concrete Barrier Body
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 4);
  ctx.fill();

  // Yellow & Black Hazard Chevron Stripes
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 4);
  ctx.clip();

  ctx.fillStyle = '#eab308';
  const stripeW = 16;
  for (let px = x - h; px < x + w + h; px += stripeW * 2) {
    ctx.beginPath();
    ctx.moveTo(px, y);
    ctx.lineTo(px + stripeW, y);
    ctx.lineTo(px + stripeW - h, y + h);
    ctx.lineTo(px - h, y + h);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Dark outline & impact bullet cracks
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
}

/**
 * Military wooden crate stack with metal brackets.
 */
function drawCratesObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle) {
  const { x, y, width: w, height: h } = obs;

  ctx.fillStyle = '#78350f'; // Dark wood
  ctx.fillRect(x, y, w, h);

  // Diagonal support beams
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y + h);
  ctx.moveTo(x + w, y);
  ctx.lineTo(x, y + h);
  ctx.stroke();

  // Metal Corner Brackets
  ctx.fillStyle = '#334155';
  const bracket = 6;
  ctx.fillRect(x, y, bracket, bracket);
  ctx.fillRect(x + w - bracket, y, bracket, bracket);
  ctx.fillRect(x, y + h - bracket, bracket, bracket);
  ctx.fillRect(x + w - bracket, y + h - bracket, bracket, bracket);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
}

/**
 * Generic structural obstacle fallback.
 */
function drawGenericObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle) {
  ctx.fillStyle = obs.color || '#334155';
  ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
}

/**
 * High-security perimeter wall framing the map.
 */
function drawOuterBoundaryWalls(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const wallThick = 50;

  // Concrete reinforced wall fill
  ctx.fillStyle = '#1e293b';
  // Top
  ctx.fillRect(0, 0, width, wallThick);
  // Bottom
  ctx.fillRect(0, height - wallThick, width, wallThick);
  // Left
  ctx.fillRect(0, 0, wallThick, height);
  // Right
  ctx.fillRect(width - wallThick, 0, wallThick, height);

  // Barbed wire / razor wire coils along top edge of wall
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);

  ctx.strokeRect(wallThick / 2, wallThick / 2, width - wallThick, height - wallThick);
  ctx.setLineDash([]);
}
