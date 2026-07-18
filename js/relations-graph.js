(function () {
  var container = document.getElementById('relationsChart');
  if (!container) return;

  // 等待 ECharts 加载完成
  function waitForECharts(cb) {
    if (typeof echarts !== 'undefined') { cb(); return; }
    var n = 0;
    var t = setInterval(function () {
      n++;
      if (typeof echarts !== 'undefined') { clearInterval(t); cb(); }
      else if (n >= 25) { container.innerHTML = '<p style="text-align:center;padding:60px;">图表加载失败，请刷新重试</p>'; clearInterval(t); }
    }, 200);
  }

  // 数据由模板注入
  if (typeof GRAPH_DATA === 'undefined') {
    container.innerHTML = '<p style="text-align:center;padding:60px;">关系图谱数据加载中...</p>';
    return;
  }

  var prefix = GRAPH_DATA.prefix || '/';

  // 构建节点 — 先用纯色圆点（立即渲染）
  var nodes = GRAPH_DATA.characters
    .filter(function (c) { return c.type !== 'artifact'; })
    .map(function (c) {
      return {
        id: c.id,
        name: c.name,
        symbolSize: 34 + c.importance * 10,
        itemStyle: { color: '#527158', borderColor: '#3d5543', borderWidth: 2 },
        emphasis: { itemStyle: { color: '#fbc707' } },
        birth: c.birth,
        death: c.death,
        summary: c.summary,
        imagePath: c.image, // 保存路径供异步换头像
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
        backgroundColor: 'rgba(255,255,255,0.85)',
        padding: [2, 6],
        borderRadius: 3,
        borderColor: '#ccc',
        borderWidth: 1,
      },
    };
  });

  // === 初始化图表（用纯色圆点，立即显示） ===
  waitForECharts(function () {
    var chart = echarts.init(container);

    var option = {
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
      series: [
        {
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
        },
      ],
    };

    chart.setOption(option);

    // === 异步加载头像替换圆点 ===
    nodes.forEach(function (node) {
      if (!node.imagePath) return;
      var img = new Image();
      img.onload = function () {
        var size = node.symbolSize;
        var dpr = window.devicePixelRatio || 1;
        var canvas = document.createElement('canvas');
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        var ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        var r = size / 2;
        ctx.beginPath();
        ctx.arc(r, r, r - 2, 0, Math.PI * 2);
        ctx.clip();

        var s = Math.min(img.width, img.height);
        var sx = (img.width - s) / 2;
        var sy = Math.max(0, (img.height - s) * 0.15);
        ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);

        ctx.beginPath();
        ctx.arc(r, r, r - 2.5, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#527158';
        ctx.stroke();

        // 更新节点为圆形头像
        chart.setOption({
          series: [{
            data: [{
              id: node.id,
              symbol: 'image://' + canvas.toDataURL('image/png'),
              symbolSize: size,
            }],
          }],
        });
      };
      img.onerror = function () {
        // 保持纯色圆点，无需操作
      };
      // 拼接完整 URL
      img.src = prefix + node.imagePath.replace(/^\//, '');
    });

    // === 响应窗口大小 ===
    window.addEventListener('resize', function () {
      chart.resize();
    });

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
          '<a href="' + prefix + 'characters/' + d.id + '/" class="sidebar__link">查看详情 →</a>';
        sidebar.classList.add('open');
      }
    });

    sidebarClose.addEventListener('click', function () {
      sidebar.classList.remove('open');
    });
  });
})();
