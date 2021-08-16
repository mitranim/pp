import * as pt from 'path'
import * as f from 'fpx'
import * as c from './conf.mjs'
import * as u from './util.mjs'
import * as si from './site_init.mjs'

// Caution: might not work on Windows.

u.timing(`prune_images`, cmdPruneImages)

function cmdPruneImages() {
  if (hasArg(`--gen`)) pruneGenImages()
  if (hasArg(`--dup`)) pruneDupImages()
  if (hasArg(`--use`)) pruneUnusedImages()
}

function pruneGenImages() {
  const paths = f.filter(u.reify(imagePaths()), isGenImage)
  f.each(paths, removeSync)
}

function pruneDupImages() {
  const paths = u.iterReject(imagePaths(), isImagePreprocessed)
  const groups = f.vals(f.groupBy(u.reify(paths), basename))
  f.each(groups, pruneDups)
}

function pruneDups(group) {
  f.each(f.tail(group, group.sort(u.byStrLenAsc)), removeSync)
}

function pruneUnusedImages() {
  const site = si.initSite()

  const pagePaths = u.iterFilter(u.toNames(u.walkFiles(c.TARGET)), isHtml)
  const pageTexts = u.iterMap(pagePaths, readFile)
  const imageLinks = u.iterMapFlat(pageTexts, textToImageLinks)

  const mentionedPaths = new Set(u.iterMap(imageLinks, u.stripLeadingSlash))
  const knownPaths = new Set(knownSiteImagePaths(site))

  const possiblePaths = new Set(u.iterMap(
    servableImagePaths([...mentionedPaths, ...knownPaths]),
    pt.normalize,
  ))

  const existingPaths = new Set(imagePaths())
  const unusedPaths = u.setSubtract(existingPaths, possiblePaths)
  const removePaths = u.iterReject(unusedPaths, isImageInRoot)

  f.each(u.reify(removePaths), removeSync)
}

// This was generated by some Django-related shit. Possibly on file upload.
// The originals are stored without those suffixes.
function isGenImage(path) {return /[.](?:large|small|square)[.]\w+$/.test(path)}

function isHtml(path) {return pt.extname(path) === `.html`}
function basename(path) {return pt.basename(path)}
function readFile(path) {return Deno.readTextFileSync(path)}

function* imagePaths() {
  yield* u.toNames(u.walkFiles(`images`))
  yield* u.toNames(u.walkFiles(`uploaded/images`))
}

function removeSync(val) {
  if (hasArg(`--dry`)) console.log(`[should remove]`, val)
  else Deno.removeSync(val)
}

function textToImageLinks(text) {
  f.req(text, f.isStr)
  return f.list(text.match(/[/]images[/](?:[\w-]+[/])*[\w-]+[.]\w+\b/g))
}

function* knownSiteImagePaths(site) {
  yield* toImagePaths(site.pages())
  yield* toImagePaths(site.authors)
}

function* toImagePaths(vals) {
  for (const val of vals) {
    const image = u.stripLeadingSlash(val.image)
    if (image) yield image
  }
}

function* servableImagePaths(paths) {
  for (const path of paths) yield* [path, pt.posix.join(`uploaded`, path)]
}

function isImageInRoot(path) {
  return pt.dirname(path) === `images`
}

// Slightly incorrect and incompatible with Windows.
function isImagePreprocessed(path) {
  return path.startsWith(`images/square`) || path.startsWith(`images/small`)
}

function hasArg(key) {return Deno.args.includes(key)}