import { describe,expect,it,beforeEach } from 'vitest'; import { loadLocations,saveLocations,makeLocation } from '../features/locations/storage';
beforeEach(()=>localStorage.clear());
describe('storage adapter',()=>{it('round trips locations',()=>{const x=makeLocation('A',1,2);saveLocations([x]);expect(loadLocations()[0].name).toBe('A')});it('ignores malformed JSON',()=>{localStorage.setItem('flood-alert.locations.v1','not-json');expect(loadLocations()).toEqual([])})});
