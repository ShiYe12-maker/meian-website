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

  // 数据由模板注入为全局变量（见 relations.njk）
  if (typeof GRAPH_DATA === 'undefined') {
    container.innerHTML = '<p style="text-align:center;padding:60px;">关系图谱数据加载中...</p>';
    return;
  }

  // 计算头像尺寸（按 importance 缩放）
  function avatarSize(c) {
    return 40 + c.importance * 10; // min 50, max 90
  }

  // Canvas 裁剪圆形头像 → data URL
  function makeCircularAvatar(img, size, borderColor) {
    var dpr = window.devicePixelRatio || 1;
    var canvas = document.createElement('canvas');
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // 裁切圆
    var r = size / 2;
    ctx.beginPath();
    ctx.arc(r, r, r - 2, 0, Math.PI * 2);
    ctx.clip();

    // 绘制图片（人物肖像偏上裁剪）
    var s = Math.min(img.width, img.height);
    var sx = (img.width - s) / 2;
    var sy = Math.max(0, (img.height - s) * 0.15); // 脸部偏上
    ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);

    // 绿色描边环
    ctx.beginPath();
    ctx.arc(r, r, r - 2.5, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = borderColor || '#527158';
    ctx.stroke();

    return canvas.toDataURL('image/png');
  }

  // 预加载所有人物头像 → 生成圆形 data URL
  function buildAvatarNodes(characters, cb) {
    var persons = characters.filter(function (c) { return c.type !== 'artifact'; });
    var nodes = [];
    var loaded = 0;
    var total = persons.length;

    if (total === 0) { cb(nodes); return; }

    persons.forEach(function (c) {
      var size = avatarSize(c);

      // 无修复图 → 直接使用绿色圆形节点
      var fallbackNode = {
        id: c.id,
        name: c.name,
        symbolSize: size,
        itemStyle: { color: '#527158' },
        emphasis: { itemStyle: { color: '#fbc707' } },
        birth: c.birth,
        death: c.death,
        summary: c.summary,
      };
      if (!c.image) {
        nodes.push(fallbackNode);
        loaded++;
        if (loaded === total) cb(nodes);
        return;
      }

      var img = new Image();
      img.onload = function () {
        var avatarUrl = makeCircularAvatar(img, size, '#527158');
        nodes.push({
          id: c.id,
          name: c.name,
          symbolSize: size,
          symbol: 'image://' + avatarUrl,
          // 携带侧边栏用数据
          birth: c.birth,
          death: c.death,
          summary: c.summary,
        });
        loaded++;
        if (loaded === total) cb(nodes);
      };
      img.onerror = function () {
        // 头像加载失败 → 回落为绿色圆形
        nodes.push(fallbackNode);
        loaded++;
        if (loaded === total) cb(nodes);
      };
      img.src = GRAPH_DATA.prefix + c.image.replace(/^\//, '');
    });
  }

  // 构建边（线型 + 样式映射）
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

  // === 初始化图表 ===
  waitForECharts(function () {
    buildAvatarNodes(GRAPH_DATA.characters, function (nodes) {
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
            // 节点标签常显（人名在头像下方）
            label: {
              show: true,
              position: 'bottom',
              fontSize: 12,
              fontWeight: 600,
              color: '#2c2c2c',
              distance: 6,
            },
            // hover 时放大
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
            '<a href="' + (GRAPH_DATA.prefix || '/') + 'characters/' + d.id + '/" class="sidebar__link">查看详情 →</a>';
          sidebar.classList.add('open');
        }
      });

      sidebarClose.addEventListener('click', function () {
        sidebar.classList.remove('open');
      });
    });
  });
})();
