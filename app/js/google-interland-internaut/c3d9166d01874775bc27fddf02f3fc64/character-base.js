import globalAssets from './global-assets'
import libMaterial from './lib-material'
import * as Animations from './animations'
import replaceMaterial from './replace-material'
import query from './query'
import EventEmitter from 'eventemitter3'

export const CharacterType = {
  INTERNAUT: 'internaut',
  BULLY: 'bully',
  PHISHER: 'phisher',
  SHOUTER: 'shouter',
  HACKER: 'hacker'
}

export const AnimationState = {
  IDLE: 'idle',
  FOLLOW_ICON: 'followIcon',
  JUMP: 'jump',
  CLIP: 'clip',
  ANIMATED: 'animated'
}

const flatten = arr => arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), [])

export default class CharacterBase extends EventEmitter {
  constructor () {
    super()
    // first defaults
    this.useConvertGammaToLinear = false

    this.onClipAnimationComplete = this.onClipAnimationComplete.bind(this)
    this.onClipAnimationLoop = this.onClipAnimationLoop.bind(this)

    this.characterJSON = null

    this.randomSeed = Math.random() * 5000
    this.currentIdleName = 'idle'
    this.isCrossFading = false
    this.animationList = new Set()

    this.rig = {}
    this.timeScale = 0.6
    this.shouldLookAt = false
    // reusing these vector3 to avoid garbage
    this.upX = new THREE.Vector3(1, 0, 0)
    this.upMinusX = new THREE.Vector3(-1, 0, 0)
    this.upZ = new THREE.Vector3(0, 0, 1)
    this.upMinusZ = new THREE.Vector3(0, 0, -1)
    this.upY = new THREE.Vector3(0, 1, 0)
    this.upMinusY = new THREE.Vector3(0, -1, 0)
    this.tempVector3 = new THREE.Vector3()
    this.tempWorldPos = new THREE.Vector3()
    this.tempWorldPos2 = new THREE.Vector3()
    this.lastPosition = new THREE.Vector3()
    this.velocity = new THREE.Vector3()
    this.lookAtPosition = new THREE.Vector3()

    this.currentAnimation = null

    this.canBlink = true
    this.nextBlink = Date.now() + this.randomSeed + 300
    this.blinkStart = 0
    this.isBlinking = false

    this.slidingAlongWall = 0

    this.tempQuaternion = new THREE.Quaternion()
    this.interpolateQuaternion = new THREE.Quaternion()

    this.randomJumpFactor = 0

    let defaultLookAtTarget = new THREE.Object3D()
    this.lookAtObject = defaultLookAtTarget
  }

  parseConfigAnimationKeys (values) {
    let keys = []

    if (values) {
      keys.push(values)
    }

    let allAnimationKeys = flatten(keys)

    allAnimationKeys.forEach(x => {
      this.animationList.add(x)
    })
  }

  setState (state) {
    this.animationState = state
  }

  createMesh () {
    let objectLoader = new THREE.ObjectLoader()

    // this.animationState = AnimationState.IDLE

    for (let i = 0; i < this.characterJSON.materials[0].materials.length; i++) {
      let mat = this.characterJSON.materials[0].materials
      replaceMaterial(mat[i], {skinning: true, fresnelPower: 3, fresnelIntensity: 0.2})
    }

    let obj = objectLoader.parse(this.characterJSON)
    obj.children[0].geometry.computeFlatVertexNormals()
    obj.children[0].geometry.sortFacesByMaterialIndex()

    this.skinnedMesh = obj.children[0]

    if (query.style && query.style === 'indie') {

    } else {
      this.setColors()
    }

    this.mixer = new THREE.AnimationMixer(this.skinnedMesh)
    this.mixer.addEventListener('finished', this.onClipAnimationComplete)
    this.mixer.addEventListener('loop', this.onClipAnimationLoop)

    this.initAnimations(obj.children[0])

    this.mesh = new THREE.Object3D()
    this.mesh.add(this.skinnedMesh)
    this.skinnedMesh.scale.set(0.45, 0.45, 0.45)

    this.skinnedMesh.castShadow = true
    this.skinnedMesh.receiveShadow = true

    this.initRig()
    this.createEyes()
  }

