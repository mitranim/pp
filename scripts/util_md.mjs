import md from 'marked'
import * as f from 'fpx'

// Placeholder. TODO:
//   * Automatic target + rel for external links.
//   * Automatic icon for external links.
class MdRen extends md.Renderer {}

const mdRenderer = new MdRen()
const mdOpts = {renderer: mdRenderer}

export function mdToHtml(val) {
  return md(f.str(val), mdOpts)
}
