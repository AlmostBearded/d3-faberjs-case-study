import * as d3 from 'd3';

export function chainedTransition(node)  {
  const activeTransition = d3.active(node);
  return activeTransition ? activeTransition.transition() : d3.select(node).transition();
}