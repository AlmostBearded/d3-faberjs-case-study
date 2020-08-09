export function renderVerticalBars(selection, data, bandScale, linearScale) {
  selection
    .selectAll('rect')
    .data(data)
    .join('rect')
    .classed('bar', true)
    .attr('x', (d) => bandScale(d.bandScaleValue))
    .attr('y', (d) => linearScale(d.linearScaleValue))
    .attr('height', (d) => linearScale(0) - linearScale(d.linearScaleValue))
    .attr('width', bandScale.bandwidth());
}
