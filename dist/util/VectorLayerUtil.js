"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.styleKeys = exports.parseHex = exports.getFeatureStyling = exports.extractStyling = exports.defaultStyle = void 0;

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.parse-int.js");

require("core-js/modules/es.string.includes.js");

var _Util = require("./Util");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const defaultStyle = {
  radius: 6,
  width: 2,
  borderColor: '#000000',
  borderOpacity: 1,
  fillColor: '#000000',
  fillOpacity: 0.5
}; //Map style keys to possible aliases

exports.defaultStyle = defaultStyle;
const styleKeys = {
  radius: ['radius'],
  width: ['width', 'lineWidth'],
  borderColor: ['borderColor', 'color'],
  borderOpacity: ['borderOpacity', 'opacity'],
  fillColor: ['fillColor'],
  fillOpacity: ['fillOpacity']
};
exports.styleKeys = styleKeys;

const parseHex = (color, toRGB) => {
  if (!color) return;
  const splitHexComponents = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(color); //Retreive all color components from hex

  let [r, g, b, opacity] = splitHexComponents.slice(1).map(x => parseInt(x, 16));
  opacity = isNaN(opacity) ? opacity = undefined : opacity /= 255;
  if (toRGB) return {
    r,
    g,
    b,
    opacity
  };
  return {
    color: "#".concat(splitHexComponents.slice(1, 4).join('')),
    opacity
  };
}; //Finds styling info based on styleKeysInfo. It'll return all style info with the style
//keys described in styleKeysInfo.


exports.parseHex = parseHex;

const extractStyling = function extractStyling() {
  let obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  let styleKeysInfo = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : styleKeys;
  const styling = {};
  Object.entries(obj).forEach(_ref => {
    let [key, value] = _ref;
    const standardStylingEntry = Object.entries(styleKeysInfo).find(_ref2 => {
      let [styleKey, styleAliases] = _ref2;
      return styleKey === key || styleAliases && styleAliases.includes(key);
    });
    if (standardStylingEntry) styling[standardStylingEntry[0]] = value;
  });
  return styling;
};
/**
 * Parses hex color values from feature to create an object that has all styling
 * parameters merged, which does include default stylings.
 * Priority of the different places to pass styling:
 * 1) stylingOptions
 * 2) feature.properties.style
 * 3) feature.properties
 * 4) default styling
 * if fillcolor and fillopacity are not set, the opacity of colors is used.
 * @param {*} feature 
 * @param {*} stylingOptions 
 * @returns {*}
 */


exports.extractStyling = extractStyling;

const getFeatureStyling = function getFeatureStyling(feature) {
  //Extract style info from feature.properties, getinfo.style and stylingOptions.
  const propertyStyle = feature && feature.properties ? extractStyling(feature.properties) : undefined; //Rightmost value will take precidence over values to the left in merge.

  for (var _len = arguments.length, stylingSources = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    stylingSources[_key - 1] = arguments[_key];
  }

  let combinedStyles = (0, _Util.mergeObjects)(propertyStyle, ...stylingSources.map(x => x ? extractStyling(x) : undefined)); //Split hex values in opacity and hex value if possible.

  let parsedBorderColor = parseHex(combinedStyles.borderColor);
  let parsedFillColor = parseHex(combinedStyles.fillColor); //If no fill color present, take color from border.

  if (parsedBorderColor && !parsedFillColor) {
    parsedFillColor = _objectSpread({}, parsedBorderColor);
    parsedBorderColor.opacity = 1;
  } //If no border color present, take color from fill.


  if (!parsedBorderColor && parsedFillColor) {
    parsedBorderColor = _objectSpread({}, parsedFillColor);
    parsedBorderColor.opacity = 1;
  } //If we parsed colors, combine the results 


  if (parsedBorderColor) {
    //Merge priority: 
    //1) parsed colors, 
    //2) opacities found in style, 
    //3) parsed opacities
    combinedStyles = (0, _Util.mergeObjects)({
      fillOpacity: parsedFillColor.fillOpacity,
      borderOpacity: parsedBorderColor.opacity
    }, combinedStyles, {
      fillColor: parsedFillColor.color,
      borderColor: parsedBorderColor.color
    });
  } //Ensure the default values for all values that are not set in combined styles.


  return (0, _Util.mergeObjects)(defaultStyle, combinedStyles);
};

exports.getFeatureStyling = getFeatureStyling;