import globalAssets from './global-assets'
import Internaut from './internaut'
import Shouter from './shouter'
import * as settings from './settings'
import mathutil from './mathutil'
import * as ANIMATIONS from './animations'

const loadAsset = (name, file) => {
  return $.getJSON(file).then((data) => {
    globalAssets.addJSON({[name]: data})
  })
}

const internautAnimations = [
  ANIMATIONS.INTERNAUT_WIGGLE,
  ANIMATIONS.INTERNAUT_SUPERHAPPYTRIGGER,
  ANIMATIONS.INTERNAUT_BOUNCEWALL,
  ANIMATIONS.INTERNAUT_REPORT,
  ANIMATIONS.INTERNAUT_WRONGREPORTED
]

const shouterAnimations = [
  ANIMATIONS.SHOUTER_SPIN,
  ANIMATIONS.SHOUTER_LAUGH
]

function getRandomAnimation (animations) {
  const randomIndex = Math.floor(Math.random() * animations.length)
  return animations[randomIndex]
}

function disposeScene (scene) {
  var rmArray = []

  scene.traverse(function (object) {
    rmArray.push(object)
  })

  for (let i = 0; i < rmArray.length; i++) {
    let o = rmArray[i]
    disposeObjectFromScene(o, scene)
  }

  rmArray.length = 0
}

function disposeObjectFromScene (o, scene) {
  if (!o) {
    return
  }
  try {
    o.world = null

    if (o.parent) {
      o.parent.remove(o)
    } else {
      scene.remove(o)
    }

    if (o.geometry) {
      o.geometry.dispose()
    }

    if (o.material instanceof THREE.MultiMaterial) {
      for (let j = 0; j < o.material.materials.length; j++) {
        o.material.materials[j].dispose()
      }
    } else if (o.material) {
      o.material.dispose()
    }
  } catch (error) {
    console.log('error disposing', error)
  }
}


class CharacterAnimation {
  constructor (CharacterClass, animations, positionY = 0, scale = 1) {
    this.CharacterClass = CharacterClass
    this.animations = animations
    this.positionY = positionY
    this.scale = scale

    this.width = undefined
    this.height = undefined
    this.scene = undefined
    this.renderer = undefined
    this.camera = undefined
    this.el = undefined
    this.isRendering = false
    this.lookAt = new THREE.Object3D()
    this.lookAt.position.z = 25
    // const clock = new THREE.Clock()

    this.render = this.render.bind(this)
    this.resize = this.resize.bind(this)
    this.onMouseMoveLookAt = this.onMouseMoveLookAt.bind(this)
    this.triggerAnimation = this.triggerAnimation.bind(this)
  }
  init (el) {
    this.el = el
    this.character = new this.CharacterClass()

    console.log('CHARACTER: init', el)

    // create scene
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true})
    this.renderer.setSize(this.width, this.height)
    this.renderer.gammaInput = false
    this.renderer.gammaOutput = false
    this.renderer.setPixelRatio(window.devicePixelRatio)

    // add rendered canvas
    $(this.el).empty() // remove any weird left-overs on back button
    this.el.appendChild(this.renderer.domElement)

    this.camera.position.z = 25
    this.camera.position.y = 17
    this.camera.lookAt(new THREE.Vector3(0, 8, 0))

    // add internaut
    this.scene.add(this.character.mesh)
    this.character.mesh.scale.setScalar(this.scale)
    this.character.mesh.position.y = this.positionY

    // button
    this.el.addEventListener('click', this.triggerAnimation)

    // resize
    this.resize()
    window.addEventListener('resize', this.resize)

    this.initLights()
    this.initLookAt()
  }
  initLookAt () {
    this.character.updateLookAt(this.lookAt)
    window.addEventListener('mousemove', this.onMouseMoveLookAt)
  }
  initLights () {
    const dirColor = new THREE.Color(settings.dirLightColor)
    const _dirLight = new THREE.DirectionalLight(dirColor, settings.dirLightIntensity)
    _dirLight.position.set(6, 7, 4)
    _dirLight.position.normalize()
    this.scene.add(_dirLight)
    // lighten shadow using ambient light
    const ambientColor = new THREE.Color(settings.ambientLightColor) // .convertGammaToLinear()
    const _ambientLight = new THREE.AmbientLight(ambientColor, settings.ambientLightIntensity)
    this.scene.add(_ambientLight)
  }
  onMouseMoveLookAt (e) {
    const x = mathutil.normalize(e.clientX, 0, this.width)
    const y = mathutil.normalize(e.clientY, 0, this.height)
    const lookX = mathutil.interpolate(x, -10, 10)
    const lookY = mathutil.interpolate(y, -50, 20)
    this.lookAt.position.x = lookX
    this.lookAt.position.y = lookY
  }
  resize () {
    this.width = this.el.clientWidth
    this.height = this.el.clientHeight
    this.renderer.setSize(this.width, this.height)
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
  }
  startRender () {
    if (!this.isRendering) {
      this.isRendering = true
      this.render()
    }
  }
  stopRender () {
    this.isRendering = false
  }
  render () {
    if (this.isRendering) {
      window.requestAnimationFrame(this.render)
    }
    if (this.character && this.renderer) {
      const delta = 1000 / 60 / 1000 // clock.getDelta()
      this.character.update(delta)
      this.renderer.render(this.scene, this.camera)
    }
  }
  triggerAnimation () {
    const anim = getRandomAnimation(this.animations)
    this.character && this.character.triggerAnimation(anim)
  }
  destroy () {
    this.stopRender()
    this.el.removeChild(this.renderer.domElement)
    this.renderer.dispose()
    disposeScene(this.scene)
    this.scene = undefined
    this.renderer = undefined
    this.camera = undefined
    this.character = undefined
    this.el.removeEventListener('click', this.triggerAnimation)
    window.removeEventListener('mousemove', this.onMouseMoveLookAt)
    window.removeEventListener('resize', this.resize)
  }
}

