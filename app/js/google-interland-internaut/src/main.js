import globalAssets from './global-assets'
import Internaut from './internaut'
import * as settings from './settings'
import mathutil from './mathutil'
import * as ANIMATIONS from './animations'

const loadAsset = (name, file) => {
  return fetch(file)
    .then(
      function(response) {
        return response.json().then(function(data) {
          globalAssets.addJSON( {[name]:data} )
        });
      }
    )
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
    });
}

let width
let height
let internaut
let scene
let renderer
let camera
let lookAt = new THREE.Object3D()
let contextEl
// const clock = new THREE.Clock()
let isRendering = false

const animations = [
	ANIMATIONS.INTERNAUT_WIGGLE,
  ANIMATIONS.INTERNAUT_SUPERHAPPYTRIGGER,
  ANIMATIONS.INTERNAUT_BOUNCEWALL,
  ANIMATIONS.INTERNAUT_REPORT,
  ANIMATIONS.INTERNAUT_WRONGREPORTED
]
function getRandomAnimation () {
  const randomIndex = Math.floor(Math.random() * animations.length)
  return animations[randomIndex]
}


const init = (el) => {
  contextEl = el

  // create scene
  scene = new THREE.Scene()
	camera = new THREE.PerspectiveCamera( 45, width / height, 0.1, 1000 );
	renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
	renderer.setSize( width, height );
  renderer.gammaInput = false
  renderer.gammaOutput = false
  renderer.physicallyBasedShading = false
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setPixelRatio(window.devicePixelRatio)

  // add rendered canvas
  contextEl.appendChild(renderer.domElement)

  camera.position.z = 25;
  camera.position.y = 17;
  camera.lookAt(new THREE.Vector3(0, 8, 0))

  // add internaut
  internaut = new Internaut()
  scene.add(internaut.mesh)
  internaut.mesh.scale.setScalar(0.3)

  // button
  contextEl.addEventListener('click', triggerAnimation)

  // resize
  resize()
  window.addEventListener('resize', resize)

  initLights()
  initLookAt()
}

function resize () {
  width = contextEl.clientWidth
  height = contextEl.clientHeight
  renderer.setSize(width, height)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

function startRender () {
  isRendering = true
  render()
}
function stopRender () {
  isRendering = false
}
function render () {
  if (isRendering) {
    window.requestAnimationFrame(render)
  }
  const delta = 1000 / 60 / 1000 // clock.getDelta()
  internaut.update(delta)
  renderer.render(scene, camera)
}

function triggerAnimation () {
  const anim = getRandomAnimation()
  internaut.triggerAnimation(anim)
}

function initLookAt () {
  lookAt.position.z = 25
  internaut.updateLookAt(lookAt)
  window.addEventListener('mousemove', onMouseMoveLookAt)
}

function onMouseMoveLookAt (e) {
  const x = mathutil.normalize(e.clientX, 0, width)
  const y = mathutil.normalize(e.clientY, 0, height)
  const lookX = mathutil.interpolate(x, -10, 10)
  const lookY = mathutil.interpolate(y, -50, 20)
  lookAt.position.x = lookX
  lookAt.position.y = lookY
}

function initLights () {
  const dirColor = new THREE.Color(settings.dirLightColor)
  const _dirLight = new THREE.DirectionalLight(dirColor, settings.dirLightIntensity)
  _dirLight.position.set(6, 7, 4)
  _dirLight.position.normalize()

  if (false) {
    _dirLight.castShadow = true
    _dirLight.shadow.camera.left = -SCENE_SIZE_PX * 0.75
    _dirLight.shadow.camera.right = SCENE_SIZE_PX * 0.7
    _dirLight.shadow.camera.top = SCENE_SIZE_PX * 0.5
    _dirLight.shadow.camera.bottom = -SCENE_SIZE_PX * 0.5
    _dirLight.shadow.camera.near = -SCENE_SIZE_PX * 0.5
    _dirLight.shadow.camera.far = SCENE_SIZE_PX * 0.55
  }

  // define the resolution of the shadow the higher the better,
  // but also the more expensive and less performant
  _dirLight.shadow.mapSize.width = 1024 * 1
  _dirLight.shadow.mapSize.height = 1024 * 1
  scene.add(_dirLight)

  // debug light
  //if (query.debugCamera) {
  //  this.scene.add(new THREE.CameraHelper(_dirLight.shadow.camera))
  //}

  // lighten shadow using ambient light
  const ambientColor = new THREE.Color(settings.ambientLightColor) // .convertGammaToLinear()
  const _ambientLight = new THREE.AmbientLight(ambientColor, settings.ambientLightIntensity)
  scene.add(_ambientLight)
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

function destroy () {
  stopRender()
  renderer.dispose()
  disposeScene(scene)
  contextEl.removeEventListener('click', triggerAnimation)
  window.removeEventListener('mousemove', onMouseMoveLookAt)
}

function onLoaded () {
  // expose init function for 14islands.com
  FOURTEEN.InterlandInternaut = {
    init,
    destroy,
    startRender,
    stopRender,
    triggerAnimation
  }

  // notify 14islands.com that we loaded
  FOURTEEN.onInterlandInternautLoaded && FOURTEEN.onInterlandInternautLoaded()
}

// load assets before init
loadAsset('internaut', '/js/google-interland-internaut/data/internaut.json')
  .then(() => loadAsset('internaut_anim_idle', '/js/google-interland-internaut/data/internaut_anim_idle.json'))
	.then(() => loadAsset('internaut_anim_look', '/js/google-interland-internaut/data/internaut_anim_look.json'))
	.then(() => loadAsset('internaut_anim_wiggle', '/js/google-interland-internaut/data/internaut_anim_wiggle.json'))
	.then(() => loadAsset('internaut_anim_report', '/js/google-interland-internaut/data/internaut_anim_report.json'))
	.then(() => loadAsset('internaut_anim_superhappytrigger', '/js/google-interland-internaut/data/internaut_anim_superhappytrigger.json'))
	.then(() => loadAsset('internaut_anim_wrongreported', '/js/google-interland-internaut/data/internaut_anim_wrongreported.json'))
	.then(() => loadAsset('internaut_anim_bouncewall', '/js/google-interland-internaut/data/internaut_anim_bouncewall.json'))
  .then(onLoaded)
