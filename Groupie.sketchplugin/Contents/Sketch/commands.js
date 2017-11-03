var that = this;
function run (key, context) {
  that.context = context;

var exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.commandCenterHorizontally = commandCenterHorizontally;
exports.commandCenterVertically = commandCenterVertically;
exports.commandCenter = commandCenter;
exports.commandAlignLeft = commandAlignLeft;
exports.commandAlignRight = commandAlignRight;
exports.commandAlignTop = commandAlignTop;
exports.commandAlignBottom = commandAlignBottom;
var invalidLayers = ["MSArtboardGroup", "MSPage", "MSSymbolMaster"];

var directionToIconMap = {
  h: 'center-horizontally.png',
  v: 'center-vertically.png',
  c: 'center.png',
  l: 'align-left.png',
  r: 'align-right.png',
  t: 'align-top.png',
  b: 'align-bottom.png'
};

function showAlert(sketch, message, direction) {
  var title = 'hvc'.indexOf(direction) >= 0 ? 'Center in Parent' : 'Align to Parent';
  var iconName = directionToIconMap[direction];

  var alert = NSAlert["new"]();
  alert.setMessageText(title);
  alert.setInformativeText(message);

  var icon = NSImage.alloc().initByReferencingFile(sketch.resourceNamed(iconName).path());
  alert.setIcon(icon);
  alert.runModal();
}

function isCenterCommand(direction) {
  return 'hvc'.indexOf(direction) >= 0;
}

function alignLayerInGroup(context, direction) {
  var sketch = context.api(),
      layers = sketch.selectedDocument.selectedLayers.nativeLayers,
      alignToPixel = sketch.settingForKey('tryToFitToPixelBounds') == true && sketch.settingForKey('fitToPixelBoundsOnAlign') == true;

  if (layers.length > 0) {
    // Make sure all layers are a type that is grouped
    for (var i = 0; i < layers.length; i++) {
      if (invalidLayers.includes(String(layers[i].className()))) {
        showAlert(sketch, 'One or more selected layers are not groupable.', direction);
        return;
      }
    }

    layers.forEach(function (layer) {
      var frame = layer.frame(),
          parent = layer.parentGroup(),
          parentFrame = parent.frame();

      frame = new sketch.Rectangle(frame.x(), frame.y(), frame.width(), frame.height());
      parentFrame = new sketch.Rectangle(parentFrame.x(), parentFrame.y(), parentFrame.width(), parentFrame.height());

      if (isCenterCommand(direction)) {
        var parentMidpointX = parentFrame.width / 2,
            parentMidpointY = parentFrame.height / 2;

        if (direction === 'h' || direction === 'c') {
          frame.x = parentMidpointX - frame.width / 2;

          if (alignToPixel) {
            frame.x = Math.round(frame.x);
          }
        }

        if (direction === 'v' || direction === 'c') {
          frame.y = parentMidpointY - frame.height / 2;

          if (alignToPixel) {
            frame.y = Math.round(frame.y);
          }
        }
      } else {
        switch (direction) {
          case 'l':
            frame.x = 0;
            break;

          case 'r':
            frame.x = parentFrame.width - frame.width;
            break;

          case 't':
            frame.y = 0;
            break;

          case 'b':
            frame.y = parentFrame.height - frame.height;
            break;
        }
      }

      var rect = MSRect.rectWithX_y_width_height_(frame.x, frame.y, frame.width, frame.height);

      layer.setFrame(rect);
      context.document.reloadInspector();
    });
  } else {
    showAlert(sketch, 'Please select one or more groupable layers.', direction);
  }
}

function commandCenterHorizontally(context) {
  alignLayerInGroup(context, 'h');
}

function commandCenterVertically(context) {
  alignLayerInGroup(context, 'v');
}

function commandCenter(context) {
  alignLayerInGroup(context, 'c');
}

function commandAlignLeft(context) {
  alignLayerInGroup(context, 'l');
}

function commandAlignRight(context) {
  alignLayerInGroup(context, 'r');
}

function commandAlignTop(context) {
  alignLayerInGroup(context, 't');
}

function commandAlignBottom(context) {
  alignLayerInGroup(context, 'b');
}

/***/ })
/******/ ]);
  if (key === 'default' && typeof exports === 'function') {
    exports(context);
  } else {
    exports[key](context);
  }
}
that['commandCenterHorizontally'] = run.bind(this, 'commandCenterHorizontally');
that['onRun'] = run.bind(this, 'default');
that['commandCenterVertically'] = run.bind(this, 'commandCenterVertically');
that['commandCenter'] = run.bind(this, 'commandCenter');
that['commandAlignLeft'] = run.bind(this, 'commandAlignLeft');
that['commandAlignRight'] = run.bind(this, 'commandAlignRight');
that['commandAlignTop'] = run.bind(this, 'commandAlignTop');
that['commandAlignBottom'] = run.bind(this, 'commandAlignBottom')
