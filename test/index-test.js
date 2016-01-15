import mocha from 'mocha';
import chai from 'chai';

const describe = mocha.describe;
const it       = mocha.it;
const expect   = chai.expect;

import FalcorModule from '../index';

describe('FalcorModule', () => {
  expect(FalcorModule()).to.be.ok
});
