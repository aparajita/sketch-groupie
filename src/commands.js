'use strict'

const invalidLayers = [
  "MSArtboardGroup",
  "MSPage",
  "MSSymbolMaster"
]

const directionToIconMap = {
  h: 'center-horizontally.png',
  v: 'center-vertically.png',
  c: 'center.png',
  l: 'align-left.png',
  r: 'align-right.png',
  t: 'align-top.png',
  b: 'align-bottom.png'
}

function showAlert(sketch, message, direction) {
  const title = 'hvc'.indexOf(direction) >= 0 ? 'Center in Parent' : 'Align to Parent'
  const iconName = directionToIconMap[direction]

  const alert = NSAlert.new()
  alert.setMessageText(title)
  alert.setInformativeText(message)

  const icon = NSImage.alloc().initByReferencingFile(sketch.resourceNamed(iconName).path())
  alert.setIcon(icon)
  alert.runModal()
}

function isCenterCommand(direction) {
  return 'hvc'.indexOf(direction) >= 0
}

function alignLayerInGroup(context, direction) {
  const
    sketch = context.api(),
    layers = sketch.selectedDocument.selectedLayers.nativeLayers,
    alignToPixel = sketch.settingForKey('tryToFitToPixelBounds') == true &&
      sketch.settingForKey('fitToPixelBoundsOnAlign') == true

  if (layers.length > 0) {
    // Make sure all layers are a type that is grouped
    for (let i = 0; i < layers.length; i++) {
      if (invalidLayers.includes(String(layers[i].className()))) {
        showAlert(sketch, 'One or more selected layers are not groupable.', direction)
        return
      }
    }

    layers.forEach(function(layer) {
      let frame = layer.frame(),
        parent = layer.parentGroup(),
        parentFrame = parent.frame()

      frame = new sketch.Rectangle(frame.x(), frame.y(), frame.width(), frame.height())
      parentFrame = new sketch.Rectangle(parentFrame.x(), parentFrame.y(), parentFrame.width(), parentFrame.height())

      if (isCenterCommand(direction)) {
        const
          parentMidpointX = parentFrame.width / 2,
          parentMidpointY = parentFrame.height / 2

        if (direction === 'h' || direction === 'c') {
          frame.x = parentMidpointX - (frame.width / 2)

          if (alignToPixel) {
            frame.x = Math.round(frame.x)
          }
        }

        if (direction === 'v' || direction === 'c') {
          frame.y = parentMidpointY - (frame.height / 2)

          if (alignToPixel) {
            frame.y = Math.round(frame.y)
          }
        }
      }
      else {
        switch (direction) {
          case 'l':
            frame.x = 0
            break

          case 'r':
            frame.x = parentFrame.width - frame.width
            break

          case 't':
            frame.y = 0
            break

          case 'b':
            frame.y = parentFrame.height - frame.height
            break
        }
      }

      const rect = MSRect.rectWithX_y_width_height_(frame.x, frame.y, frame.width, frame.height)

      layer.setFrame(rect)
      context.document.reloadInspector()
    })
  }
  else {
    showAlert(sketch, 'Please select one or more groupable layers.', direction)
  }
}

export function commandCenterHorizontally(context) {
  alignLayerInGroup(context, 'h')
}

export function commandCenterVertically(context) {
  alignLayerInGroup(context, 'v')
}

export function commandCenter(context) {
  alignLayerInGroup(context, 'c')
}

export function commandAlignLeft(context) {
  alignLayerInGroup(context, 'l')
}

export function commandAlignRight(context) {
  alignLayerInGroup(context, 'r')
}

export function commandAlignTop(context) {
  alignLayerInGroup(context, 't')
}

export function commandAlignBottom(context) {
  alignLayerInGroup(context, 'b')
}
