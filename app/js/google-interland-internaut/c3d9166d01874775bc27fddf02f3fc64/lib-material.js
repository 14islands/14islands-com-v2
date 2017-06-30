var imagePath = ''

module.exports = new Materials()

function Materials () {
  this._textureTable = {}
  this._materialTable = {}
}

var p = Materials.prototype

p.addTextureList = function (list) {
  for (var key in list) {
    this._textureTable[key] = list[key]
  }
}

p.addTexture = function (id, image) {
  // new Texture( image, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding )
  let texture = new THREE.Texture(image)
  texture.needsUpdate = true
  this._textureTable[id] = texture

  return texture
}

p.init = function (assets) {
  this.assets = assets
}

p.add = function (id, material) {
  this._materialTable[id] = material
}

p.has = function (id) {
  return this._materialTable.hasOwnProperty(id)
}

p.get = function (id) {
  if (this._materialTable.hasOwnProperty(id)) {
    return this._materialTable[id]
  } else {
    console.warn('Could not find material with id: ' + id)
  }
}

p.getTexture = function (id) {
  if (this._textureTable.hasOwnProperty(imagePath + id)) {
    return this._textureTable[imagePath + id]
  } else {
    console.warn('Could not find texture with id: ' + id)
  }
}

p.dispose = function () {
  for (var id in this._materialTable) {
    var material = this._materialTable[id]

    if (material.length) {
      for (var i = material.length - 1; i >= 0; i--) {
        material[i].dispose()
      }
    } else if (material instanceof THREE.MeshFaceMaterial) {
      for (var j = material.materials.length - 1; j >= 0; j--) {
        material.materials[j].dispose()
      }
    }

    try {
      material.dispose()
    } catch (error) {}
  }

  for (var texture in this._textureTable) {
    this._textureTable[texture].dispose()
  }

  this._textureTable = {}
  this._materialTable = {}
}
