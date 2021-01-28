// 1、生成地雷地图
var setMineArr = function (row, column, number) {
  // 1.1 生成地图大小
  var arr = [];
  for (var i = 0; i < row; i++) {
    arr[i] = new Array();
    for (var j = 0; j < column; j++) {
      arr[i][j] = 0;
    };
  };
  //1.2 随机生成地雷位置，num为雷的数量
  var setRandomMine = function (num) {
    var randomAddress = function () {
      var x = Math.floor(Math.random() * row);
      var y = Math.floor(Math.random() * column)
      if (arr[x][y] != 9) {
        arr[x][y] = 9;
      } else {
        randomAddress();
      }
    }
    for (var i = 0; i < num; i++) {
      randomAddress();
    }
  }

  //实现格子周围数字加1
  var plus = function (array, x, y) {
    // 限制在数组内?没有外面这个判断条件会报错，主要是排除边界的情况，边界时调用会超出范围
    if (x >= 0 && x < row && y >= 0 && y < column) {
      if (array[x][y] !== 9) {
        array[x][y] += 1;
      }
    }
  }

  //1.3 遍历所有地雷,对周围数字加1
  var addNumber = function () {
    for (var x = 0; x < arr.length; x++) {
      for (var y = 0; y < arr[0].length; y++) {
        if (arr[x][y] == 9) {
          // 上下6个
          for (var i = -1; i < 2; i++) {
            plus(arr, x - 1, y + i);
            plus(arr, x + 1, y + i);
          }
          // 左右2个
          plus(arr, x, y + 1);
          plus(arr, x, y - 1);
        }
      }
    }
  }
  setRandomMine(number);
  addNumber();
  return arr;
}

// 2、将元素写入页面
var writeHtml = function (array) {
  var area = document.querySelector('.playbox');
  // 2.1 写入行
  for (var i = 0; i < array.length; i++) {
    area.innerHTML += `<ul class="row x-${i}" data-x="${i}"></ul>`
  };
  // 2.2 写入列
  var line = document.querySelectorAll(".row");
  for (var i = 0; i < line.length; i++) {
    for (var j = 0; j < array[0].length; j++) {
      var m = array[i][j];
      // 空的写空（避免后面显示0），非空写数字
      if (m == 0) {
        m = " ";
      } else {
        m = array[i][j];
      }
      // 通过遍历累加写进去li
      line[i].innerHTML += `
      <li class="column y-${j}" data-y="${j}">
        <span class="num${m}">${m}</span>
        <img src="flag.svg" class="flag hide"/>
        <img src="hsy.png" class="boom hide" />
      </li>`
      // 之前这里少了个引号导致错误
    }
  }
}
// 游戏判断函数
var checkGame = function (cleannum) {
  // 根据点开的数量来判断
  if ((cleannum == ((row * column) - number)) && (status == 0)) {
    // console.log(status)
    document.querySelector(".minenum").innerText = 0;
    document.querySelector(".success").classList.remove("notshow")
    document.querySelector(".good").classList.remove("notshow")
  } else if (status == 1) {
    // console.log(status)
    document.querySelector(".failed").classList.remove("notshow")
    document.querySelector(".bad").classList.remove("notshow")
  }
}

