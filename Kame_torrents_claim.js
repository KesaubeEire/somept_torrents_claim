// ==UserScript==
// @name         KamePT一键认领
// @name:en      KamePT torrents claim
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  一键认领
// @author       Kesa
// @match        https://kamept.com/userdetails.php?id=*
// @grant        unsafeWindow
// ==/UserScript==

/**
 * 改自大青虫一键认领
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
          rows[i].cells[1].innerHTML += ('<a id="claimAllTorrents" href="javascript:void(0);" onclick="window.manualClaimTorrents();" style="margin-left:10px;font-weight:bold;color:red" title="认领全部当前做种（运行后无法停止，强制停止可关闭页面）">一键认领</a>');
          break;
        }
      }
    }
  }

  unsafeWindow.manualClaimTorrents = async function () {
    var msg = "确定要认领全部种子吗？\n\n严正警告：\n请勿短时间内多次点击，否则后果自负！\n请勿短时间内多次点击，否则后果自负！\n请勿短时间内多次点击，否则后果自负！";
    if (confirm(msg) == true) {//提示选择确认
      var x = document.querySelectorAll("a");//获取所有a元素
      for (var i = 0; i < x.length; i++) {
        if (x[i].href.indexOf("getusertorrentlistajax") != -1 && x[i].href.indexOf("seeding") != -1) {//当a元素的href属性中包含“getusertorrentlistajax”和“seeding”
          eval(x[i].href);//执行a元素的href
          var seedingNodes = document.getElementById("ka1").childNodes;//获取ID为“ka1”的元素的所有子节点
          var maxClaim = 1000;
          var result = await unsafeWindow.ClassificationClaimTorrents(seedingNodes[4], maxClaim);
          var total = result.total;
          var success = result.success;
          alert(`共计${total}个种子，本次成功认领${success}个。`);
          var idClaim = document.getElementById("claimAllTorrents");
          idClaim.parentNode.removeChild(idClaim);
        }
      }
    }
  }

  unsafeWindow.ClassificationClaimTorrents = async function (element, maxClaim) {
    var total = 0, success = 0;
    for (var ti = 1; ti < element.rows.length; ti++) {
      if (success >= maxClaim) {
        alert("最多只能认领1000个种子！");
        break;
      }
      var claimId = element.rows[ti].cells[12].getElementsByTagName('button')[0].style.cssText.indexOf('flex');
      var titleElementA = element.rows[ti].cells[1].getElementsByTagName('a')[0];//获取ti行第2列的第一个a标签
      total += 1;
      if (claimId != -1) {
        var torrentId = titleElementA.href.replace("https://cyanbug.net/", "").replace("details.php?id=", "").replace("&hit=1", "");
        var xmlhttprequest1 = new XMLHttpRequest();
        xmlhttprequest1.open('POST', 'https://cyanbug.net/ajax.php', true);
        xmlhttprequest1.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xmlhttprequest1.send('action=addClaim&params%5Btorrent_id%5D=' + torrentId);
        element.rows[ti].setAttribute("style", "background:LightGreen !important");

        xmlhttprequest1.onload = function () {
          if (xmlhttprequest1.status == 200) {
            // response 就是你要的东西
            var response = xmlhttprequest1.responseText
            console.log(response)
          }
        }

        success += 1;


      }
      else {
        element.rows[ti].setAttribute("style", "background:LightPink !important");
      }
      await sleep(500);
    }
    return {
      total: total,
      success: success
    }
  }
})();