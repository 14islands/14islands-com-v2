import CharacterBase, {AnimationState, CharacterType} from './character-base'
import globalAssets from './global-assets'
import * as Animations from './animations'
import * as InternautColors from './internaut-colors'

export default class Internaut extends CharacterBase {

  constructor (config = {}) {
    super()
    this.colorScheme = InternautColors.BLUE
    this.shouldLookAt = true
    this.canIdleLook = true

    Object.assign(this, config)

    this.characterType = CharacterType.INTERNAUT

    this.characterJSON = globalAssets.getJSON('internaut')
    this.isMoving = false

    this.idleLookInterval = 5000 + Math.random() * 10000
    this.lastIdleLookTime = Date.now() + this.idleLookInterval

    let animations = []
    animations.push(Animations.PRESETS.INTERNAUT_DEFAULT)
    if (config.animations) {
      animations.push(config.animations)
    }

    this.parseConfigAnimationKeys(animations)

    this.createMesh()

    this.triggerAnimation('idle')
  }

  setColors (colorScheme) {
    if (colorScheme) {
      this.colorScheme = colorScheme
    }

    if (this.colorScheme) {
      this.skinnedMesh.material.materials[0].color.setHex(this.colorScheme.mainColor)
      this.skinnedMesh.material.materials[0].emissive.setHex(this.colorScheme.mainEmissive)
      this.skinnedMesh.material.materials[2].color.setHex(this.colorScheme.secondaryColor)
      this.skinnedMesh.material.materials[2].emissive.setHex(this.colorScheme.secondaryEmissive)
      this.skinnedMesh.material.materials[2].fresnelIntensity = 0
      this.skinnedMesh.material.materials[3].color.setHex(this.colorScheme.mainColor)
      this.skinnedMesh.material.materials[3].emissive.setHex(this.colorScheme.mainEmissive)
      this.skinnedMesh.material.materials[4].emissive.setHex(InternautColors.WHITE_EMISSIVE)
      this.skinnedMesh.material.materials[1].visible = false
    }
  }

  onClipAnimationStart (clip) {
    /* let lookClip = this.mixer.clipAction(Animations.INTERNAUT_LOOK)
    if (lookClip) {
      lookClip.stop()
      lookClip.weight = 0
    } */
    if (clip.name.indexOf('idle') !== -1) {
      this.currentIdleName = clip.name
    }
  }

  onClipAnimationComplete (e) {
    if (!this.currentAnimation || e.action.name === Animations.INTERNAUT_RUN || e.action.name === Animations.INTERNAUT_RUN2 || e.action.name.includes('ending')) {
      this.currentAnimation = null
      return
    }

    if (e.action.name === 'transform' && this.isTransforming) {
      this.mesh.visible = false
    } else if (e.action.name === Animations.INTERNAUT_JUMP) {
      if (this.animatedJump) {
        this.applyWeight(Animations.INTERNAUT_JUMP, 0)
        let landing = 'landing2'
        this.applyWeight(landing, 1)
        this.triggerAnimation(landing)
      }
    } else {
      super.onClipAnimationComplete(e)
    }

    // this.currentAnimation = null
  }

  setIdleState (idleName) {
    this.animationState = AnimationState.IDLE

    this.currentIdleName = idleName

    if (!this.currentAnimation || (this.currentAnimation && this.currentAnimation.name.indexOf('idle') !== -1)) {
      this.triggerAnimation(idleName)
    }

    this.mixer.clipAction(idleName).time = Math.random() * this.mixer.clipAction(idleName)._clip.duration
  }

  setJumpingState (value) {
    if (value) {
      this.animationState = AnimationState.JUMP
    } else {
      this.animationState = AnimationState.IDLE
    }
  }

  jump () {
    this.animatedJump = true
    this.applyWeight(Animations.INTERNAUT_JUMP, 1)
    this.setJumpingState(true)

    this.triggerAnimation(Animations.INTERNAUT_JUMP)

    // fake jump
    this.randomJumpFactor = Math.random()
    TweenMax.to(this.mesh.position, 0.3, {
      y: 40,
      ease: Sine.easeOut,
      onComplete: x => {
        TweenMax.to(this.mesh.position, 1.2, {
          y: 0,
          ease: Sine.easeIn,
          onComplete: x => {
            this.animatedJump = false
            this.setIdleState(this.currentIdleName)
          }
        })
      }
    })
  }

  update (dt) {
    super.update(dt)
    this.lastPosition.copy(this.mesh.position)

    if (
      this.canIdleLook &&
      this.animationState === AnimationState.IDLE &&
      this.currentIdleName === Animations.INTERNAUT_IDLE &&
      (this.lastIdleLookTime + this.idleLookInterval) < Date.now()
    ) {
      this.lastIdleLookTime = Date.now()

      this.animationState = AnimationState.CLIP
      this.triggerAnimation(Animations.INTERNAUT_LOOK)
    }
  }

  updateRig () {
    this.velocity.copy(this.mesh.position).sub(this.lastPosition)

    if (this.shouldLookAt) {
      this.calculateLookAt()
    }
  }

  calculateLookAt () {
    this.tempVector3.copy(this.lookAtObject.position)
    this.lookAtPosition.copy(this.lookAtObject.position)

    this.tempWorldPos.setFromMatrixPosition(this.mesh.matrixWorld)
    this.lookAtObject.updateMatrixWorld()
    this.tempWorldPos2.setFromMatrixPosition(this.lookAtObject.matrixWorld)

    let angle = Math.atan2((this.tempWorldPos2.x - this.tempWorldPos.x), (this.tempWorldPos2.z - this.tempWorldPos.z))
    let angleY = Math.atan2((this.tempWorldPos2.y - this.tempWorldPos.y), (this.tempWorldPos2.z - this.tempWorldPos.z))

    // body movement
    this.mesh.rotation.y = this.lerpAngle(this.mesh.rotation.y, angle, 0.3)
    //this.rig.head.rotation.x = this.lerpAngle(this.rig.head.rotation.x, angleY, 0.3)

    if (this.animationState === AnimationState.IDLE || this.animationState === AnimationState.FOLLOW_ICON) {
      // mesh turn direction
      this.mesh.rotation.y = this.lerpAngle(this.mesh.rotation.y, angle, 0.3)
    }
  }
}
