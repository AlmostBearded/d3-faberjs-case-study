import { chainedTransition } from './transition';

export function renderVerticalBars(selection, data, bandScale, linearScale, transitionDuration) {
  selection
    .selectAll('rect')
    .data(data)
    .join('rect')
    .classed('bar', true)
    .each(function (d) {
      chainedTransition(this)
        .duration(transitionDuration)
        .attr('x', bandScale(d.bandScaleValue))
        .attr('y', linearScale(d.linearScaleValue))
        .attr('height', linearScale(0) - linearScale(d.linearScaleValue))
        .attr('width', bandScale.bandwidth());
    });
}

export function renderHorizontalBars(selection, data, bandScale, linearScale, transitionDuration) {
  selection
    .selectAll('rect')
    .data(data)
    .join('rect')
    .classed('bar', true)
    .each(function (d) {
      chainedTransition(this)
        .duration(transitionDuration)
        .attr('x', linearScale(0))
        .attr('y', bandScale(d.bandScaleValue))
        .attr('height', bandScale.bandwidth())
        .attr('width', linearScale(d.linearScaleValue));
    });
}
