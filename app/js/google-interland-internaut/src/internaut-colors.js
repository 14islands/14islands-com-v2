export const WHITE = {
  mainColor: 0xeeeeee,
  mainEmissive: 0,
  secondaryColor: 0xffffff,
  secondaryEmissive: 0,
  detailColor: 0x999999,
  detailEmissive: 0
}

export const PURPLE = {
  mainColor: 9059245,
  mainEmissive: 3346003,
  secondaryColor: 3346003,
  secondaryEmissive: 0,
  detailColor: 16300589,
  detailEmissive: 16300589
}

export const YELLOW = {
  mainColor: 0xe99f2b,
  mainEmissive: 0x9e761e,
  secondaryColor: 0xcf6100,
  secondaryEmissive: 0x934005,
  detailColor: 0x4285F4,
  detailEmissive: 0x4285F4
}

export const BLUE = {
  mainColor: 5600681,
  mainEmissive: 12149,
  secondaryColor: 0x112849,
  secondaryEmissive: 1255752,
  detailColor: 0,
  detailEmissive: 16711758
}

export const GREEN = {

  mainColor: 7248181,
  mainEmissive: 2121266,
  secondaryColor: 2849344,
  secondaryEmissive: 0,
  detailColor: 16300589,
  detailEmissive: 16300589
}

export const RED = {
  mainColor: 14820114,
  mainEmissive: 6357020,
  secondaryColor: 8000524,
  secondaryEmissive: 65536,
  detailColor: 0x34A853,
  detailEmissive: 0x34A853
}

export const WHITE_EMISSIVE = 0x999999

export let getRandom = function () {
  let list = [RED, GREEN]
  return list[Math.floor(Math.random() * list.length)]
}
