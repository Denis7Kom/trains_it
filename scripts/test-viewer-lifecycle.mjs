import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pages, root } from './site-tools.mjs';

function resource() {
  return {
    calls: 0,
    dispose() {
      this.calls++;
    },
  };
}

for (const page of pages) {
  const source = await readFile(new URL(page, root), 'utf8');
  const start = source.indexOf('  function destroyAssembly() {');
  const end = source.indexOf('  const shadowCanvas', start);
  assert(start >= 0 && end > start, `${page}: viewer cleanup not found`);
  const mapped = { ...resource(), map: resource() };
  const glass = { ...resource(), map: null };
  const station = { ...resource(), map: resource() };
  const retainedGeometry = resource();
  const trainGeometry = resource();
  const fixed = resource();
  const trainMaterial = resource();
  const instances = { ...resource(), isInstancedMesh: true };
  const model = { traverse: (visit) => visit(instances) };
  const removed = [];
  const renderLists = resource();
  const environment = {
    model,
    assembly: { remove: (item) => removed.push(item) },
    ownedGeometries: new Set([retainedGeometry, trainGeometry]),
    stationGeometries: new Set([retainedGeometry]),
    geometryCache: new Map([['train', trainGeometry]]),
    textureCache: new Map([
      ['body-atlas', mapped],
      ['passenger-glass/fr1000', glass],
      ['station-sign', station],
    ]),
    stationTextures: new Set([station]),
    materialCache: new Map([
      ['fixed', fixed],
      ['station', station],
      ['train', trainMaterial],
    ]),
    fixedMaterials: new Set([fixed]),
    stationMaterials: new Set([station]),
    renderer: { renderLists },
  };
  const cleanup = new Function(
    ...Object.keys(environment),
    `${source.slice(start, end)}; return destroyAssembly;`,
  )(...Object.values(environment));
  cleanup();
  assert.equal(glass.calls, 1, `${page}: untextured passenger glass must be released`);
  assert.equal(mapped.calls, 1);
  assert.equal(mapped.map.calls, 1);
  assert.equal(station.calls, 0);
  assert.equal(station.map.calls, 0);
  assert.equal(retainedGeometry.calls, 0);
  assert.equal(trainGeometry.calls, 1);
  assert.equal(instances.calls, 1);
  assert.equal(trainMaterial.calls, 1);
  assert.equal(fixed.calls, 0);
  assert.equal(renderLists.calls, 1);
  assert.deepEqual(removed, [model]);
  assert.equal(environment.geometryCache.size, 0);
  assert.deepEqual([...environment.textureCache.keys()], ['station-sign']);
  assert.deepEqual([...environment.ownedGeometries], [retainedGeometry]);
  console.log(`${page}: textured/untextured cleanup and station retention pass`);
}
