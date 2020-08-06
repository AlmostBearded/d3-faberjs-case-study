import * as d3 from 'd3';
import { parseNodeHierarchy, computeLayout, applyLayout } from './layout';

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
var svgSelection = d3.select('#chart').append('svg');

// Cached selection variables
var numericAxisSelection, categoricAxisSelection, barsSelection;

// Create an initial scaffold of the chart that reflects the desired layout
scaffoldChart();

// Initial rendering of the axes to access their sizes during layouting
renderCategoricAxis();
renderNumericAxis();

// Parse the DOM hierarchy
var layoutDOMNodes = [];
var layoutNodes = [];
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
  // This function has been organized using unnecessary blocks to reflect nesting of nodes

  svgSelection.each(function () {
    this.layoutStyle = {
      display: 'grid',
      gridTemplateColumns: `[.] ${config.margin} [axis] auto [bars] 1fr [.] ${config.margin}`,
      gridTemplateRows: `[.] ${config.margin} [bars] 1fr [axis] auto [.] ${config.margin}`,
      justifyItems: 'stretch',
      alignItems: 'stretch',
    };
  });
  {
    numericAxisSelection = svgSelection
      .append('g')
      .classed('axis left-axis numeric-axis', true)
      .each(function () {
        this.layoutStyle = {
          display: 'grid',
          height: 'layout',
          gridTemplateColumns: `[title] auto [margin] ${config.numericAxis.titleMargin} [ticks] auto`,
          gridColumn: 'axis / span 1',
          gridRow: 'bars / span 1',
        };
      });
    {
      numericAxisSelection
        .append('text')
        .classed('title', true)
        .each(function () {
          this.layoutStyle = {
            width: 'auto',
            height: 'auto',
            gridColumn: 'title / span 1',
            gridRow: '1 / span 1',
            alignSelf: 'center',
          };
        });
      numericAxisSelection
        .append('g')
        .classed('ticks', true)
        .each(function () {
          this.layoutStyle = { width: 'auto', gridColumn: 'ticks / span 1', gridRow: '1 / span 1' };
        });
    }
    barsSelection = svgSelection
      .append('g')
      .classed('bars', true)
      .each(function () {
        this.layoutStyle = { gridColumn: 'bars / span 1', gridRow: 'bars / span 1' };
      });
  }
  categoricAxisSelection = svgSelection
    .append('g')
    .classed('axis bottom-axis categoric-axis', true)
    .each(function () {
      this.layoutStyle = {
        width: 'layout',
        display: 'grid',
        gridTemplateRows: `[ticks] auto [margin] ${config.categoricAxis.titleMargin} [title] auto`,
        gridColumn: 'bars / span 1',
        gridRow: 'axis / span 1',
      };
    });
  {
    categoricAxisSelection
      .append('g')
      .classed('ticks', true)
      .each(function () {
        this.layoutStyle = {
          height: 'auto',
          gridColumn: '1 / span 1',
          gridRow: 'ticks / span 1',
        };
      });
    categoricAxisSelection
      .append('text')
      .classed('title', true)
      .each(function () {
        this.layoutStyle = {
          height: 'auto',
          width: 'auto',
          gridColumn: '1 / span 1',
          gridRow: 'title / span 1',
          justifySelf: 'center',
        };
      });
  }
}

function renderCategoricAxis() {
  categoricAxisSelection
    .select('.ticks')
    .call(d3.axisBottom(categoricScale))
    .attr('font-size', null)
    .attr('font-family', null)
    .attr('text-anchor', null)
    .attr('fill', null)
    .call((ticks) => ticks.selectAll('text').attr('dy', null))
    .call((ticks) => ticks.select('.domain').attr('stroke', null))
    .call((ticks) =>
      ticks
        .selectAll('.tick')
        .attr('opacity', null)
        .call((tick) => tick.select('line').attr('stroke', null))
        .call((tick) => tick.select('text').attr('fill', null))
    );

  categoricAxisSelection.select('.title').text(config.categoricAxis.title || '');
}

function renderNumericAxis() {
  numericAxisSelection.select('.title').text(config.numericAxis.title || '');

  numericAxisSelection
    .select('.ticks')
    .call(d3.axisLeft(numericScale))
    .attr('font-size', null)
    .attr('font-family', null)
    .attr('text-anchor', null)
    .attr('fill', null)
    .call((ticks) =>
      ticks.attr('transform', `translate(${ticks.node().getBoundingClientRect().width}, 0)`)
    )
    .call((ticks) => ticks.selectAll('text').attr('dy', null))
    .call((ticks) => ticks.select('.domain').attr('stroke', null))
    .call((ticks) =>
      ticks
        .selectAll('.tick')
        .attr('opacity', null)
        .call((tick) => tick.select('line').attr('stroke', null))
        .call((tick) => tick.select('text').attr('fill', null))
    );
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
  renderCategoricAxis();
  renderNumericAxis();
  renderBars();

  // Position the different nodes according to the layout
  applyLayout(layoutDOMNodes, layoutNodes);
}
