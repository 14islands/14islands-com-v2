import EventEmitter from 'eventemitter3'

class GlobalAssets extends EventEmitter {

  constructor () {
    super()
    console.log('created global assets class')

    this.isLoaded = false

    this.library = {}
    this.library.materials = new Map()
    this.library.json = new Map()
    this.library.animations = new Map()
    this.library.fonts = new Map()
  }

  getFont (id) {
    if (this.library.fonts.has(id)) {
      return this.library.fonts.get(id)
    } else {
      console.warn('can\'t find Font with id: ' + id)
      return null
    }
  }

  getJSON (id) {
    if (this.library.json.has(id)) {
      return this.library.json.get(id)
    } else {
      console.warn('can\'t find JSON with id: ' + id)
      return null
    }
  }

  addJSON (json) {
    this.isLoaded = true
    for (let key in json) {
      this.library.json.set(key, json[key])

      if (key.includes('font')) {
        this.library.fonts.set(key, new THREE.Font(json[key]))
      }
    }
  }

  addMaterial (id, material) {
    this.library.materials.set(id, material)
  }

  getMaterial (id) {
    if (this.library.materials.has(id)) {
      return this.library.materials.get(id)
    } else {
      return null
    }
  }

  addAnimation (id, animation) {
    this.library.animations.set(id, animation)
  }

  getAnimation (id) {
    if (this.library.animations.has(id)) {
      return this.library.animations.get(id)
    } else {
      return null
    }
  }

  clearAnimations () {
    this.library.animations.clear()
  }

  hasAnimation (id) {
    return this.library.animations.has(id)
  }

  dispose () {
    this.library.materials.clear()
    this.library.json.clear()
    this.library.animations.clear()
  }

}

export default new GlobalAssets()