  createEyes () {
    if (!libMaterial.has('eyes')) {
      libMaterial.add('eyes', new THREE.MeshBasicMaterial({color: (query && query.style === 'indie') ? 0xffffff : 0x000000}))
    }

    this.skinnedMesh.traverse(object => {
      if (object.name.toLowerCase().indexOf('eye') !== -1 && object.name.indexOf('eyeLid') === -1) {
        let eyeMesh = new THREE.Mesh(new THREE.CircleGeometry(this.characterType === CharacterType.INTERNAUT ? 2.5 : 3.5, 10, 0, Math.PI * 2), libMaterial.get('eyes'))

        if (this.characterType === CharacterType.HACKER) {
          eyeMesh.rotation.x += 0.96 * Math.PI
          eyeMesh.position.z -= 3
          eyeMesh.position.x -= 0.6
        } else {
          eyeMesh.rotation.x += Math.PI
          eyeMesh.position.z -= 1
        }

        object.add(eyeMesh)
      }
    })
  }

  // override this
  setColors (colorScheme) {
    if (query.style && query.style === 'replaced') {
      return
    }

    this.skinnedMesh.material.materials[0].color.setHex(this.colorScheme.mainColor)
    this.skinnedMesh.material.materials[0].emissive.setHex(this.colorScheme.mainEmissive)
    this.skinnedMesh.material.materials[1].color.setHex(this.colorScheme.secondaryColor)
    this.skinnedMesh.material.materials[1].emissive.setHex(this.colorScheme.secondaryEmissive)
  }

  // extend hooks
  onClipAnimationStart () {}

  onClipAnimationComplete (e) {
    if (e.action.name !== this.currentAnimation.name) {
      return false
    }

    if (this.currentAnimation.returnToIdle) {
      this.animationState = AnimationState.IDLE
      let tweenedClip = this.currentAnimation
      TweenMax.to(this.currentAnimation, 0.2, {
        weight: 0,
        onComplete: x => {
          tweenedClip.time = 0
        }
      })

      this.triggerAnimation(this.currentIdleName || 'idle')
    }

    this.emit('animationCompleted', e)
  }
  onClipAnimationLoop (e) {}

  initAnimations (obj) {
    /* if (!obj.geometry.animations) {
      return
    } */

    // add animation to meh

    this.animationList.forEach((animName) => {
      let id = this.characterType + '_anim_' + animName

      let clip
      if (!globalAssets.hasAnimation(id)) {
        clip = THREE.AnimationClip.parseAnimation(globalAssets.getJSON(id)[0], obj.geometry.bones)
        globalAssets.addAnimation(id, clip)
      } else {
        clip = globalAssets.getAnimation(id)
      }

      if (!obj.geometry.animations) {
        obj.geometry.animations = []
      }

      obj.geometry.animations = obj.geometry.animations.concat(clip)

      var newAction = this.mixer.clipAction(clip)
      newAction.name = newAction.getClip().name
      newAction.loop = false
      newAction.weight = 0
      newAction.setEffectiveWeight(0)
      newAction.repetitions = 0
      newAction.clampWhenFinished = true

      if (animName.indexOf('idle') !== -1 || animName === Animations.INTERNAUT_SWIM) {
        newAction.time = 0
        newAction.weight = 0
        newAction.loop = THREE.LoopRepeat
        newAction.repetitions = THREE.Infinity
      }
    })
  }

  initRig () {
    for (let i = 0; i < this.skinnedMesh.skeleton.bones.length; i++) {
      if (this.skinnedMesh.skeleton.bones[i].name === 'RIG:root_JNT') {
        this.rig['root'] = this.skinnedMesh.skeleton.bones[i]
      }

      if (this.skinnedMesh.skeleton.bones[i].name === 'RIG:head_JNT') {
        this.rig['head'] = this.skinnedMesh.skeleton.bones[i]
      }

      if (this.skinnedMesh.skeleton.bones[i].name === 'RIG:eye_L_JNT') {
        this.rig['leftEye'] = this.skinnedMesh.skeleton.bones[i]
      }

      if (this.skinnedMesh.skeleton.bones[i].name === 'RIG:eye_R_JNT') {
        this.rig['rightEye'] = this.skinnedMesh.skeleton.bones[i]
      }

      if (this.skinnedMesh.skeleton.bones[i].name === 'RIG:arm_L_JNT') {
        this.rig['leftArm'] = this.skinnedMesh.skeleton.bones[i]
      }

      if (this.skinnedMesh.skeleton.bones[i].name === 'RIG:arm_R_JNT') {
        this.rig['rightArm'] = this.skinnedMesh.skeleton.bones[i]
      }

      if (this.skinnedMesh.skeleton.bones[i].name === 'RIG:leg_R_JNT') {
        this.rig['rightLeg'] = this.skinnedMesh.skeleton.bones[i]
      }

      if (this.skinnedMesh.skeleton.bones[i].name === 'RIG:leg_L_JNT') {
        this.rig['leftLeg'] = this.skinnedMesh.skeleton.bones[i]
      }
    }

    this.rig.leftArm.up = this.upMinusY
    this.rig.rightArm.up = this.upMinusY
    this.rig.head.up = this.upMinusZ
  }

