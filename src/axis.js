import * as d3 from 'd3';

export function axis() {
  var _scale;
  var _position;
  var _title;
  var _updateScale = function () {};
  var _updatePosition = function () {};
  var _updateTitle = function () {};

  function _axis(selection) {
    selection.call(ticks).call(title);

    function ticks(selection) {
      selection
        .select('.ticks')
        .call(d3[`axis${_position}`](_scale))
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
        )
        .call(function (ticksSelection) {
          if (_position === 'Left') {
            var boundingRect = ticksSelection.node().getBoundingClientRect();
            ticksSelection.attr('transform', `translate(${boundingRect.width}, 0)`);
          }
        });
    }

    function title(selection) {
      selection.select('.title').text(_title);
    }

    _updateScale = function () {
      selection.call(ticks);
    };

    _updatePosition = function () {
      selection.call(ticks);
    };

    _updateTitle = function () {
      selection.call(title);
    };
  }

  _axis.scale = function (scale) {
    if (arguments.length === 0) return _scale;
    _scale = scale;
    _updateScale();
    return _axis;
  };

  _axis.position = function (position) {
    if (arguments.length === 0) return _position;
    _position = position;
    _updatePosition();
    return _axis;
  };

  _axis.title = function (title) {
    if (arguments.length === 0) return _title;
    _title = title;
    _updateTitle();
    return _axis;
  };

  return _axis;
}