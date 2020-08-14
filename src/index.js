import * as d3 from 'd3';
import {
  parseDOMHierarchy,
  createLayoutGroups,
  removeLayoutGroups,
  computeLayout,
  applyLayout,
} from './layout';
import { renderLeftTicks, renderBottomTicks, renderTitle, clearTickAttributes } from './axis';
import { renderVerticalBars, renderHorizontalBars } from './bars';
import { chainedTransition } from './transition';
import debounce from 'debounce';

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
  },
  categoricAxis: {
    title: 'Countries',
  },
  barDirection: 'Horizontal', // 'Vertical' or 'Horizontal'
};

var mediumMediaQuery = window.matchMedia('screen and (min-width: 40rem)');
config.barDirection = mediumMediaQuery.matches ? 'Vertical' : 'Horizontal';

// Create the root node of the chart
var svgSelection = d3.select('#chart').append('svg').classed('chart bar-chart', true);

// Calculate bounding rect of the chart
var boundingRect = svgSelection.node().getBoundingClientRect();

var categoricScale = d3
  .scaleBand()
  .domain(data.map((d) => d.city))
  .padding(0.05);

var numericScale = d3.scaleLinear().domain([0, d3.max(data, (d) => d.population)]);

if (config.barDirection === 'Vertical') {
  categoricScale.range([0, boundingRect.width]);
  numericScale.range([boundingRect.height, 0]);
} else if (config.barDirection === 'Horizontal') {
  categoricScale.range([0, boundingRect.height]);
  numericScale.range([0, boundingRect.width]);
}

var numericAxisSelection = svgSelection
  .append('g')
  .classed('axis numeric-axis', true)
  .call(renderTitle, config.numericAxis.title);

var categoricAxisSelection = svgSelection
  .append('g')
  .classed('axis categoric-axis', true)
  .call(renderTitle, config.categoricAxis.title);

if (config.barDirection === 'Vertical') {
  numericAxisSelection.classed('left-axis', true).call(renderLeftTicks, numericScale);
  categoricAxisSelection.classed('bottom-axis', true).call(renderBottomTicks, categoricScale);
} else if (config.barDirection === 'Horizontal') {
  categoricAxisSelection.classed('left-axis', true).call(renderLeftTicks, categoricScale);
  numericAxisSelection.classed('bottom-axis', true).call(renderBottomTicks, numericScale);
}

var barsSelection = svgSelection.append('g').classed('bars', true).lower();

// Parse the DOM hierarchy
var { laidOutElements, layoutHierarchyNodes } = parseDOMHierarchy(svgSelection.node());
var layoutGroupElements = createLayoutGroups(laidOutElements);

resize();

var resizing = false;
var resizeIntervalHandle;
window.addEventListener('resize', function () {
  if (!resizing) {
    // console.log('start resize interval');
    resizing = true;
    resizeIntervalHandle = window.setInterval(resize, 10);
  }
});

window.addEventListener(
  'resize',
  debounce(function () {
    // console.log('stop resize interval');
    resizing = false;
    window.clearInterval(resizeIntervalHandle);
    updateLayout();
  }, 1000)
);

svgSelection.node().addEventListener('transitionstart', function (e) {
  d3.select(e.target).classed('transition', true);
});

svgSelection.node().addEventListener('transitionend', function (e) {
  d3.select(e.target).classed('transition', false);
});


function resize() {
  // Update the size of the bounding rect
  boundingRect = svgSelection.node().getBoundingClientRect();

  // Update the viewbox of the chart
  svgSelection.attr('viewBox', `0, 0, ${boundingRect.width}, ${boundingRect.height}`);

  computeLayout(laidOutElements, layoutHierarchyNodes, boundingRect);

  updateScales();
  updateAxes();

  renderBars(0);

  // Position the different nodes according to the layout
  applyLayout(layoutGroupElements, layoutHierarchyNodes, false);
}

// Resize the rangs of the scales to fit into the calculated layout
function updateScales() {
  var barsLayoutNode = layoutHierarchyNodes[laidOutElements.indexOf(barsSelection.node())];
  if (config.barDirection === 'Vertical') {
    categoricScale.range([0, barsLayoutNode.layout.width]);
    numericScale.range([barsLayoutNode.layout.height, 0]);
  } else if (config.barDirection === 'Horizontal') {
    categoricScale.range([0, barsLayoutNode.layout.height]);
    numericScale.range([0, barsLayoutNode.layout.width]);
  }
}

function updateAxes() {
  var barsLayoutNode = layoutHierarchyNodes[laidOutElements.indexOf(barsSelection.node())];
  if (config.barDirection === 'Vertical') {
    numericAxisSelection.call(renderLeftTicks, numericScale);
    categoricAxisSelection.call(renderBottomTicks, categoricScale);
  } else if (config.barDirection === 'Horizontal') {
    categoricAxisSelection.call(renderLeftTicks, categoricScale);
    numericAxisSelection.call(renderBottomTicks, numericScale);
  }
}

function renderBars(transitionDuration) {
  var barsData = data.map(function (d) {
    return { bandScaleValue: d.city, linearScaleValue: d.population };
  });

  var renderBars = config.barDirection === 'Vertical' ? renderVerticalBars : renderHorizontalBars;
  barsSelection.call(renderBars, barsData, categoricScale, numericScale, transitionDuration);
}

function updateLayout() {
  var newBarDirection = mediumMediaQuery.matches ? 'Vertical' : 'Horizontal'; 

  if (newBarDirection !== config.barDirection) {
    config.barDirection = newBarDirection;

    numericAxisSelection.call(clearTickAttributes);
    categoricAxisSelection.call(clearTickAttributes);

    if (newBarDirection === 'Vertical') {
      numericAxisSelection
        .classed('bottom-axis', false)
        .classed('left-axis', true)
        .call(renderLeftTicks, numericScale);
      categoricAxisSelection
        .classed('left-axis', false)
        .classed('bottom-axis', true)
        .call(renderBottomTicks, categoricScale);
    } else if (newBarDirection === 'Horizontal') {
      numericAxisSelection
        .classed('left-axis', false)
        .classed('bottom-axis', true)
        .call(renderBottomTicks, numericScale);
      categoricAxisSelection
        .classed('bottom-axis', false)
        .classed('left-axis', true)
        .call(renderLeftTicks, categoricScale);
    }

    computeLayout(laidOutElements, layoutHierarchyNodes, boundingRect);

    updateScales();
    updateAxes();

    renderBars(1000);

    applyLayout(layoutGroupElements, layoutHierarchyNodes, true);
  }
}
