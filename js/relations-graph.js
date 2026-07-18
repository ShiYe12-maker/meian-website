(function () {
  var attempts = 0;
  var MAX_ATTEMPTS = 25; // 约5秒后放弃轮询

  // 等待 ECharts 加载完成
  function init() {
    var container = document.getElementById('relationsChart');
    if (!container) return;

    if (typeof echarts === 'undefined') {
      attempts++;
      if (attempts >= MAX_ATTEMPTS) {
        container.innerHTML = '<p style="text-align:center;padding:60px;">图表加载失败，请刷新重试</p>';
        return;
      }
      setTimeout(init, 200);
      return;
    }

    // 数据由模板注入为全局变量（见 relations.njk）
    if (typeof GRAPH_DATA === 'undefined') {
      container.innerHTML = '<p style="text-align:center;padding:60px;">关系图谱数据加载中...</p>';
      return;
    }

    // 从页面内嵌的全局数据构建图谱
    var chart = echarts.init(container);

    // 构建节点（仅历史人物参与关系图谱，文物不显示）
    var nodes = GRAPH_DATA.characters
      .filter(function (c) { return c.type !== 'artifact'; })
      .map(function (c) {
        return {
          id: c.id,
          name: c.name,
          symbolSize: 20 + c.importance * 8,
          itemStyle: { color: '#527158' },
          emphasis: {
            itemStyle: { color: '#fbc707' },
          },
          // 携带额外数据供侧边栏使用
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
        lineStyle: Object.assign({ color: '#999', width: 1.5 }, lineStyleMap[r.type] || {}),
        label: {
          show: true,
          formatter: r.type,
          fontSize: 11,
          color: '#999',
        },
      };
    });

    var option = {
      tooltip: {
        formatter: function (params) {
          if (params.dataType === 'node') {
            return '<b>' + params.name + '</b><br/>' + (params.data.summary || '');
          }
          return params.data.label.formatter;
        },
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          roam: true,
          draggable: true,
          data: nodes,
          links: links,
          // 节点标签常显（不再需要悬停才显示人名）
          label: {
            show: true,
            position: 'bottom',
            fontSize: 12,
            color: '#2c2c2c',
          },
          force: {
            repulsion: 300,
            edgeLength: [120, 250],
            gravity: 0.1,
          },
          emphasis: {
            focus: 'adjacency',
          },
          lineStyle: {
            color: '#999',
            curveness: 0.1,
          },
        },
      ],
    };

    chart.setOption(option);

    // === 点击节点 → 侧边栏 ===
    var sidebar = document.getElementById('charSidebar');
    var sidebarContent = document.getElementById('sidebarContent');
    var sidebarClose = document.getElementById('sidebarClose');

    chart.on('click', function (params) {
      if (params.dataType === 'node') {
        var d = params.data;
        sidebarContent.innerHTML =
          '<div class="sidebar__name">' + d.name + '</div>' +
          (d.birth && d.death
            ? '<div class="sidebar__years">' + d.birth + ' – ' + d.death + '</div>'
            : '') +
          '<div class="sidebar__summary">' + (d.summary || '暂无简介') + '</div>' +
          '<a href="' + (GRAPH_DATA.prefix || '/') + 'characters/' + d.id + '/" class="sidebar__link">查看详情 →</a>';
        sidebar.classList.add('open');
      }
    });

    sidebarClose.addEventListener('click', function () {
      sidebar.classList.remove('open');
    });

    // 响应窗口大小
    window.addEventListener('resize', function () {
      chart.resize();
    });
  }

  init();
})();
