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

let internaut
let scene
let renderer
let camera
let lookAt = new THREE.Object3D()
lookAt.position.z = 25

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

const init = () => {
  // create scene
  scene = new THREE.Scene()
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
	renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
	renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.gammaInput = false
  renderer.gammaOutput = false
  renderer.physicallyBasedShading = false
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setPixelRatio(window.devicePixelRatio)
	
  // add rendered canvas
  document.querySelector('.js-interland').appendChild( renderer.domElement );
  
  camera.position.z = 25;
  camera.position.y = 17;
  camera.lookAt(new THREE.Vector3(0, 8, 0))
  
  // add internaut
  internaut = new Internaut()
  scene.add(internaut.mesh)
  internaut.mesh.scale.setScalar(0.3)
  
  // button
  document.querySelector('.js-interland').addEventListener('click', (e) => {
    const anim = getRandomAnimation()
    console.log('trigger', anim)
  	internaut.triggerAnimation(anim)
	})

  initLights()
  initLookAt()
  render()
}

const clock = new THREE.Clock()
function render() {
  window.requestAnimationFrame(render)
  const delta = 1000/60/1000 //clock.getDelta()
	internaut.update(delta)
  renderer.render( scene, camera );
} 

function initLookAt() {
	internaut.updateLookAt(lookAt)
  window.addEventListener('mousemove', (e) => {
    const x = mathutil.normalize(e.clientX, 0, window.innerWidth)
    const y = mathutil.normalize(e.clientY, 0, window.innerHeight)
    const lookX = mathutil.interpolate(x, -10, 10)
    const lookY = mathutil.interpolate(y, -50, 20)
    lookAt.position.x = lookX
    lookAt.position.y = lookY
  })
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

// load assets before init
loadAsset('internaut', './internaut.json')
  .then(() => loadAsset('internaut_anim_idle', './internaut_anim_idle.json'))
	.then(() => loadAsset('internaut_anim_look', './internaut_anim_look.json'))
	.then(() => loadAsset('internaut_anim_wiggle', './internaut_anim_wiggle.json'))
	.then(() => loadAsset('internaut_anim_report', './internaut_anim_report.json'))
	.then(() => loadAsset('internaut_anim_superhappytrigger', './internaut_anim_superhappytrigger.json'))
	.then(() => loadAsset('internaut_anim_wrongreported', './internaut_anim_wrongreported.json'))
	.then(() => loadAsset('internaut_anim_bouncewall', './internaut_anim_bouncewall.json'))
  .then(init)


