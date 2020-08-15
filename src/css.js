// Code from https://stackoverflow.com/a/22909984

/**
 * IE does not have `getComputedStyle`
 */

window.getComputedStyle =
  window.getComputedStyle ||
  function (element) {
    return element.currentStyle;
  };

/**
 * get computed style for an element, excluding any default styles
 * @param {DOM} element
 * @return {object} difference
 */

export function getComputedStyleWithoutDefaults(element, properties) {
  // creating an empty dummy object to compare with
  var dummy = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'element-' + new Date().getTime()
  );
  element.parentNode.appendChild(dummy);

  // getting computed styles for both elements
  var defaultStyles = getComputedStyle(dummy);
  var elementStyles = getComputedStyle(element);

  // calculating the difference
  var diffObj = {};
  for (var i = 0; i < properties.length; ++i) {
    if (defaultStyles[properties[i]] !== elementStyles[properties[i]]) {
      diffObj[properties[i]] = elementStyles[properties[i]];
    }
  }

  // clear dom
  dummy.remove();

  return diffObj;
}
