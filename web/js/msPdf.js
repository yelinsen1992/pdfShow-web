function msg(title, time) { // 提示弹窗
  var copy = msg; /* 备份函数 */
  var msgBox = $("<div class='msg-box-wrap'><div class='msg-box'>" + title + "</div></div>");
  msgBox.remove();
  $('body').append(msgBox);
  if (!time) {
    var time = 800;
  };
  msg = function () { };  /* 销毁函数 */
  setTimeout(function () {
    msgBox.remove();
    msg = copy; /* 恢复函数 */
  }, time);
};
function loading(param) { // 数据加载动画
  if (typeof param != 'boolean') {
    param = param || '正在提交...'
    var html = '<div class="loading-bg-wrap"><div class="loading-bg">' +
      '<div class="loading"></div>' +
      '<p>' + param + '</p>';
    '</div></div>';
    $('.loading-bg-wrap')[0] ? $('.loading-bg-wrap').find('p').text(param) : $('body').prepend(html)
  } else if (param === false) {
    $('.loading-bg-wrap').remove()
  }
};
async function sleep(ms){
  return new Promise(resolve => {setTimeout(()=> {resolve(true)}, ms)});
};
; (function ($) {
  'use strict';
  $.fn.msPdf = function (o) {
    return new MsPdf(this, o);
  };
  var t;
  var MsPdf = function (el, o) {
    var defaults = {
      format: '.doc, .docx, .pdf, .png, .jpeg, .jpg', // 限制格式
      postUrl: '', // word文件转pdf后端接口，后端返回二进制文件
      timeout: 20000, // 请求超时设置，默认20秒
      pdfWidth: 793,
      postSuccess: null,
      imgSuccess: null,
      pdfSuccess: null,
      showView: 2,  // 默认展示类型，1长图，2逐页展示
      curPage: 1, // 分页显示，默认当前页
    };
    t = this;
    this.opts = $.extend(true, defaults, o);
    this.el = el;
    this.init(o);
  };
  function init() {
    creatHtml();
    updataSeal();
    bindFuc();
  };
  function creatHtml() {  // 渲染html结构
    t.el.attr('accept', t.opts.format).hide();
    var text = '分页查看'
    var showPage = 'display:none;'
    if (t.opts.showView == 2) {
      text = '查看长图', showPage = 'display:block;'
    };
    var html = '<div class="ms-pdf-box">' +
      '<div class="ms-seal-list" style="display:none;">' +
      '<div class="ms-opera-box">' +
      '<div class="ms-add-seal">添加印章</div>' +
      '<div class="ms-clear-seal" title="清空图上的印章">恢复原图</div>' +
      '<div class="ms-delete-seal" title="删除印章列表所有印章">删除印章</div>' +
      '<div class="ms-download-btn-single">保存单图</div>' +
      '<div class="ms-download-btn-long">保存长图</div>' +
      '</div>' +
      '</div>' +
      '<div class="ms-drap-box">' +
      '<div class="ms-center-box">' +
      '<div class="ms-btn-box">' +
      '<div class="ms-select-btn">选择文件</div>' +
      '<div class="ms-tranform-btn">docx转pdf</div>' +
      '<div class="ms-clear-file">清空文件</div>' +
      '</div>' +
      '<p>选择文件或拖拽到此处上传</p>' +
      '</div>' +
      '</div>' +
      '<div class="ms-pdf-wrap">' +
      '<div class="ms-fixed-right" style="display:none;">' +
      '<div class="ms-toggle-pdf">' + text + '</div>' +
      '<div class="ms-clear-seal">恢复原图</div>' +
      '<div class="ms-to-top">回到顶部</div>' +
      '<div class="ms-page-box" style="'+ showPage +'">' +
      '<p></p>' +
      '<p></p>' +
      '<div class="ms-page-toggle">' +
      '<div class="ms-prev"></div>' +
      '<div class="ms-next"></div>' +
      '<div class="ms-jump-number">跳到<input maxlength="2">页</div>' +
      '<div class="ms-jump-btn">确定跳转</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="ms-pdf-list"></div>' +
      '</div>' +
      '<input type="file" accept="images/png" class="ms-custom-seal" style="display:none;">' +
      '</div>';
    t.el.after(html);
    t.mainBox = t.el.siblings('.ms-pdf-box');
    t.drapBox = t.mainBox.find('.ms-drap-box');
    t.tipsEl = t.mainBox.find('.ms-center-box p');
  };
  function bindFuc() { // 绑定事件
    bindFucFile();
    bindMenuRight();
    bindMenuFixed();
  };
  function bindFucFile() { // 绑定文件上传操作事件
    t.el.change(function () { // 监听文件变化
      updataFuc(this.files);
    });
    t.drapBox.on('drop', function (e) { // 绑定拖拽事件
      e.stopPropagation();
      e.preventDefault();
      updataFuc(e.originalEvent.dataTransfer.files);
    });
    t.drapBox.on('dragover', function (e) { // 绑定拖拽事件
      e.stopPropagation();
      e.preventDefault();
    });
    t.mainBox.find('.ms-select-btn').click(function () { // 自定义选择文件
      t.el.click();
    });
    t.mainBox.find('.ms-tranform-btn').click(function () { // 转pdf按钮
      postPdf();
    });
    t.mainBox.find('.ms-clear-file').click(function () {  //清空文件
      updataFuc(false);
      t.mainBox.find('.ms-pdf-list').empty();
      msg('已清空文件');
    });
  };
  function bindMenuRight() { // 绑定右键菜单事件
    t.mainBox.find('.ms-pdf-list').on('mousedown', 'canvas', function (e) {  // 右键菜单
      if (e.which == 3) {
        var x = e.clientX;
        var y = document.documentElement.scrollTop + e.clientY;
        t.cvX = e.clientX - $(this).offset().left;
        t.cvY = document.documentElement.scrollTop + e.clientY - $(this).offset().top;
        t.mainBox.find('.ms-seal-list').show().css({ left: x, top: y });
        t.cvNum = $(this).index();
      } else {
        t.mainBox.find('.ms-seal-list').hide();
      };
    });
    t.mainBox.find('.ms-pdf-list, .ms-seal-list').on('contextmenu', function (e) { // 阻止默认右键事件
      e.preventDefault();
    });
    t.mainBox.find('.ms-add-seal').click(function() { // 自定义盖章
      t.mainBox.find('.ms-custom-seal').val('').click();
    });
    t.mainBox.find('.ms-custom-seal').change(function() {
      var files = this.files;
      var fileName = files[0].name.replace('.png', '');
      var reader = new FileReader();
      reader.readAsDataURL(files[0]);
      reader.onload = function(e) {
        var image = new Image();
        image.onload = function() {
          var base64 = e.target.result
          setStorage(base64, fileName);
          var cv = t.mainBox.find('.ms-pdf-wrap .ms-pdf-list canvas').eq(t.cvNum)[0];
          var cvx = cv.getContext('2d');
          var sealW = t.opts.pdfWidth * 150 / 793
          var scale = t.opts.pdfWidth / 793;
          var x = t.cvX * scale - sealW / 2;
          var y = t.cvY * scale - sealW / 2;
          cvx.globalAlpha = 0.7;
          cvx.drawImage(image, x, y, sealW, sealW);
          t.mainBox.find('.ms-seal-list').hide();
        };
        image.src = e.target.result;
      }
    });
    t.mainBox.find('.ms-seal-list').on('click', 'ul li', function() { // 盖章事件
      var index = $(this).index();
      var png = JSON.parse(localStorage.getItem(localStorage.key(index))).png
      sealOn(png);
    });
    t.mainBox.find('.ms-seal-list').on('click', 'ul li span', function() { // 删除单个印章
      var index = $(this).parent().index();
      localStorage.removeItem(localStorage.key(index));
      updataSeal();
      return false;
    });
    t.mainBox.find('.ms-seal-list').on('click', '.ms-delete-seal', function() {  // 删除印章列表
      localStorage.clear();
      updataSeal();
      msg('印章列表清空完毕');
    });
  };
  function bindMenuFixed() {  //绑定悬浮列表事件
    t.mainBox.find('.ms-clear-seal').click(function () {  // 清空印章，重新渲染pdf/图片
      if (t.pdf) {
        showPdf(t.pdf);
      } else if (t.pic) {
        showPic(t.pic);
      };
      t.mainBox.find('.ms-seal-list').hide();
    });
    t.mainBox.find('.ms-fixed-right .ms-toggle-pdf').click(function () { // 切换逐页/长图
      var ele = t.mainBox.find('.ms-fixed-right .ms-toggle-pdf');
      if (t.opts.showView === 1) {
        t.opts.showView = 2;
        ele.text('查看长图')
      } else {
        t.opts.showView = 1;
        ele.text('分页查看')
      }
      afterView();
      msg('切换成功');
    });
    t.mainBox.find('.ms-seal-list .ms-download-btn-single').click(async function () { // 下载单张图片
      loading('图片转换中...');
      await sleep(0);
      downLoadSingle();
      loading(false);
      t.mainBox.find('.ms-seal-list').hide();
    });
    t.mainBox.find('.ms-seal-list .ms-download-btn-long').click(async function() { // 下载长图
      loading('图片转换中...');
      await sleep(0);
      downLoadLong();
      loading(false);
      t.mainBox.find('.ms-seal-list').hide();
    });
    t.mainBox.find('.ms-fixed-right .ms-page-toggle .ms-prev').click(function () { // 上一页
      if (t.curPage == 1) {
        msg('已经是第一页了');
        return;
      };
      t.curPage--;
      pageChange()
    });
    t.mainBox.find('.ms-fixed-right .ms-page-toggle .ms-next').click(function () { // 下一页
      if (t.curPage >= t.pageNum) {
        msg('已经是最后一页了');
        return;
      };
      t.curPage++;
      pageChange()
    });
    t.mainBox.find('.ms-fixed-right .ms-to-top').click(function() { //回到顶部
      $('html,body').animate({
        scrollTop: 0,
      }, 500);
      msg('回到顶部了!');
    });
    t.mainBox.find('.ms-fixed-right .ms-jump-btn').click(function() { //页面跳转
      var page = t.mainBox.find('.ms-fixed-right .ms-jump-number input').val() * 1;
      if (page > 0 && page <= t.pageNum) {
        t.curPage = page;
        pageChange()
      } else {
        msg('页数不正确');
      };
    });
    t.mainBox.find('.ms-fixed-right').on('input', '.ms-jump-number input', function() {
      this.value = this.value.replace(/[^\d]/g,'') 
    });
    $(document).scroll(function () {  // 右侧悬浮菜单
      var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
      var offTop = t.mainBox.find('.ms-pdf-wrap').offset().top;
      if (scrollTop > offTop) {
        t.mainBox.find('.ms-fixed-right').css({ top: scrollTop - offTop });
      } else {
        t.mainBox.find('.ms-fixed-right').css({ top: 0 });
      }
    });
  };
  function pageChange() { //页数改变
    t.mainBox.find('.ms-pdf-list').children().hide().eq(t.curPage - 1).show();
    t.mainBox.find('.ms-fixed-right .ms-page-box p').eq(1).text('当前页 ' + t.curPage);
  };
  function sealOn(png) {  //选择印章列表中的印章
    var image = new Image();
    image.onload = function() {
      var cv = t.mainBox.find('.ms-pdf-wrap .ms-pdf-list canvas').eq(t.cvNum)[0];
      var cvx = cv.getContext('2d');
      var sealW = t.opts.pdfWidth * 150 / 793
      var scale = t.opts.pdfWidth / 793;
      var x = t.cvX * scale - sealW / 2;
      var y = t.cvY * scale - sealW / 2;
      cvx.globalAlpha = 0.7;
      cvx.drawImage(image, x, y, sealW, sealW);
      t.mainBox.find('.ms-seal-list').hide();
    };
    image.src = png;
  };
  function updataFuc(data) { //更新文件
    if (!data) {
      t.el.val('');
      t.pdf = null;
      t.tipsEl.text('选择文件或拖拽到此处上传');
      t.mainBox.find('.ms-fixed-right').hide();
      return false;
    };
    t.mainBox.find('.ms-fixed-right').hide();
    var name = data[0].name.substring(data[0].name.lastIndexOf("."));
    var str = t.opts.format;
    if (str.indexOf(name) == -1) {
      msg("文件格式不正确");
      return false;
    };
    loading('文件处理中...');
    $('.ms-pdf-list').empty();
    t.el[0].files = data;
    t.tipsEl.text(data[0].name);
    var files = t.el[0].files;
    t.fileName = files[0].name.substring(0, files[0].name.lastIndexOf('.'));
    if (name == '.pdf') {
      var reader = new FileReader();
      reader.readAsArrayBuffer(files[0]);
      reader.onload = function (e) {
        var typedarray = new Uint8Array(this.result);
        showPdf(typedarray);
      };
    } else if (name == '.jpg' || name == '.jpeg' || name == '.png') {
      var reader = new FileReader();
      reader.readAsDataURL(files[0]);
      reader.onload = function (e) {
        var image = new Image();
        image.onload = function () {
          showPic(this, image);
        };
        image.src = e.target.result;
      };
    } else {
      loading(false);
    };
  };
  function showPdf(data) { // 获取pdf对象
    t.pdf = data;
    var typedarray = new Uint8Array(data);
    pdfjsLib.getDocument(typedarray).promise.then(function (pdf) {
      if (pdf) {
        loading('pdf预览中...')
        t.mainBox.find('.ms-pdf-list').empty();
        t.singleCv = [];
        t.mainCv = null;
        t.pageNum = pdf.numPages;
        openPage(pdf, 1);
      }
    });
  };
  function showPic(image) { // 获取图片对象
    t.pic = image;
    t.pdf = null;
    t.curPage = 1;
    t.pageNum = 1;
    var scale = image.width / t.opts.pdfWidth;
    var canvasA = document.createElement('canvas');
    canvasA.id = 'mainCv';
    var contextA = canvasA.getContext('2d');
    canvasA.width = t.opts.pdfWidth;
    canvasA.height = image.height / scale;
    contextA.drawImage(image, 0, 0, canvasA.width, canvasA.height);
    t.mainBox.find('.ms-pdf-list').html(canvasA);
    loading(false);
    afterView();
    if (typeof t.opts.imgSuccess == 'function') {
      t.opts.imgSuccess();
    };
    msg('图片预览成功!');
  };
  function openPage(pdf, num) {  //pdf渲染canvas
    pdf.getPage(num).then(function (page) {
      var cv = document.createElement('canvas');
      cv.id = 'page-' + num;
      var context = cv.getContext('2d');
      var scale = 1;
      var viewport = page.getViewport({
        scale: 1,
      });
      if (viewport.width != t.opts.pdfWidth) {
        scale = t.opts.pdfWidth/viewport.width;
        viewport = page.getViewport({
          scale: scale
        })
      }
      cv.width = viewport.width;
      cv.height = viewport.height;
      t.cvW = cv.width;
      t.cvH = cv.height;
      var renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      page.render(renderContext).promise.then(function () {
        t.singleCv.push(cv);
        t.mainBox.find('.ms-pdf-list').append(cv)
        if (num < t.pageNum) {
          openPage(pdf, num + 1);
        } else if (t.pageNum == num) {
          loading(false);
          afterView();
          if (typeof t.opts.pdfSuccess == 'function') {
            t.opts.pdfSuccess();
          };
          msg('pdf预览成功!');
        };
      });
    });
  };
  async function postPdf () { // ajax请求word转pdf，返回二进制文件
    var files = t.el[0].files;
    if (files.length == 0) {
      msg('先上传文件');
      return false;
    };
    var extName = files[0].name.substring(files[0].name.lastIndexOf("."));
    if (extName != '.doc' && extName != '.docx') {
      msg('不是word文件，无需转换');
      return false;
    };
    var formdata = new FormData();
    formdata.append('file', files[0]);
    loading('文件转换中...');
    $.post({
      url: t.opts.postUrl,
      data: formdata,
      timeout: t.opts.timeout,
      cache: false,
      processData: false,
      contentType: false,
      success: function (data) {
        if (typeof t.opts.postSuccess == 'function') {
          t.opts.postSuccess();
        };
        loading(false);
        if (data.pdf) {
          showPdf(data.pdf.data);
        } else {
          msg('服务器出错了');
        }
      },
      error: function (err) {
        loading(false);
        msg('请求失败，网络不佳');
        console.error(err);
      }
    });
  };
  function downLoadSingle() { // 下载图片
    var cv = t.mainBox.find('.ms-pdf-wrap .ms-pdf-list canvas').eq(t.cvNum)[0];
    var oA = document.createElement('a');
    oA.download = t.fileName || '';
    oA.href = cv.toDataURL('image/png');
    document.body.appendChild(oA);
    oA.click();
    oA.remove();
  };
  function downLoadLong() { // 下载长图
    t.mainBox.addClass('ing');
    var mainCv = document.createElement('canvas');
    var mianCon = mainCv.getContext('2d');
    mainCv.width = t.cvW;
    mainCv.height = t.cvH * t.pageNum;
    var cvs = t.mainBox.find('.ms-pdf-list canvas');
    for (var i = 0; i < cvs.length; i++) {
      mianCon.drawImage(cvs[i], 0, t.cvH * i, t.cvW, t.cvH);
    };
    var oA = document.createElement('a');
    oA.download = t.fileName || '';
    oA.href = mainCv.toDataURL('image/png');
    document.body.appendChild(oA);
    oA.click();
    oA.remove();
    t.mainBox.removeClass('ing')
  }
  function afterView() { // 页面预览后
    console.log('页面预览后');
    var el = t.mainBox.find('.ms-fixed-right .ms-page-box');
    t.curPage = t.opts.curPage > t.pageNum ? 1 : t.opts.curPage;
    t.pageNum = t.pageNum ? t.pageNum : 1;
    el.find('p').eq(0).text('总页数 ' + t.pageNum).siblings('p').text('当前页 ' + t.curPage);
    t.pdf ? t.mainBox.find('.ms-fixed-right').show() : t.mainBox.find('.ms-fixed-right').hide();
    if (t.opts.showView === 1) {
      t.mainBox.find('.ms-pdf-list').children().show();
      el.hide();
    } else {
      t.mainBox.find('.ms-pdf-list').children().hide().eq(t.curPage - 1).show();
      el.show();
    }
  };
  function setStorage(png, name) { // 本地储存最近10个印章
    var obj = {
      name,
      png
    };
    var len = localStorage.length;
    if (len >= 10) {
      console.log('已存在10个印章,不再缓存');
      return false;
    } else {
      for (var i = 0; i < len; i++) {
        var key = localStorage.key(i);
        var item = JSON.parse(localStorage.getItem(key)).name
        if (name == item) {
          console.log('已存在相同名字,不缓存');
          return false;
        };
      };
    }
    localStorage.setItem('seal_' + (len + 1), JSON.stringify(obj));
    updataSeal()
  };
  function updataSeal() { // 更新印章列表
    var len = localStorage.length;
    t.mainBox.find('.ms-seal-list ul').remove();
    var html = '<ul>';
    if (len > 0) {
      for (var i = 0; i < len; i++) {
        var key = localStorage.key(i);
        var name = JSON.parse(localStorage.getItem(key)).name;
        html += '<li>' + name + '<span>x</span></li>';
      };
      t.mainBox.find('.ms-seal-list').prepend(html);
    };
  };
  MsPdf.prototype = {
    init: init,
    showPdf: showPdf
  };
}(window.jQuery));
