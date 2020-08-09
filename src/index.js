import * as d3 from 'd3';
import { parseDOMHierarchy, createLayoutGroups, computeLayout, applyLayout } from './layout';
// import { axis } from './axis';
import { renderLeftTicks, renderBottomTicks, renderTitle } from './axis';
import { renderVerticalBars } from './bars';

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

// Create the root node of the chart
var svgSelection = d3.select('#chart').append('svg').classed('chart bar-chart', true);

// Calculate bounding rect of the chart
var boundingRect = svgSelection.node().getBoundingClientRect();

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


// Create an initial scaffold of the chart
var numericAxisSelection = svgSelection
  .append('g')
  .classed('axis left-axis numeric-axis', true)
  .call(renderLeftTicks, numericScale)
  .call(renderTitle, config.numericAxis.title);

var categoricAxisSelection = svgSelection
  .append('g')
  .classed('axis bottom-axis categoric-axis', true)
  .call(renderBottomTicks, categoricScale)
  .call(renderTitle, config.categoricAxis.title);

var barsSelection = svgSelection.append('g').classed('bars', true);

// Parse the DOM hierarchy
var { laidOutElements, layoutHierarchyNodes } = parseDOMHierarchy(svgSelection.node());
var layoutGroupElements = createLayoutGroups(laidOutElements);

// Update the layout to fit into the bounding rect dimensions
updateLayout();

window.addEventListener('resize', updateLayout);

function updateLayout() {
  // Update the size of the bounding rect
  boundingRect = svgSelection.node().getBoundingClientRect();

  // Update the viewbox of the chart
  svgSelection.attr('viewBox', `0, 0, ${boundingRect.width}, ${boundingRect.height}`);

  // Calculate the layout
  computeLayout(laidOutElements, layoutHierarchyNodes, boundingRect);

  // Resize the range of the scale to fit into the calculated size of the bar drawing area
  var barsLayoutNode = layoutHierarchyNodes[laidOutElements.indexOf(barsSelection.node())];
  categoricScale.range([0, barsLayoutNode.layout.width]);
  numericScale.range([barsLayoutNode.layout.height, 0]);

  // Rerender the axes and render the bars now that the scales have correct ranges
  numericAxisSelection.call(renderLeftTicks, numericScale);
  categoricAxisSelection.call(renderBottomTicks, categoricScale);

  var barsData = data.map(function (d) {
    return { bandScaleValue: d.city, linearScaleValue: d.population };
  });
  barsSelection.call(renderVerticalBars, barsData, categoricScale, numericScale);

  // Position the different nodes according to the layout
  applyLayout(layoutGroupElements, layoutHierarchyNodes);
}
