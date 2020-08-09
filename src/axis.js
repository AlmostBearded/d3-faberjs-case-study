import * as d3 from 'd3';

function renderTicks(selection, position, scale) {
  selection
    .selectAll('.ticks')
    .data([null])
    .join('g')
    .classed('ticks', true)
    .call(d3[`axis${position}`](scale))
    .attr('font-size', null)
    .attr('font-family', null)
    .attr('text-anchor', null)
    .attr('fill', null)
    .call((ticksSelection) => ticksSelection.selectAll('text').attr('dy', null))
    .call((ticksSelection) => ticksSelection.select('.domain').attr('stroke', null))
    .call((ticksSelection) =>
      ticksSelection
        .selectAll('.tick')
        .attr('opacity', null)
        .call((tick) => tick.select('line').attr('stroke', null))
        .call((tick) => tick.select('text').attr('fill', null))
    );
}

export function renderLeftTicks(selection, scale) {
  selection
    .call(renderTicks, 'Left', scale)
    .selectAll('.ticks')
    .call(function (ticksSelection) {
      var boundingRect = ticksSelection.node().getBoundingClientRect();
      ticksSelection.attr('transform', `translate(${boundingRect.width}, 0)`);
    });
}

export function renderBottomTicks(selection, scale) {
  selection.call(renderTicks, 'Bottom', scale);
}

export function renderTitle(selection, title) {
  selection.selectAll('.title').data([null]).join('text').classed('title', true).text(title);
}
