"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergeObjects = void 0;

require("core-js/modules/es.object.from-entries.js");

require("core-js/modules/web.dom-collections.iterator.js");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const mergeObjects = function mergeObjects() {
  for (var _len = arguments.length, objects = new Array(_len), _key = 0; _key < _len; _key++) {
    objects[_key] = arguments[_key];
  }

  let a = objects[objects.length - 2],
      b = objects[objects.length - 1];
  if (a === undefined) a = {};
  if (b === undefined) b = {};
  const merged = Object.fromEntries(Object.keys(_objectSpread(_objectSpread({}, a), b)).map(key => [key, b[key] === undefined ? a[key] : b[key]]));
  if (objects.length > 2) return mergeObjects(...[...objects.slice(0, objects.length - 2), merged]);
  return merged;
};

exports.mergeObjects = mergeObjects;