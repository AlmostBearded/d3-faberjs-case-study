import * as d3 from 'd3';
import { parseCSSLayoutStyle, parseNodeHierarchy, computeLayout, applyLayout } from './layout';
// import { axis } from './axis';
import { renderLeftTicks, renderBottomTicks, renderTitle } from './axis';

// Data representing the populations of large Austrian cities
var data = [
  { city: 'Vienna', population: 1691000 },
  { city: 'Graz', population: 222000 },
  { city: 'Linz', population: 205000 },
  { city: 'Salzburg', population: 153000 },
  { city: 'Innsbruck', population: 132000 },
  { city: 'Klagenfurt', population: 91000 },
  { city: 'Villach', population: 59000 },
];

// Configuration for the chart
var config = {
  numericAxis: {
    title: 'Population',
    titleMargin: 10,
  },
  categoricAxis: {
    title: 'Countries',
    titleMargin: 10,
  },
  margin: 20,
};

// Calculate bounding rect of the chart
var boundingRect = getBoundingRect('#chart');

// Setting up the initial scales for the full size of the container
var categoricScale = d3
  .scaleBand()
  .domain(data.map((d) => d.city))
  .padding(0.05)
  .range([0, boundingRect.width]);

var numericScale = d3
  .scaleLinear()
  .domain([0, d3.max(data, (d) => d.population)])
  .range([boundingRect.height, 0]);

// Create the root node of the chart
var svgSelection = d3.select('#chart').append('svg').classed('chart bar-chart', true);

// Cached selection variables
var numericAxisSelection, categoricAxisSelection, barsSelection;

// Create an initial scaffold of the chart that reflects the desired layout
scaffoldChart();

// Initial rendering of the axes to access their sizes during layouting
numericAxisSelection
  .call(renderLeftTicks, numericScale)
  .call(renderTitle, config.numericAxis.title);
categoricAxisSelection
  .call(renderBottomTicks, categoricScale)
  .call(renderTitle, config.categoricAxis.title);
// var categoricAxis = axis()
//   .position('Bottom')
//   .scale(categoricScale)
//   .title(config.categoricAxis.title);
// var numericAxis = axis().position('Left').scale(numericScale).title(config.numericAxis.title);
// categoricAxisSelection.call(categoricAxis);
// numericAxisSelection.call(numericAxis);

// Parse the DOM hierarchy
var layoutDOMNodes = [];
var layoutNodes = [];
parseCSSLayoutStyle(svgSelection.node());
parseNodeHierarchy(svgSelection.node(), layoutDOMNodes, layoutNodes);
// console.log(layoutDOMNodes);
// console.log(layoutNodes);

// Update the layout to fit into the bounding rect dimensions
updateLayout();

window.addEventListener('resize', updateLayout);

// Get the bounding rect of a node
function getBoundingRect(selector) {
  var node = document.querySelector(selector);
  return node.getBoundingClientRect();
}

// Scaffold the desired layout of the chart
function scaffoldChart() {
  numericAxisSelection = svgSelection.append('g').classed('axis left-axis numeric-axis', true);
  {
    numericAxisSelection.append('text').classed('title', true);
    numericAxisSelection.append('g').classed('ticks', true);
  }
  barsSelection = svgSelection.append('g').classed('bars', true);
  categoricAxisSelection = svgSelection
    .append('g')
    .classed('axis bottom-axis categoric-axis', true);
  {
    categoricAxisSelection.append('g').classed('ticks', true);
    categoricAxisSelection.append('text').classed('title', true);
  }
}

function renderBars() {
  barsSelection
    .selectAll('rect')
    .data(data)
    .join('rect')
    .classed('bar', true)
    .attr('x', (d) => categoricScale(d.city))
    .attr('y', (d) => numericScale(d.population))
    .attr('height', (d) => numericScale(0) - numericScale(d.population))
    .attr('width', categoricScale.bandwidth());
}

function updateLayout() {
  // Update the size of the bounding rect
  boundingRect = getBoundingRect('#chart');

  // Update the viewbox of the chart
  svgSelection.attr('viewBox', `0, 0, ${boundingRect.width}, ${boundingRect.height}`);

  // Calculate the layout
  computeLayout(boundingRect, layoutDOMNodes, layoutNodes);

  // Resize the range of the scale to fit into the calculated size of the bar drawing area
  var barsLayout = layoutNodes[layoutDOMNodes.indexOf(barsSelection.node().parentNode)].layout;
  categoricScale.range([0, barsLayout.width]);
  numericScale.range([barsLayout.height, 0]);

  // Rerender the axes and render the bars now that the scales have correct ranges
  // categoricAxis.scale(categoricScale);
  // numericAxis.scale(numericScale);
  numericAxisSelection.call(renderLeftTicks, numericScale);
  categoricAxisSelection.call(renderBottomTicks, categoricScale);

  renderBars();

  // Position the different nodes according to the layout
  applyLayout(layoutDOMNodes, layoutNodes);
}
