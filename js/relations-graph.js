(function () {
  var container = document.getElementById('relationsChart');
  if (!container) return;

  function fail(msg) {
    container.innerHTML = '<p style="text-align:center;padding:60px;color:var(--color-text-light);">' + msg + '</p>';
  }

  function initGraph() {
    if (typeof echarts === 'undefined') { setTimeout(initGraph, 200); return; }
    if (typeof GRAPH_DATA === 'undefined') { fail('关系图谱数据加载中...'); return; }

    var prefix = GRAPH_DATA.prefix || '/';

    // 过滤人物
    var persons = GRAPH_DATA.characters.filter(function (c) { return c.type !== 'artifact'; });

    // Canvas 裁剪圆形头像
    function makeAvatar(img, size) {
      var dpr = window.devicePixelRatio || 1;
      var canvas = document.createElement('canvas');
      var sz = size * dpr;
      canvas.width = sz; canvas.height = sz;
      var ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      var r = size / 2;
      // 圆形裁剪
      ctx.beginPath();
      ctx.arc(r, r, r - 2, 0, Math.PI * 2);
      ctx.clip();
      // 居中裁切（人脸偏上）
      var s = Math.min(img.width, img.height);
      var sx = (img.width - s) / 2;
      var sy = Math.max(0, (img.height - s) * 0.1);
      ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);
      // 绿色描边
      ctx.beginPath();
      ctx.arc(r, r, r - 2.5, 0, Math.PI * 2);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#527158';
      ctx.stroke();

      return canvas.toDataURL('image/png');
    }

    // 预加载所有头像，全部就绪后再初始化图表
    var total = persons.length;
    var loaded = 0;
    var nodeData = new Array(total);

    function tryBuild() {
      loaded++;
      if (loaded === total) buildChart();
    }

    persons.forEach(function (c, i) {
      var size = 40 + c.importance * 10;
      var baseNode = {
        id: c.id, name: c.name, symbolSize: size,
        birth: c.birth, death: c.death, summary: c.summary,
      };

      if (!c.image) {
        // 无图片：绿色圆点
        nodeData[i] = Object.assign({}, baseNode, {
          itemStyle: { color: '#527158', borderColor: '#3d5543', borderWidth: 3 },
          emphasis: { itemStyle: { color: '#fbc707' } },
        });
        tryBuild();
        return;
      }

      var img = new Image();
      var done = false;
      var timeout = setTimeout(function () {
        if (done) return; done = true;
        nodeData[i] = Object.assign({}, baseNode, {
          itemStyle: { color: '#527158', borderColor: '#3d5543', borderWidth: 3 },
          emphasis: { itemStyle: { color: '#fbc707' } },
        });
        tryBuild();
      }, 8000);

      img.onload = function () {
        if (done) return; done = true; clearTimeout(timeout);
        try {
          var dataUrl = makeAvatar(img, size);
          nodeData[i] = Object.assign({}, baseNode, {
            symbol: 'image://' + dataUrl,
            symbolSize: size,
          });
        } catch (e) {
          nodeData[i] = Object.assign({}, baseNode, {
            itemStyle: { color: '#527158', borderColor: '#3d5543', borderWidth: 3 },
            emphasis: { itemStyle: { color: '#fbc707' } },
          });
        }
        tryBuild();
      };

      img.onerror = function () {
        if (done) return; done = true; clearTimeout(timeout);
        nodeData[i] = Object.assign({}, baseNode, {
          itemStyle: { color: '#527158', borderColor: '#3d5543', borderWidth: 3 },
          emphasis: { itemStyle: { color: '#fbc707' } },
        });
        tryBuild();
      };

      img.src = prefix + c.image.replace(/^\//, '');
    });

    function buildChart() {
      // 构建边
      var lineStyleMap = {
        '师生': { type: 'solid' },
        '同志': { type: 'dashed' },
        '同届': { type: 'dotted' },
        '亲属': { type: 'solid', color: '#fbc707' },
      };

      var links = GRAPH_DATA.relations.map(function (r) {
        return {
          source: r.source, target: r.target,
          lineStyle: Object.assign({ color: '#999', width: 2 }, lineStyleMap[r.type] || {}),
          label: {
            show: true, formatter: r.type, fontSize: 11, color: '#333',
            backgroundColor: 'rgba(255,255,255,0.9)', padding: [2, 6],
            borderRadius: 3, borderColor: '#ccc', borderWidth: 1,
          },
        };
      });

      var chart = echarts.init(container);

      chart.setOption({
        tooltip: {
          formatter: function (p) {
            if (p.dataType === 'node') return '<b>' + p.name + '</b><br/>' + (p.data.summary || '');
            if (p.dataType === 'edge') return p.data.label.formatter;
            return '';
          },
        },
        series: [{
          type: 'graph', layout: 'force', roam: true, draggable: true,
          data: nodeData, links: links,
          label: { show: true, position: 'bottom', fontSize: 12, fontWeight: 600, color: '#2c2c2c', distance: 6 },
          emphasis: { focus: 'adjacency', scale: 1.35 },
          force: { initLayout: 'circular', repulsion: 200, edgeLength: [100, 200], gravity: 0.3 },
          center: ['50%', '50%'],
          lineStyle: { color: '#999', curveness: 0.08 },
        }],
      });

      window.addEventListener('resize', function () { chart.resize(); });

      // 侧边栏
      var sidebar = document.getElementById('charSidebar');
      var sidebarContent = document.getElementById('sidebarContent');
      var sidebarClose = document.getElementById('sidebarClose');

      chart.on('click', function (p) {
        if (p.dataType === 'node') {
          var d = p.data;
          sidebarContent.innerHTML =
            '<div class="sidebar__name">' + d.name + '</div>' +
            (d.birth && d.death ? '<div class="sidebar__years">' + d.birth + ' – ' + d.death + '</div>' : '') +
            '<div class="sidebar__summary">' + (d.summary || '暂无简介') + '</div>' +
            '<a href="' + prefix + 'characters/' + d.id + '/" class="sidebar__link">查看详情 →</a>';
          sidebar.classList.add('open');
        }
      });

      sidebarClose.addEventListener('click', function () { sidebar.classList.remove('open'); });
    }
  }

  initGraph();
})();
