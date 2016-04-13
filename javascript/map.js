
Map = (function ($) {
  var Estupros = {};

  function initialize(element, svgPath) {
    d3.xml(svgPath, 'image/svg+xml', function (xml) {
      element.html(xml.documentElement);

      _setupCallbacks();
      _loadEstupros(function () {
        var focusedElementSlug = window.location.hash.replace('#', '');
        // Use Soledade as default
        if (focusedElementSlug == '') { focusedElementSlug = 'guatemala'; };
        _focusInto(focusedElementSlug);
        _drawBars();
        _colorRegions();
      });
    });
  };

  function _setupCallbacks() {
    d3.selectAll('path.str3')
      .on('mouseover', _hoverRegion)
      .on('click', _selectRegion);
  };

  function _hoverRegion() {
    _classOnlyThisAs(this.id, 'hover');
  };

  function _classOnlyThisAs(id, className) {
    d3.selectAll('.'+className).classed(className, false);
    d3.selectAll('.'+id).classed(className, true);
  };

  function _selectRegion() {
    var id = this.id,
        codigo = id.replace(/.*_/, '');

    _classOnlyThisAs(id, 'active');
    _draw_timeline(codigo);
    _showInfo(codigo);
    window.location.hash = $.slug(Estupros[codigo].nome);

    if (_gaq) {
      _gaq.push([
        '_trackPageview',
        window.location.pathname + window.location.hash
      ]);
    }
  };

  function _showInfo(codigo) {
    var regiao = Estupros[codigo];
    if (!regiao) { return; }

    var day = Math.round(100 * regiao.pela_manha / regiao.ocorrencias),
        night = 100 - day,
        ranking = _keysSortedByOpacity().indexOf(codigo) + 1,
        proporcao = regiao.proporcao,
        home = Math.round((100 * regiao.local.residencia) / regiao.ocorrencias),
        street = Math.round((100 * regiao.local.via_publica) / regiao.ocorrencias),
        others = 100 - home - street;

    $('#info h3').text(regiao.nome);
    $('.population em').text(_formatNumber(regiao.populacao));
    $('.victim em').text(regiao.media_idade_vitima);
    $('.author em').text(regiao.media_idade_autor);
    $('.night em').text(night+'%');
    $('.day em').text(day+'%');
    $('.home em').text(home+'%');
    $('.street em').text(street+'%');
    $('.others em').text(others+'%');
    $('.ranking em').text(ranking+'ª');
    $('.proporcao em').text(proporcao);
  };

  function _formatNumber(number) {
    return number.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  };

  function _loadEstupros(callback) {
    $.getJSON('data/dados_estupros.json', function (data) {
      Estupros = data;
      callback();
    });
  };

  function _focusInto(slug) {
    var element;

    for (id in Estupros) {
      if ($.slug(Estupros[id].nome) == slug) {
        element = document.getElementById('micro_'+id);
        break;
      }
    }

    if (!element) { return; }

    d3.select(element).on('click').call(element);
  };

  function _colorRegions() {
    d3.selectAll('path.str3')
      .attr('style', function () {
          var id = d3.select(this).attr('id').replace(/.*_/, '');
          return 'fill-opacity: '+Estupros[id].range / 5;
      })
      .each(function () {
          var d3Element = d3.select(this);
          d3Element.classed(d3Element.attr('id'), true);
      });

    d3.selectAll('.bar-graph li')
      .each(function (id) {
        var d3RegionMap = d3.select('path.'+this.classList[0]),
            opacity = d3RegionMap.attr('style').replace(/.*: (.*);?/, '$1'),
            span = d3.select(this).select('span');
        span.attr('style', span.attr('style') + '; background-color: rgba(51,92,144,'+ opacity +') !important;');
      });
  };

  function _drawBars() {
    d3.select('.bar-graph').append('ul').selectAll('li')
      .data(_keysSortedByOpacity()).enter().append('li')
      .attr('class', function (id) { return 'micro_'+id; })
      .html(_barInfo)
      .on('mouseover', _hoverBar)
      .on('click', _clickRegion);
  };

  function _keysSortedByOpacity() {
    var sortedKeys = Object.keys(Estupros);

    sortedKeys.sort(function (a, b) {
      return parseFloat(Estupros[b].opacity) - parseFloat(Estupros[a].opacity)
    });

    return sortedKeys;
  };

  function _barInfo(id) {
    var regiao = Estupros[id],
        meter = "<span class='meter' style='width: "+regiao.opacity*100+"%'>"+regiao.nome+"</span>";

    return meter;
  }

  function _hoverBar(id) {
    _classOnlyThisAs('micro_'+id, 'hover');
  };

  function _clickRegion(id) {
    _sendEventToRegion(id, 'click');
  };

  function _sendEventToRegion(id, eventName) {
    var region = document.getElementById('micro_'+id);
    d3.select(region).on(eventName).call(region);
  };

  function _draw_timeline(cod) {
    var regiao = Estupros[cod];
    var years = [];
    $.each(regiao.anos, function(i, v) {
      years.push(v);
    });
    
    $(".timeline span").sparkline(years, {
      type: 'bar',
      height: '40',
      barWidth: 20,
      barSpacing: 1,
      chartRangeMin: 0,
      barColor: '#ffffff'});
  };

  return {
    'initialize': initialize
  };
})(jQuery);

$(document).ready(function () {
  // Map.initialize($('#map'), '/data/RioGrandedoSul_MesoMicroMunicip.svg');
  Map.initialize($('#map'), 'data/guatemalaLow.svg');

  $("#cta").click(function(e) {
    e.preventDefault();
    $(".modal").show();
  });
  $(".close-modal").click(function(e) {
    e.preventDefault();
    $(".modal").hide();
  });
});
