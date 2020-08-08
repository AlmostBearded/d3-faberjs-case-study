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

export function parseCSSLayoutStyle(node) {
  var computedStyle = getComputedStyleWithoutDefaults(node);
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

  node.layoutStyle = layoutStyle;

  // console.log(node);
  // console.log(computedStyle);
  // console.log(layoutStyle);

  for (var i = 0; i < node.children.length; ++i) {
    parseCSSLayoutStyle(node.children[i]);
  }
}

export function parseNodeHierarchy(node, nodes, layoutNodes) {
  var style = JSON.parse(JSON.stringify(node.layoutStyle));

  var layout = {
    style,
    children: [],
  };

  var groupNode = node;
  // // The root node (SVG node) can't be wrapped in a group node
  if (node.tagName !== 'svg') {
    groupNode = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    groupNode.layoutStyle = node.layoutStyle;
    node.parentNode.append(groupNode);
    groupNode.append(node);
  }

  nodes.push(groupNode);
  layoutNodes.push(layout);

  // Must cache children because the DOM is modified recursively
  var children = [...node.children];

  for (var i = 0; i < children.length; ++i) {
    var childNode = children[i];
    if (!childNode.layoutStyle) break;
    var childLayout = parseNodeHierarchy(childNode, nodes, layoutNodes);
    layout.children.push(childLayout);
  }

  return layout;
}

export function computeLayout(size, nodes, layoutNodes) {
  // debugger;
  layoutNodes[0].style.width = size.width;
  layoutNodes[0].style.height = size.height;

  var dimensions = ['width', 'height'];

  // Set 'fit-content' dimensions
  for (var i = 0; i < nodes.length; ++i) {
    for (var j = 0; j < dimensions.length; ++j) {
      if (nodes[i].layoutStyle[dimensions[j]] === 'max-content') {
        delete layoutNodes[i].style[dimensions[j]];
      }

      if (nodes[i].layoutStyle[dimensions[j]] === 'fit-content') {
        layoutNodes[i].style[dimensions[j]] = nodes[i].getBoundingClientRect()[dimensions[j]];
        console.log(nodes[i]);
        console.log(
          `${dimensions[j]}: ${nodes[i].layoutStyle[dimensions[j]]} → ${
            layoutNodes[i].style[dimensions[j]]
          }`
        );
      }
    }
  }

  faberComputeLayout(layoutNodes[0]);

  // Set 'max-content' dimensions
  for (var i = 0; i < nodes.length; ++i) {
    for (var j = 0; j < dimensions.length; ++j) {
      if (nodes[i].layoutStyle[dimensions[j]] === 'max-content') {
        layoutNodes[i].style[dimensions[j]] = layoutNodes[i].layout[dimensions[j]];
        console.log(nodes[i]);
        console.log(
          `${dimensions[j]}: ${nodes[i].layoutStyle[dimensions[j]]} → ${
            layoutNodes[i].style[dimensions[j]]
          }`
        );
      }
    }
  }

  faberComputeLayout(layoutNodes[0]);
}

export function applyLayout(nodes, layoutNodes) {
  // Apply a translation on all laid out nodes to mirror the layout.
  for (var i = 0; i < nodes.length; ++i) {
    var layoutTransform = `translate(${layoutNodes[i].layout.x}, ${layoutNodes[i].layout.y})`;
    nodes[i].setAttribute('transform', layoutTransform);
    nodes[i].setAttribute(
      'debugLayout',
      `${layoutNodes[i].layout.x}, ${layoutNodes[i].layout.y}, ${layoutNodes[i].layout.width}, ${layoutNodes[i].layout.height}`
    );
    nodes[i].setAttribute(
      'debugLayoutStyle',
      `${JSON.stringify(layoutNodes[i].style)
        .replace(/\"/g, '')
        .replace(/,/g, ', ')
        .replace(/:/g, ': ')}`
    );
  }
}