// 3、扫雷逻辑
var cleanMine = function (row, column, number) {
  var cleanNum = 0;
  // 打开格子的函数
  var itemOpen = function (x, y) {
    if (x >= 0 && x < row && y >= 0 && y < column) {
      // 获取x,y位置的li元素
      var el = document.querySelector(`.x-${x}`).children[y];
      // 修改为打开的样式,但必须是对未打开的执行，不然会无限循环
      if (!el.classList.contains('open')) {
        var openshadow = "-2px -2px 2px 1px rgba(255, 255, 255, 0.4) inset, 2px 2px 2px 1px rgba(24, 23, 23, 0.3) inset";
        el.style.boxShadow = openshadow;
        el.children[0].style.opacity = "1";
        // 这个很重要，所有打开的都必须加上open类名
        el.classList.add('open');
        cleanNum++;
        checkGame(cleanNum);
        // 智能清除
        if (el.children[0].innerText == '') {
          autoClean(x, y);
        }
      };
    }
  };
  // 智能清除，对空白格子周围一圈遍历
  var autoClean = function (x, y) {
    // 上下6个
    for (var i = -1; i < 2; i++) {
      itemOpen(x - 1, y + i);
      itemOpen(x + 1, y + i);
    }
    // 左右2个
    itemOpen(x, y + 1);
    itemOpen(x, y - 1);
  }
  // 给所有格子绑定事件
  var itemClick = function () {
    var x = document.querySelectorAll(".row");
    // 左键单击事件
    for (var i = 0; i < x.length; i++) {
      x[i].addEventListener('click', function (event) {
        var clickel = event.target;
        // 小写li无效，为什么？
        if (clickel.tagName != "LI") {
          clickel = event.target.parentElement
        }
        var tag = clickel.children[1].classList.contains("hide"); //返回true或false
        // 此条件为li标签且旗子未标记
        if (clickel.tagName == "LI" && tag) {
          clickel.classList.add('open')
          // 阴影不改无法显示数字，为什么？
          clickel.style.boxShadow = "-2px -2px 2px 1px rgba(255, 255, 255, 0.4) inset, 2px 2px 2px 1px rgba(24, 23, 23, 0.3) inset"
          // 数字区
          if (clickel.children[0].innerText <= 8 && clickel.children[0].innerText >= 1) {
            clickel.children[0].style.opacity = "1";
            cleanNum++;
            checkGame(cleanNum);
          } else if (clickel.children[0].innerText == "9") {
            //雷区只让雷显示
            clickel.children[2].style.opacity = "1";
            // 游戏状态变为错误1
            status = 1;
            checkGame(cleanNum);
          } else if (clickel.children[0].innerText == "") {
            // 空白格子
            cleanNum++;
            // checkGame(cleanNum);
            // x是行数
            var x = parseInt(clickel.parentElement.dataset.x)
            // y是列数，不需要父节点
            var y = parseInt(clickel.dataset.y)
            autoClean(x, y)
          }
        }
      })
    }
    // 右键单击事件
    for (var i = 0; i < x.length; i++) {
      var unknownmine = number;
      x[i].addEventListener("contextmenu", function (event) {
        event.preventDefault();
        var el = event.target;
        if (el.tagName != "LI") {
          el = event.target.parentElement;
        }
        if (el.tagName == "LI") {
          if (el.children[1].classList.contains("hide") && !el.classList.contains('open')) {
            el.children[1].classList.remove("hide")
            var numbtn = document.querySelector(".minenum")
            if (unknownmine != 0) {
              unknownmine--;
              numbtn.innerText = unknownmine;
            }
          } else if (!el.classList.contains('open')) {
            el.children[1].classList.add("hide")
            // 下面的这些很重要，不然会导致游戏错误
            var numbtn = document.querySelector(".minenum")
            if (unknownmine != 0) {
              unknownmine++;
              numbtn.innerText = unknownmine;
            }
          }
        }
      })
    }
  }
  itemClick()
}
// 按钮的功能实现
var btnClick = function () {
  // 选择难度
  var level = document.querySelectorAll(".levelitem");
  for (var i = 0; i < level.length; i++) {
    level[i].addEventListener("click", function (event) {
      var choice = event.target.innerText;
      if (choice == "简单") {
        row = 9;
        column = 9;
        number = 10;
        initialGame(row, column, number)
        // btnClick()
      } else if (choice == "中等") {
        row = 16;
        column = 16;
        number = 40;
        initialGame(row, column, number)
        // btnClick()
      } else if (choice == "困难") {
        row = 16;
        column = 30;
        number = 99;
        initialGame(row, column, number)
      }
    })
  }
  // 选择样式
  var totalbg = document.querySelector(".main");
  var itembg = document.querySelectorAll(".item");
  var restartbg = document.querySelector(".restart");
  // 初始化棋盘之前是获取不到的
  // var eachbg = document.querySelectorAll(".column");
  var columnbg = document.querySelectorAll(".column");
  var greyStyle = document.querySelector(".grey");
  var blueStyle = document.querySelector(".blue");
  var greenStyle = document.querySelector(".green");
  greyStyle.onclick = function () {
    totalbg.style.backgroundColor = "rgb(185, 182, 182)"
    restartbg.style.backgroundColor = "rgb(185, 182, 182)"
    for (var i = 0; i < itembg.length; i++) {
      itembg[i].style.backgroundColor = "rgb(185, 182, 182)"
    }
    for (var j = 0; j < columnbg.length; j++) {
      columnbg[j].style.backgroundColor = "rgb(185, 182, 182)"
    }
  };
  blueStyle.onclick = function () {
    totalbg.style.backgroundColor = "rgb(38, 120, 141)"
    restartbg.style.backgroundColor = "rgb(38, 120, 141)"
    for (var i = 0; i < itembg.length; i++) {
      itembg[i].style.backgroundColor = "rgb(38, 120, 141)"
    }
    for (var j = 0; j < columnbg.length; j++) {
      columnbg[j].style.backgroundColor = "rgb(38, 120, 141)"
    }
  };
  greenStyle.onclick = function () {
    totalbg.style.backgroundColor = "rgb(38, 141, 64)"
    restartbg.style.backgroundColor = "rgb(38, 141, 64)"
    for (var i = 0; i < itembg.length; i++) {
      itembg[i].style.backgroundColor = "rgb(38, 141, 64)"
    }
    for (var j = 0; j < columnbg.length; j++) {
      columnbg[j].style.backgroundColor = "rgb(38, 141, 64)"
    }
  };
  // 重置游戏
  var newg = document.querySelector(".restart");
  newg.onclick = function () {
    initialGame(16, 16, 40)
  }
}

