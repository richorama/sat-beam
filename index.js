const r = 6371 // km - radius of the earth
const o = 35786 // km - altitude of the sat

const square = value => value * value
const toDegrees = radianValue => (radianValue * 360) / (Math.PI * 2)
const toRadians = degreesValue => (degreesValue * Math.PI * 2) / 360
const sgn = value => (value < 0 ? -1 : 1)

// works out the angle that the dish on the sat is pointed to
// in order to point to a given lat/lng
const calc_sat_look_angle = (angle /* in radians */) => {
  const h = r - r * Math.cos(angle)
  const beam_angle =
    (o + h) / Math.sqrt(square(o + h) + square(r * Math.sin(angle)))
  return Math.acos(beam_angle) * sgn(angle)
}

const calc_earth_deg = sat_look_angle => {
  const x1 = o + r
  const y1 = 0
  const x2 = 0
  const y2 = x1 * Math.tan(sat_look_angle)

  const dx = x2 - x1
  const dy = y2 - y1
  const dr = Math.sqrt(square(dx) + square(dy))
  const D = x1 * y2 - x2 * y1

  const common = Math.sqrt(square(r) * square(dr) - square(D))
  const xa = (D * dy + sgn(dy) * dx * common) / square(dr)
  const xb = (D * dy - sgn(dy) * dx * common) / square(dr)
  const ya = (-D * dx + Math.abs(dy) * common) / square(dr)
  const yb = (-D * dx - Math.abs(dy) * common) / square(dr)

  // always return the nearest intersection
  return xa > xb ? Math.atan2(ya, xa) : Math.atan2(yb, xb)
}

const get_beam = (lat, lng, spread_at_earths_surface, numberOfPoints = 50) => {
  const look_angle_x = calc_sat_look_angle(toRadians(lng))
  const look_angle_y = calc_sat_look_angle(toRadians(lat))
  const spread_angle = Math.atan2(spread_at_earths_surface, o)

  const points = []
  for (let i = 0; i <= numberOfPoints; i++) {
    const phi = (i * Math.PI * 2) / numberOfPoints
    const theta_x = look_angle_x + spread_angle * Math.sin(phi)
    const theta_y = look_angle_y + spread_angle * Math.cos(phi)

    const point = {
      lat: toDegrees(calc_earth_deg(theta_y)),
      lng: toDegrees(calc_earth_deg(theta_x))
    }

    if (Number.isNaN(point.lat) || Number.isNaN(point.lng)) continue
    points.push(point)
  }

  return points
}
