import * as d3 from 'd3';

function renderTicks(selection, position, scale) {
  selection
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
    .select('.ticks')
    .call(renderTicks, 'Left', scale)
    .call(function (ticksSelection) {
      var boundingRect = ticksSelection.node().getBoundingClientRect();
      ticksSelection.attr('transform', `translate(${boundingRect.width}, 0)`);
    });
}

export function renderBottomTicks(selection, scale) {
  selection.select('.ticks').call(renderTicks, 'Bottom', scale);
}

export function renderTitle(selection, title) {
  selection.select('.title').text(title);
}

function ticks() {
  var _scale;
  var _position;
  var _updateScale = function () {};
  var _updatePosition = function () {};

  function _ticks(selection) {
    function render(selection) {
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

    _updateScale = function () {
      selection.call(render);
    };

    _updatePosition = function () {
      selection.call(render);
    };
  }

  _ticks.scale = function (scale) {
    if (arguments.length === 0) return _scale;
    _scale = scale;
    _updateScale();
    return _ticks;
  };

  _ticks.position = function (position) {
    if (arguments.length === 0) return _position;
    _position = position;
    _updatePosition();
    return _ticks;
  };

  return _ticks;
}

export function axis() {
  var _ticks;
  var _title;
  var _updateTicks = function () {};
  var _updateTitle = function () {};

  function _axis(selection) {
    selection.call(ticks).call(title);

    function title(selection) {
      selection.select('.title').text(_title);
    }

    _updateTitle = function () {
      selection.call(title);
    };
  }

  _axis.ticks = function (ticks) {
    if (arguments.length === 0) return _ticks;
    _ticks = ticks;
    _updateTicks();
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