var usedtime;
var initialGame = function (row, column, number) {
  // 必须先清除，不然后面切换难度会出问题
  var box = document.querySelector(".playbox");
  box.innerHTML = "";
  document.querySelector(".good").classList.add("notshow");
  document.querySelector(".bad").classList.add("notshow");
  document.querySelector(".failed").classList.add("notshow");
  document.querySelector(".success").classList.add("notshow");
  // 样式回归初始化
  var totalbg = document.querySelector(".main");
  var itembg = document.querySelectorAll(".item");
  var restartbg = document.querySelector(".restart");
  var columnbg = document.querySelectorAll(".column");
  totalbg.style.backgroundColor = "rgb(185, 182, 182)"
  restartbg.style.backgroundColor = "rgb(185, 182, 182)"
  for (var i = 0; i < itembg.length; i++) {
    itembg[i].style.backgroundColor = "rgb(185, 182, 182)"
  }
  // 单独的格子是继承main的背景颜色
  // for (var j = 0; j < columnbg.length; j++) {
  //   columnbg[j].style.backgroundColor = "rgb(185, 182, 182)"
  // }
  // 生成新地图
  var newArr = setMineArr(row, column, number);
  writeHtml(newArr);
  cleanMine(row, column, number);
  // 各种数据回归初始化
  status = 0;
  document.querySelector(".minenum").innerText = number;
  document.querySelector(".time").innerText = `0`;
  var t = 1; //从0开始视觉上会很奇怪
  clearInterval(usedtime);
  usedtime = setInterval(function () {
    document.querySelector(".time").innerText = `${t++}`
  }, 1000);
}
var row = 16;
var column = 16;
var number = 40;
// 0代表游戏状态为正常
var status = 0;
initialGame(row, column, number)
// 这个如果放上面就会找不到格子，因为还没有创建，有趣！
btnClick()