
// internaut animations
export const INTERNAUT_IDLE = 'idle'
export const INTERNAUT_LOOK = 'look'
export const INTERNAUT_IDLEHAPPY = 'idlehappy'
export const INTERNAUT_IDLESAD = 'idlesad'
export const INTERNAUT_IDLESUPERSAD = 'idlesupersad'
export const INTERNAUT_WIGGLE = 'wiggle'
export const INTERNAUT_HAPPYTRIGGER = 'happytrigger'
export const INTERNAUT_SUPERHAPPYTRIGGER = 'superhappytrigger'
export const INTERNAUT_JUMP = 'jump'
export const INTERNAUT_LANDING1 = 'landing1'
export const INTERNAUT_LANDING2 = 'landing2'
export const INTERNAUT_THROW = 'throw'
export const INTERNAUT_RUN = 'run'
export const INTERNAUT_RUN2 = 'run2'
export const INTERNAUT_CLIMB = 'climb'
export const INTERNAUT_CLIMBOUT = 'climbout'
export const INTERNAUT_DRAGLEFT = 'dragleft'
export const INTERNAUT_PUSHRIGHT = 'pushright'
export const INTERNAUT_ACTIVATE = 'activate'
export const INTERNAUT_PUTCARD = 'putcard'
export const INTERNAUT_CORRECT = 'correct'
export const INTERNAUT_NEXTPLATFORM = 'nextplatform'
export const INTERNAUT_SHIVER = 'shiver'
export const INTERNAUT_SHIVER2 = 'shiver2'
export const INTERNAUT_SWIM = 'swim'
export const INTERNAUT_SWIMLEFT = 'swimleft'
export const INTERNAUT_WRONGANSWER = 'wronganswer'
export const INTERNAUT_BOUNCEWALL = 'bouncewall'
export const INTERNAUT_COLLECTING = 'collecting'
export const INTERNAUT_LEANLEFT = 'leanleft'
export const INTERNAUT_LEANRIGHT = 'leanright'
export const INTERNAUT_RUNJUMP = 'runjump'
export const INTERNAUT_RUNJUMP2 = 'runjump2'
export const INTERNAUT_REPORT = 'report'
export const INTERNAUT_WRONGREPORTED = 'wrongreported'
export const INTERNAUT_ENDING_MM = 'endingmm'
export const INTERNAUT_ENDING_TOT = 'endingtot'
export const INTERNAUT_ENDING_RR = 'endingrr'
export const INTERNAUT_ENDING_KK = 'endingkk'

export const BULLY_IDLE = 'idle'
export const BULLY_THROW = 'throw'
export const BULLY_EMPRISONED = 'emprisoned'
export const BULLY_LAUGH = 'laugh'
export const BULLY_LAUGHANDPOINT = 'laughandpoint'
export const BULLY_NOTICE = 'notice'
export const BULLY_REPORTED = 'reported'

export const SHOUTER_IDLE = 'idle'
export const SHOUTER_SPIN = 'spin'
export const SHOUTER_LAUGH = 'laugh'

export const PHISHER_IDLE = 'idle'
export const PHISHER_LAUGH = 'laugh'
export const PHISHER_WATER_IN = 'water_in'
export const PHISHER_WATER_OUT = 'water_out'
export const PHISHER_YES = 'yes'
export const PHISHER_NO = 'no'

export const HACKER_IDLE = 'idle'
export const HACKER_RUN = 'run'
export const HACKER_BOUNCEWALL = 'bouncewall'
export const HACKER_STEAL = 'steal'
export const HACKER_LAUGH = 'laugh'

// preset keys
export const KK_CITIZEN = 'kk-citizen'
export const KK_PLAYER = 'kk-player'
export const MM_PLAYER = 'mm-player'
export const RR_PLAYER = 'rr-player'
export const TT_PLAYER = 'tt-player'

export const BULLY = 'bully'
export const PHISHER = 'phisher'
export const HACKER = 'hacker'
export const SHOUTER = 'shouter'

