import { computeLayout as faberComputeLayout } from './faberjs';
import { getComputedStyleWithoutDefaults } from './css';

var layoutProperties = [
  'width',
  'height',
  'display',
  'gridTemplateColumns',
  'gridTemplateRows',
  'gridColumn',
  'gridRow',
  'justifyItems',
  'alignItems',
  'justifySelf',
  'alignSelf',
];

export function parseLayoutStyle(element) {
  var computedStyle = getComputedStyleWithoutDefaults(element);
  var layoutStyle = {};
  for (var i = 0; i < layoutProperties.length; ++i) {
    var value = computedStyle[layoutProperties[i]];
    if (value) {
      // For some reason FaberJS behaves VERY oddly when some values (especially inside gridTemplateColumns/Rows)
      // have a specified absolute unit so we just remove all units.
      value = value.replace(/px/g, '');

      layoutStyle[layoutProperties[i]] = value;
    }
  }

  if (Object.keys(layoutStyle).length === 0) {
    return null;
  }

  // console.log(node);
  // console.log(computedStyle);
  // console.log(layoutStyle);

  return layoutStyle;
}

export function parseDOMHierarchy(element) {
  var laidOutElements = [];
  var layoutHierarchyNodes = [];
  parseDOMHierarchyRecursive(element, laidOutElements, layoutHierarchyNodes);
  return { laidOutElements, layoutHierarchyNodes };
}

function parseDOMHierarchyRecursive(
  element,
  laidOutElements,
  layoutHierarchyNodes
) {
  var hierarchyNode = {
    children: [],
  };

  layoutHierarchyNodes.push(hierarchyNode);
  laidOutElements.push(element);

  for (var i = 0; i < element.children.length; ++i) {
    var childElement = element.children[i];
    if (!parseLayoutStyle(childElement)) break;
    var childHierarchyNode = parseDOMHierarchyRecursive(
      childElement,
      laidOutElements,
      layoutHierarchyNodes
    );
    hierarchyNode.children.push(childHierarchyNode);
  }

  return hierarchyNode;
}

export function createLayoutGroups(laidOutElements) {
  // The root element does not to be laid out so we don't need to create a group for it.
  var groupElements = [laidOutElements[0]];

  for (var i = 1; i < laidOutElements.length; ++i) {
    var groupElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'g'
    );
    laidOutElements[i].parentNode.append(groupElement);
    groupElement.append(laidOutElements[i]);
    groupElements.push(groupElement);
  }
  return groupElements;
}

function cacheLayoutStyles(laidOutElements, layoutHierarchyNodes) {
  for (var i = 0; i < laidOutElements.length; ++i) {
    layoutHierarchyNodes[i].style = parseLayoutStyle(laidOutElements[i]);
  }
}

function setFitContentDimensions(laidOutElements, layoutHierarchyNodes) {
  for (var i = 0; i < laidOutElements.length; ++i) {
    var boundingRect = laidOutElements[i].getBoundingClientRect();

    if (layoutHierarchyNodes[i].style.width === 'fit-content') {
      layoutHierarchyNodes[i].style.width = boundingRect.width;
    }

    if (layoutHierarchyNodes[i].style.height === 'fit-content') {
      layoutHierarchyNodes[i].style.height = boundingRect.height;
    }
  }
}

function setLayoutDimensions(layoutHierarchyNodes) {
  for (var i = 0; i < layoutHierarchyNodes.length; ++i) {
    if (!layoutHierarchyNodes[i].style.width) {
      layoutHierarchyNodes[i].style.width =
        layoutHierarchyNodes[i].layout.width;
    }

    if (!layoutHierarchyNodes[i].style.height) {
      layoutHierarchyNodes[i].style.height =
        layoutHierarchyNodes[i].layout.height;
    }
  }
}

export function computeLayout(laidOutElements, layoutHierarchyNodes, size) {
  cacheLayoutStyles(laidOutElements, layoutHierarchyNodes);

  layoutHierarchyNodes[0].style.width = size.width;
  layoutHierarchyNodes[0].style.height = size.height;

  setFitContentDimensions(laidOutElements, layoutHierarchyNodes);

  faberComputeLayout(layoutHierarchyNodes[0]);

  setLayoutDimensions(layoutHierarchyNodes);

  faberComputeLayout(layoutHierarchyNodes[0]);
}

export function applyLayout(layoutGroupElements, layoutHierarchyNodes) {
  for (var i = 0; i < layoutHierarchyNodes.length; ++i) {
    var layoutTransform = `translate(${layoutHierarchyNodes[i].layout.x}, ${layoutHierarchyNodes[i].layout.y})`;
    layoutGroupElements[i].setAttribute('transform', layoutTransform);

    // layoutGroupElements[i].setAttribute(
    //   'debugLayout',
    //   `${layoutHierarchyNodes[i].layout.x}, ${layoutHierarchyNodes[i].layout.y}, ${layoutHierarchyNodes[i].layout.width}, ${layoutHierarchyNodes[i].layout.height}`
    // );

    // layoutGroupElements[i].setAttribute(
    //   'debugLayoutStyle',
    //   `${JSON.stringify(layoutHierarchyNodes[i].style)
    //     .replace(/\"/g, '')
    //     .replace(/,/g, ', ')
    //     .replace(/:/g, ': ')}`
    // );
  }
}
