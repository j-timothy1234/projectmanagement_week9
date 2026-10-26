export const money = (number) => 'UGX ' + Math.round(number).toLocaleString('en-UG');

export function calculate(data) {
  const gap = data.actual - data.planned;
  const simpleCV = data.plannedCost - data.actualCost;
  const pv = (data.budget * data.planned) / 100;
  const ev = (data.budget * data.actual) / 100;
  const ac = data.actualCost;

  return {
    gap,
    simpleCV,
    pv,
    ev,
    ac,
    sv: ev - pv,
    cv: ev - ac,
    spi: pv > 0 ? ev / pv : null,
    cpi: ac > 0 ? ev / ac : null,
    scope: data.due > 0 ? (100 * data.done) / data.due : null,
  };
}

export const signed = (number, unit = '') =>
  (number > 0 ? '+' : '') + number.toFixed(1) + unit;