export const PRESETS = {
  INTERNAUT_DEFAULT: [
    INTERNAUT_IDLE,
    INTERNAUT_LOOK,
    INTERNAUT_WIGGLE,
    
    INTERNAUT_WRONGREPORTED,
    INTERNAUT_SUPERHAPPYTRIGGER,
    INTERNAUT_REPORT,
    INTERNAUT_BOUNCEWALL

  ],
  BULLY: [
    BULLY_IDLE,
    BULLY_THROW,
    BULLY_EMPRISONED,
    BULLY_LAUGH,
    BULLY_LAUGHANDPOINT,
    BULLY_NOTICE,
    BULLY_REPORTED
  ],
  PHISHER: [
    PHISHER_IDLE,
    PHISHER_LAUGH,
    PHISHER_WATER_IN,
    PHISHER_WATER_OUT,
    PHISHER_YES,
    PHISHER_NO
  ],
  HACKER: [
    HACKER_IDLE,
    HACKER_RUN,
    HACKER_BOUNCEWALL,
    HACKER_STEAL,
    HACKER_LAUGH
  ],
  SHOUTER: [
    SHOUTER_IDLE,
    SHOUTER_SPIN,
    SHOUTER_LAUGH
  ],
  KK_CITIZEN: [
    INTERNAUT_WIGGLE,
    INTERNAUT_IDLEHAPPY,
    INTERNAUT_IDLESAD,
    INTERNAUT_IDLESUPERSAD,
    INTERNAUT_HAPPYTRIGGER,
    INTERNAUT_SUPERHAPPYTRIGGER,
    INTERNAUT_WRONGREPORTED
  ],
  KK_PLAYER: [
    INTERNAUT_WIGGLE,
    INTERNAUT_JUMP,
    INTERNAUT_RUNJUMP2,
    INTERNAUT_LANDING2,
    INTERNAUT_THROW,
    INTERNAUT_RUN,
    INTERNAUT_RUN2,
    INTERNAUT_HAPPYTRIGGER,
    INTERNAUT_REPORT
  ],
  KK_ENDING_PLAYER: [
    INTERNAUT_ENDING_KK
  ],
  MM_PLAYER: [
    INTERNAUT_DRAGLEFT,
    INTERNAUT_PUSHRIGHT,
    INTERNAUT_ACTIVATE,
    INTERNAUT_PUTCARD,
    INTERNAUT_CLIMB,
    INTERNAUT_ENDING_MM,
    INTERNAUT_SUPERHAPPYTRIGGER,
    INTERNAUT_CLIMBOUT
  ],
  MM_CITIZEN: [
    INTERNAUT_SUPERHAPPYTRIGGER,
    INTERNAUT_HAPPYTRIGGER,
    INTERNAUT_IDLEHAPPY,
    INTERNAUT_IDLESAD,
    INTERNAUT_IDLESUPERSAD
  ],
  MM_ENDING_PLAYER: [
    INTERNAUT_ENDING_MM
  ],
  RR_PLAYER: [
    INTERNAUT_CORRECT,
    INTERNAUT_CLIMBOUT,
    INTERNAUT_HAPPYTRIGGER,
    INTERNAUT_SUPERHAPPYTRIGGER,
    INTERNAUT_NEXTPLATFORM,
    INTERNAUT_SHIVER,
    INTERNAUT_SHIVER2,
    INTERNAUT_SWIM,
    INTERNAUT_SWIMLEFT,
    INTERNAUT_WRONGANSWER,
    INTERNAUT_WIGGLE,
    INTERNAUT_ENDING_RR
  ],
  TT_PLAYER: [
    INTERNAUT_RUN2,
    INTERNAUT_BOUNCEWALL,
    INTERNAUT_COLLECTING,
    INTERNAUT_LEANLEFT,
    INTERNAUT_LEANRIGHT,
    INTERNAUT_RUNJUMP,
    INTERNAUT_RUNJUMP2,
    INTERNAUT_JUMP,
    INTERNAUT_HAPPYTRIGGER,
    INTERNAUT_ENDING_TOT
  ],
  CHARACTER_STUDIO_INTERNAUT: [
    INTERNAUT_IDLE,
    INTERNAUT_LOOK,
    INTERNAUT_IDLEHAPPY,
    INTERNAUT_IDLESAD,
    INTERNAUT_IDLESUPERSAD,
    INTERNAUT_WIGGLE,
    INTERNAUT_HAPPYTRIGGER,
    INTERNAUT_SUPERHAPPYTRIGGER,
    INTERNAUT_WRONGREPORTED,
    INTERNAUT_JUMP,
    INTERNAUT_LANDING1,
    INTERNAUT_LANDING2,
    INTERNAUT_THROW,
    INTERNAUT_REPORT,
    INTERNAUT_RUN,
    INTERNAUT_RUN2,
    INTERNAUT_CLIMB,
    INTERNAUT_CLIMBOUT,
    INTERNAUT_DRAGLEFT,
    INTERNAUT_PUSHRIGHT,
    INTERNAUT_ACTIVATE,
    INTERNAUT_PUTCARD,
    INTERNAUT_CORRECT,
    INTERNAUT_NEXTPLATFORM,
    INTERNAUT_SHIVER,
    INTERNAUT_SHIVER2,
    INTERNAUT_SWIM,
    INTERNAUT_SWIMLEFT,
    INTERNAUT_WRONGANSWER,
    INTERNAUT_BOUNCEWALL,
    INTERNAUT_COLLECTING,
    INTERNAUT_LEANLEFT,
    INTERNAUT_LEANRIGHT,
    INTERNAUT_RUNJUMP,
    INTERNAUT_RUNJUMP2,
    INTERNAUT_ENDING_MM,
    INTERNAUT_ENDING_RR,
    INTERNAUT_ENDING_TOT,
    INTERNAUT_ENDING_KK
  ]

}