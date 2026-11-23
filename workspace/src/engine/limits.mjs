import irs2027 from '../data/irs/2027.json' with { type: 'json' };

export function getLimitInfo({ ageAtYearEnd, year }) {
  let limit = irs2027.employeeDeferral;
  if (ageAtYearEnd >= 60 && ageAtYearEnd <= 63) {
    limit += irs2027.catchUp60to63;
  } else if (ageAtYearEnd >= 50) {
    limit += irs2027.catchUp50;
  }
  return { limit, assumed: year !== irs2027.year };
}

export function getDeferralLimit({ ageAtYearEnd, year }) {
  return getLimitInfo({ ageAtYearEnd, year }).limit;
}
