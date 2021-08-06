import * as f from 'fpx'

// TODO simplify.
export function videosAround(dat, id) {
  const list = dat.videos
  const index = f.findIndex(list, f.cwk, byId, id)
  if (!(index >= 0)) return undefined

  if (index === 0)               return list.slice(index, 3)
  if (index === list.length - 1) return list.slice(-3)
  return list.slice(index - 1, index + 2)
}

function byId(val, id) {return val.id === id}
