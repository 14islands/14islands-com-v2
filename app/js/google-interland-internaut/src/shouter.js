import CharacterBase, {CharacterType} from './character-base'
import globalAssets from './global-assets'
import * as Animations from './animations'
import * as InternautColors from './internaut-colors'

export default class Shouter extends CharacterBase {

  constructor (config = {}) {
    super()

    Object.assign(this, config)

    this.characterType = CharacterType.SHOUTER

    this.shouldLookAt = true

    this.colorScheme = InternautColors.RED
    this.characterJSON = globalAssets.getJSON('shouter')

    // construct animation data
    this.parseConfigAnimationKeys(Animations.PRESETS.SHOUTER)

    this.createMesh()

    this.skinnedMesh.position.y = 0

    // start idle
    this.triggerAnimation('idle')

    this.skinnedMesh.material.materials[3].visible = false
  }

  setColors (colorScheme) {
    super.setColors(colorScheme)
    this.skinnedMesh.material.materials[2].emissive.setHex(InternautColors.WHITE_EMISSIVE)
  }

  update (dt) {
    super.update(dt)
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

      if (this.skinnedMesh.skeleton.bones[i].name === 'RIG:arm_L_upper_JNT') {
        this.rig['leftArm'] = this.skinnedMesh.skeleton.bones[i]
      }

      if (this.skinnedMesh.skeleton.bones[i].name === 'RIG:arm_R_upper_JNT') {
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

    // body movement
    this.mesh.rotation.y = this.lerpAngle(this.mesh.rotation.y, angle, 0.3)
  }
}
