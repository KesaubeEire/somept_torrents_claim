// ==UserScript==
// @name         KamePT一键认领
// @name:en      KamePT torrents claim
// @namespace    http://kamept.com/
// @version      0.0.3
// @description  一键认领
// @author       Kesa
// @match        https://kamept.com/userdetails.php?id=*
// @grant        unsafeWindow
// ==/UserScript==

/**
 * 改自大青虫一键认领, 找不到原网页了捏
 */

(function () {
  'use strict';

  // Your code here...
  function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time)).catch((e) => { console.log(e); });
  }

  window.onload = function () {
    var rows = document.querySelectorAll("tr");//tr表行元素，获取所有表行
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].childElementCount == 2 && rows[i].cells[0].innerText == "当前做种") {//如果该表行只有两个子元素且第一个子元素的内部文本为“当前做种”
        var idClaim = document.getElementById("claimAllTorrents");//获取所有ID为的claimAllTorrents的元素
        if (idClaim == null) {//如果为空，则创建一键认领按钮
          const dom = document.createElement('div')
          dom.innerHTML = '<a id="claimAllTorrents" href="javascript:void(0);" onclick="window.manualClaimTorrents();" style="margin-left:10px;font-weight:bold;color:red" title="认领全部当前做种（运行后无法停止，强制停止可关闭页面）">一键认领</a>';
          rows[i].cells[1].prepend(dom)
          break;
        }
      }
    }
  }

  unsafeWindow.manualClaimTorrents = async function () {
    const _raw_list = Array.from(document.querySelectorAll("button[data-action='addClaim']"));
    const list = _raw_list.filter(el => el.style.display != 'none');//获取所有a元素
    console.log(list);
    if (list.length == 0) {
      alert('未检测到已做种种子或已经全部认领\n请打开当前做种列表, 若列表没有种子您无法认领!\n若您已经全部认领请无视!')
      return
    }

    var msg = "确定要认领全部种子吗？\n\n严正警告: \n请勿短时间内多次点击, 否则后果自负！\n请勿短时间内多次点击, 否则后果自负！\n请勿短时间内多次点击, 否则后果自负! \n点击后请等待至弹窗, 种子越多越要等捏(每个种子访问间隔500ms)";
    if (confirm(msg) == true) {//提示选择确认
      for (var i = 0; i < list.length; i++) {
        var maxClaim = 10000;
        var result = await unsafeWindow.ClassificationClaimTorrents(list, maxClaim);
        var total = result.total;
        var success = result.success;
        alert(`共计${total}个种子，本次成功认领${success}个。`);
        var idClaim = document.getElementById("claimAllTorrents");
        idClaim.parentNode.removeChild(idClaim);
      }
    }
  }

  unsafeWindow.ClassificationClaimTorrents = async function (element, maxClaim) {
    var total = 0, success = 0;

    for (const el of element) {
      if (success >= maxClaim) {
        alert("最多只能认领10000个种子！");
        break;
      }

      total += 1

      const claimId = el.dataset.torrent_id
      if (claimId > 0) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://kamept.com/ajax.php', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send('action=addClaim&params%5Btorrent_id%5D=' + claimId);
      }

      xhr.onload = function () {
        if (xhr.status == 200) {
          // response 就是你要的东西
          var response = xhr.responseText
          el.style.background = 'lime';
          el.innerText = '成功';

          // console.log(response)

          success += 1;
        }
      }

      await sleep(500);
    }
    return {
      total: total,
      success: success
    }
  }
})();