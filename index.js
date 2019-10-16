const r = 6371 // km - radius of the earth
const o = 35786 // km - altitude of the sat

const square = value => value * value
const toDegrees = radianValue => (radianValue * 360) / (Math.PI * 2)
const toRadians = degreesValue => (degreesValue * Math.PI * 2) / 360
const sgn = value => (value < 0 ? -1 : 1)

// works out the angle that the dish on the sat is pointed to
// in order to point to a given lat/lng
const calcSatLookAngle = (angle /* in radians */) => {
  const h = r - r * Math.cos(angle)
  const beamAngle =
    (o + h) / Math.sqrt(square(o + h) + square(r * Math.sin(angle)))
  return Math.acos(beamAngle) * sgn(angle)
}

const calcEarthDeg = satLookAngle => {
  const x1 = o + r
  const y1 = 0
  const x2 = 0
  const y2 = x1 * Math.tan(satLookAngle)

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

module.exports.getBeam = (lng, lat, beamRadiusAtEarthsSurfaceKm, numberOfPoints = 50) => {
  const lookAngleX = calcSatLookAngle(toRadians(lng))
  const lookAngleY = calcSatLookAngle(toRadians(lat))
  const spreadAngle = Math.atan2(beamRadiusAtEarthsSurfaceKm, o)

  const points = []
  for (let i = 0; i <= numberOfPoints; i++) {
    const phi = (i * Math.PI * 2) / numberOfPoints
    const thetaX = lookAngleX + spreadAngle * Math.sin(phi)
    const thetaY = lookAngleY + spreadAngle * Math.cos(phi)

    const point = {
      lat: toDegrees(calcEarthDeg(thetaY)),
      lng: toDegrees(calcEarthDeg(thetaX))
    }

    if (Number.isNaN(point.lat) || Number.isNaN(point.lng)) continue
    points.push(point)
  }

  return points
}
