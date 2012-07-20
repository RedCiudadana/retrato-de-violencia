Map = (function ($) {
  var Estupros = {};

  function initialize(element, svgPath) {
    d3.xml(svgPath, 'image/svg+xml', function (xml) {
      element.html(xml.documentElement);

      _setupMunicipios();
      _loadEstupros();
    });
  }

  function _setupMunicipios() {
    d3.selectAll('path.str4').on('mouseover', _toggleActive)
    .on('mouseout', _toggleActive);
  };

  function _loadEstupros() {
    $.getJSON('data/dados_estupros.json', function (data) {
      Estupros = data;
    });
  }

  function _toggleActive() {
    var d3Element = d3.select(this),
    currentState = d3Element.classed('active');

    d3Element.classed('active', !currentState);
    _showInfo(d3Element.attr('id').replace(/.*_/, ''));
  };

  function _showInfo(codigo) {
    var municipio       = Estupros[codigo];
    if (!municipio) { return; }
    var nome_municipio  = "<h3>"+municipio.nome+"</h3>";
    var media_vitima    = "<p class='victim'>Vitima: <em>"+municipio.media_idade_vitima+"</em></p>";
    var media_autor     = "<p class='author'>Autor: <em>"+municipio.media_idade_autor+"</em></p>";
    var ocorrencias     = "<p>"+municipio.ocorrencias+" ocorrências na região</p>";
    $('#info').html(nome_municipio + media_vitima + media_autor + ocorrencias);
  }

  return {
    'initialize': initialize
  };
})(Zepto);

$(document).ready(function () {
  Map.initialize($('#map'), 'data/RioGrandedoSul_MesoMicroMunicip.svg');
});
