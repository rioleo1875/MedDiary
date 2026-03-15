const parse = require('./services/parseLabReport');

(async () => {
  try {
    const res = await parse('Hemoglobin 13.5 g/dL 13.0 - 17.0', 1);
    console.log(res);
  } catch (e) {
    console.error('ERROR', e);
  }
})();
