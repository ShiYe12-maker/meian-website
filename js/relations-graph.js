(function () {
  var container = document.getElementById('relationsChart');
  if (!container) return;

  function initGraph() {
    if (typeof echarts === 'undefined') {
      setTimeout(initGraph, 200);
      return;
    }

    if (typeof GRAPH_DATA === 'undefined') {
      container.innerHTML = '<p style="text-align:center;padding:60px;">关系图谱数据加载中...</p>';
      return;
    }

    var prefix = GRAPH_DATA.prefix || '/';

    // 构建节点（仅人物，纯色圆点，带边框）
    var nodes = GRAPH_DATA.characters
      .filter(function (c) { return c.type !== 'artifact'; })
      .map(function (c) {
        return {
          id: c.id,
          name: c.name,
          symbolSize: 34 + c.importance * 10,
          itemStyle: { color: '#527158', borderColor: '#3d5543', borderWidth: 3 },
          emphasis: { itemStyle: { color: '#fbc707', borderColor: '#d4a605' } },
          birth: c.birth,
          death: c.death,
          summary: c.summary,
        };
      });

    // 构建边
    var lineStyleMap = {
      '师生': { type: 'solid' },
      '同志': { type: 'dashed' },
      '同届': { type: 'dotted' },
      '亲属': { type: 'solid', color: '#fbc707' },
    };

    var links = GRAPH_DATA.relations.map(function (r) {
      return {
        source: r.source,
        target: r.target,
        lineStyle: Object.assign({ color: '#999', width: 2 }, lineStyleMap[r.type] || {}),
        label: {
          show: true,
          formatter: r.type,
          fontSize: 11,
          color: '#333',
          backgroundColor: 'rgba(255,255,255,0.9)',
          padding: [2, 6],
          borderRadius: 3,
          borderColor: '#ccc',
          borderWidth: 1,
        },
      };
    });

    var chart = echarts.init(container);

    chart.setOption({
      tooltip: {
        formatter: function (params) {
          if (params.dataType === 'node') {
            return '<b>' + params.name + '</b><br/>' + (params.data.summary || '');
          }
          if (params.dataType === 'edge') {
            return params.data.label.formatter;
          }
          return '';
        },
      },
      series: [{
        type: 'graph',
        layout: 'force',
        roam: true,
        draggable: true,
        data: nodes,
        links: links,
        label: {
          show: true,
          position: 'bottom',
          fontSize: 12,
          fontWeight: 600,
          color: '#2c2c2c',
          distance: 6,
        },
        emphasis: {
          focus: 'adjacency',
          scale: 1.35,
        },
        force: {
          repulsion: 350,
          edgeLength: [140, 280],
          gravity: 0.08,
        },
        lineStyle: {
          color: '#999',
          curveness: 0.08,
        },
      }],
    });

    // 响应窗口大小
    window.addEventListener('resize', function () { chart.resize(); });

    // 点击节点 → 侧边栏
    var sidebar = document.getElementById('charSidebar');
    var sidebarContent = document.getElementById('sidebarContent');
    var sidebarClose = document.getElementById('sidebarClose');

    chart.on('click', function (params) {
      if (params.dataType === 'node') {
        var d = params.data;
        sidebarContent.innerHTML =
          '<div class="sidebar__name">' + d.name + '</div>' +
          (d.birth && d.death ? '<div class="sidebar__years">' + d.birth + ' – ' + d.death + '</div>' : '') +
          '<div class="sidebar__summary">' + (d.summary || '暂无简介') + '</div>' +
          '<a href="' + prefix + 'characters/' + d.id + '/" class="sidebar__link">查看详情 →</a>';
        sidebar.classList.add('open');
      }
    });

    sidebarClose.addEventListener('click', function () {
      sidebar.classList.remove('open');
    });
  }

  initGraph();
})();