  update (dt) {
    this.now = Date.now() + this.randomSeed
    this.mixer.update(dt)

    if (this.canBlink) {
      if (this.nextBlink < this.now && !this.isBlinking) {
        if (this.rig.leftEye) {
          this.rig.leftEye.scale.y = 0.1
          this.rig.rightEye.scale.y = 0.1
        } else if (this.rig.eye) {
          this.rig.eye.scale.y = 0.1
        }

        this.isBlinking = true
        this.blinkStart = this.now
      }

      if (this.isBlinking && this.blinkStart + 100 < this.now) {
        this.isBlinking = false
        if (this.rig.leftEye) {
          this.rig.leftEye.scale.y = 1
          this.rig.rightEye.scale.y = 1
        } else if (this.rig.eye) {
          this.rig.eye.scale.y = 1
        }

        // double or single blink
        this.nextBlink = this.now + ((Math.random() > 0.9) ? 100 : (800 + Math.random() * 1800))
      }
    }

    this.updateRig()
  }

  updateRig () {

  }

  updateLookAt (lookAtObject) {
    this.lookAtObject = lookAtObject
  }

  triggerAnimation (name, options = {}) {
    options = Object.assign({
      // defaults
      clampWhenFinished: true,
      returnToIdle: true,
      crossfade: true,
      fadeDuration: 0.2,
      timeScale: 1.0,
      time: 0
    }, options)

    let newAnimation

    if (options.crossfade && (this.currentAnimation || (this.animationState === AnimationState.IDLE))) {
      let fromClipName
      if (this.currentAnimation) {
        fromClipName = this.currentAnimation.name
      } else {
        fromClipName = this.currentIdleName || 'idle'
      }

      newAnimation = this.mixer.clipAction(name)
      newAnimation.timeScale = options.timeScale

      // crossfade stops all other active actions but the two playing
      if (fromClipName !== name) {
        this.isCrossFading = true
        // crossfade

        newAnimation.weight = 1
        newAnimation.time = options.time
        newAnimation.play()
        newAnimation.enabled = true
        newAnimation.paused = false

        let fromAction = this.mixer.clipAction(fromClipName)
        fromAction.fadeOut(options.fadeDuration)
        newAnimation.fadeIn(options.fadeDuration)

        TweenMax.delayedCall(options.fadeDuration, x => {
          this.isCrossFading = false
          // fromAction.weight = 0
          fromAction.time = 0
        })
      } else {
        newAnimation.weight = 1
        newAnimation.time = options.time
        newAnimation.play()
        newAnimation.enabled = true
        newAnimation.paused = false
      }
    } else {
      // go directly to new clipAction
      this.mixer.stopAllAction()

      if (this.currentAnimation) {
        this.currentAnimation.weight = 0
      }

      newAnimation = this.mixer.clipAction(name)
      newAnimation.weight = 1
      newAnimation.time = options.time
      newAnimation.play()
    }

    TweenMax.killTweensOf(this.currentAnimation)

    // assign new current animation
    this.animationState = (name.indexOf('idle') === -1) ? AnimationState.CLIP : AnimationState.IDLE
    this.currentAnimation = newAnimation
    this.onClipAnimationStart(this.currentAnimation)
    Object.assign(this.currentAnimation, options)

    return this.currentAnimation
  }

  warp (fromAnimName, toAnimName, duration) {
    this.mixer.stopAllAction()

    var fromAction = this.play(fromAnimName, 1)

    var toAction = this.play(toAnimName, 1)

    fromAction.crossFadeTo(toAction, duration, true)
  }

  applyWeight (animName, weight) {
    this.mixer.clipAction(animName).setEffectiveWeight(weight)
  }

  getWeight (animName) {
    return this.mixer.clipAction(animName).getEffectiveWeight()
  }

  stopAll () {
    this.mixer.stopAllAction()
  }

  lerpAngle (start, end, speed) {
    let difference = Math.abs(end - start)
    if (difference > Math.PI) {
      // We need to add on to one of the values.
      if (end > start) {
        // We'll add it on to start...
        start += Math.PI * 2
      } else {
        // Add it on to end.
        end += Math.PI * 2
      }
    }

    // Interpolate it.
    start += (end - start) * speed

    if (start >= Math.PI * 2) {
      start = start % Math.PI * 2
    }
    return start
  }

  dispose () {
    this.skinnedMesh.geometry.dispose()
    this.mixer.removeEventListener('finished', this.onClipAnimationComplete)
    this.mixer.removeEventListener('loop', this.onClipAnimationLoop)
    this.mixer = null
  }
}
