import query from './query'
import MATERIALS from './materials'

export default function replaceMaterial (materialData, overrides) {
  materialData.type = 'MeshLambertMaterial'
  materialData.shininess = 0

  if (materialData.name.indexOf('eye') !== -1) {
    materialData.name = 'Eyes_MAT'
  }

  // if (MATERIALS[materialData.name]) {
  //   console.info('[replaceMaterial] replacing material', materialData.name)
  // } else {
  //   console.warn('[replaceMaterial] unknown material', materialData.name)
  // }
  let debug = {}
  if (query.style && query.style === 'indie') {
    debug = {color: 0x111111, emissive: 0x000000}
  }
  Object.assign(materialData, MATERIALS[materialData.name], overrides, debug)
  delete materialData.specular
}
