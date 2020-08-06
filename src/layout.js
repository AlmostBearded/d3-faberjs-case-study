import { computeLayout as faberComputeLayout } from './faberjs';

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
  layoutNodes[0].style.width = size.width;
  layoutNodes[0].style.height = size.height;

  var dimensions = ['width', 'height'];

  // Set 'auto' dimensions
  for (var i = 0; i < nodes.length; ++i) {
    for (var j = 0; j < dimensions.length; ++j) {
      var value = nodes[i].layoutStyle[dimensions[j]];
      if (!value) continue;
      layoutNodes[i].style[dimensions[j]] =
        value === 'auto' ? nodes[i].getBoundingClientRect()[dimensions[j]] : value;
      // console.log(`${dimensions[j]}: ${value} → ${layoutNodes[i].style[dimensions[j]]}`);
    }
  }

  faberComputeLayout(layoutNodes[0]);

  // Set 'layout' dimensions
  for (var i = 0; i < nodes.length; ++i) {
    for (var j = 0; j < dimensions.length; ++j) {
      var value = layoutNodes[i].style[dimensions[j]];
      if (!value) continue;
      layoutNodes[i].style[dimensions[j]] =
        value === 'layout' ? layoutNodes[i].layout[dimensions[j]] : value;
      // console.log(`${dimensions[j]}: ${value} → ${layoutNodes[i].style[dimensions[j]]}`);
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
      `${JSON.stringify(nodes[i].layoutStyle).replace(/\"/g, '').replace(/,/g, ', ').replace(/:/g, ': ')}`
    );
  }
}
