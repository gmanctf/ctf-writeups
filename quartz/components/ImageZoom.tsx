import { QuartzComponent, QuartzComponentConstructor } from "./types"
// @ts-ignore
import script from "./scripts/image-zoom.inline"

const ImageZoom: QuartzComponent = () => {
  return <></>
}

ImageZoom.afterDOMLoaded = script

export default (() => ImageZoom) satisfies QuartzComponentConstructor