function onInternautLoaded () {
  // expose init function for 14islands.com
  FOURTEEN.InterlandInternaut = new CharacterAnimation(Internaut, internautAnimations, -0.5, 0.3)
  // notify 14islands.com that we loaded
  FOURTEEN.onInterlandInternautLoaded && FOURTEEN.onInterlandInternautLoaded()
}

function onShouterLoaded () {
  // expose init function for 14islands.com
  FOURTEEN.InterlandShouter = new CharacterAnimation(Shouter, shouterAnimations, -2.5, 0.28)
  // notify 14islands.com that we loaded
  FOURTEEN.onInterlandShouterLoaded && FOURTEEN.onInterlandShouterLoaded()
}

// load assets before init
loadAsset('internaut', '/js/bundles/interland/data/internaut.json')
  .then(() => loadAsset('internaut_anim_idle', '/js/bundles/interland/data/internaut_anim_idle.json'))
  .then(() => loadAsset('internaut_anim_look', '/js/bundles/interland/data/internaut_anim_look.json'))
  .then(() => loadAsset('internaut_anim_wiggle', '/js/bundles/interland/data/internaut_anim_wiggle.json'))
  .then(() => loadAsset('internaut_anim_report', '/js/bundles/interland/data/internaut_anim_report.json'))
  .then(() => loadAsset('internaut_anim_superhappytrigger', '/js/bundles/interland/data/internaut_anim_superhappytrigger.json'))
  .then(() => loadAsset('internaut_anim_wrongreported', '/js/bundles/interland/data/internaut_anim_wrongreported.json'))
  .then(() => loadAsset('internaut_anim_bouncewall', '/js/bundles/interland/data/internaut_anim_bouncewall.json'))
  .then(onInternautLoaded)

loadAsset('shouter', '/js/bundles/interland/data/shouter.json')
  .then(() => loadAsset('shouter_anim_idle', '/js/bundles/interland/data/shouter_anim_idle.json'))
  .then(() => loadAsset('shouter_anim_laugh', '/js/bundles/interland/data/shouter_anim_laugh.json'))
  .then(() => loadAsset('shouter_anim_spin', '/js/bundles/interland/data/shouter_anim_spin.json'))
  .then(onShouterLoaded)
