<script setup>
import loading from './loading.vue';
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { getDashed } from '../util/sudoku'
import ajax from '../util/ajax'
import calculate from '../util/calculate';

const props = defineProps({
  size: { type: Number, default: 450 }
});
let saved = localStorage.getItem('data');
let data;
if (saved != null && saved != '') {
  data = ref(JSON.parse(saved));
  initWatch();
} else {
  data = ref({
    cages: [],
    select: 1,
    noting: false,
    toBeSelected: Array(9).fill(0),
    number: Array(81).fill({
      type: 'null', // 状态，null 默认，什么都没有。select设置了数字，note标记
      value: null,
      notes: [],
      editable: true,
      mistake: false
    })
  });
  newGame(true);
}

let calu = ref('');
let caluRes = ref(0);

// const data = ref(sd);
const margin = 3;// 四周边距
const normalizedSize = computed(() => props.size + margin * 2)

const boxSize = 50;// 单元格大小
const dashedMargin = 6; // 虚线和边框线之间的间隔

const color = {
  selectNumber: 'blue',// 输入的普通数字颜色
  selectNumberError: 'red',// 输入的数字出现重复
  selectCurrentBackground: 'rgba(0, 0, 0, 1)',// 当前select的单元格的背景色
  selectBackground: 'rgba(104, 96, 96, 0.3)',// 当前select的单元格所在行列九宫格的背景色
  noteNumberText: 'black',//标记数字颜色
  dashed: 'black',//虚线颜色
}

/**
 * 获取九宫格内下标
 * @param {*} index 下标
 */
function nineIndex(index) {

  // 计算当前九宫格的所有下标
  let startIndexAll = [
    0, 0, 0, 3, 3, 3, 6, 6, 6,
    0, 0, 0, 3, 3, 3, 6, 6, 6,
    0, 0, 0, 3, 3, 3, 6, 6, 6,
    27, 27, 27, 30, 30, 30, 33, 33, 33,
    27, 27, 27, 30, 30, 30, 33, 33, 33,
    27, 27, 27, 30, 30, 30, 33, 33, 33,
    54, 54, 54, 57, 57, 57, 60, 60, 60,
    54, 54, 54, 57, 57, 57, 60, 60, 60,
    54, 54, 54, 57, 57, 57, 60, 60, 60,
  ];

  let startIndex = startIndexAll[index];
  return [
    startIndex,
    startIndex + 1,
    startIndex + 2,
    startIndex + 9,
    startIndex + 10,
    startIndex + 11,
    startIndex + 18,
    startIndex + 19,
    startIndex + 20
  ];
}


/**
 * 绘制虚线，不支持斜线
 * @param {*} ctx 绘图
 * @param {*} x 起点x坐标
 * @param {*} y 起点y坐标
 * @param {*} length 虚线总长度
 * @param {*} veri true竖线，false横线
 */
function drawDashed(ctx, x, y, length, veri) {
  let size = 5;// 虚线长度
  let margin = 2;// 虚线间隔
  let count = length / (size + margin);
  ctx.lineWidth = 1;
  ctx.strokeStyle = color.dashed;

  // 最后一段的终点坐标不应该超出起点+长度
  let max = veri ? (y + length + 1) : (x + length + 1);

  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    if (veri) {
      ctx.moveTo(x, y + (size + margin) * i);
      ctx.lineTo(x, Math.min(max, y + (size + margin) * i + size));


    } else {
      ctx.moveTo(x + (size + margin) * i, y);
      ctx.lineTo(Math.min(max, x + (size + margin) * i + size), y);
    }
    ctx.stroke();
  }


}

function drawCages(ctx, array, sum) {
  let line = getDashed(array);
  for (let i = 0; i < line.row.length; i++) {
    let row = line.row[i];
    // 绘制顶部横线
    if (row.top) {
      row.top.forEach(top => {
        let begin = {
          x: top.begin % 9 * boxSize + margin + dashedMargin,
          y: Math.floor(top.begin / 9) * boxSize + margin + dashedMargin
        }
        if (top.moreLeft) {
          begin.x = begin.x - dashedMargin * 2;
        }
        let more = 0;
        if (top.moreRight) {
          more = dashedMargin * 2;
        }

        drawDashed(ctx, begin.x, begin.y, (top.end % 9 * boxSize + margin + boxSize - dashedMargin - begin.x + more), false);
      });
    }
    if (row.bottom) {
      row.bottom.forEach(v => {
        let begin = {
          x: v.begin % 9 * boxSize + margin + dashedMargin,
          y: Math.floor(v.begin / 9) * boxSize + margin + boxSize - dashedMargin
        }
        if (v.moreLeft) {
          begin.x = begin.x - dashedMargin * 2;
        }
        let more = 0;
        if (v.moreRight) {
          more = dashedMargin * 2;
        }
        drawDashed(ctx, begin.x, begin.y, (v.end % 9 * boxSize + margin + boxSize - dashedMargin - begin.x + more), false);
      })
    }

  }

  for (let i = 0; i < line.col.length; i++) {
    let col = line.col[i];
    // 绘制
    if (col.left) {
      col.left.forEach(v => {
        let begin = {
          x: v.begin % 9 * boxSize + margin + dashedMargin,
          y: Math.floor(v.begin / 9) * boxSize + margin + dashedMargin
        }
        if (v.moreTop) {
          begin.y = begin.y - dashedMargin * 2;
        }
        let more = 0;
        if (v.moreBottom) {
          more = dashedMargin * 2;
        }

        drawDashed(ctx, begin.x, begin.y, (Math.floor(v.end / 9) * boxSize + margin + boxSize - dashedMargin - begin.y + more), true);
      });
    }
    if (col.right) {
      col.right.forEach(v => {
        let begin = {
          x: v.begin % 9 * boxSize + margin + boxSize - dashedMargin,
          y: Math.floor(v.begin / 9) * boxSize + margin + dashedMargin
        }
        if (v.moreTop) {
          begin.y = begin.y - dashedMargin * 2;
        }
        let more = 0;
        if (v.moreBottom) {
          more = dashedMargin * 2;
        }
        drawDashed(ctx, begin.x, begin.y, (Math.floor(v.end / 9) * boxSize + margin + boxSize - dashedMargin - begin.y + more), true);
      })
    }

  }
  // 绘制左上角的数字
  ctx.font = '12px "微软雅黑"';
  ctx.textAlign = 'left'
  ctx.textBaseline = "top"
  ctx.fillStyle = color.noteNumberText;
  ctx.clearRect(array[0] % 9 * boxSize + margin + 4, Math.floor(array[0] / 9) * boxSize + margin + 4, sum.toString().length * 6.8, 10)
  // ctx.fillRect(array[0] % 9 * boxSize + margin + 4, Math.floor(array[0] / 9) * boxSize + margin + 4, 2,2 )

  ctx.fillText(sum, array[0] % 9 * boxSize + margin + dashedMargin * 0.5, Math.floor(array[0] / 9) * boxSize + margin + dashedMargin * 0.5);


}
/**
 * 绘制高亮，在另一个cavans中绘制
 * @param {*} ctx ctx
 */
function drawHighlight(ctx) {
  if (data.value.select == null) return;

  // 计算行列
  let x = data.value.select % 9;
  let y = Math.floor(data.value.select / 9);
  let nine = nineIndex(data.value.select);

  ctx.clearRect(0, 0, props.size, props.size);
  // 高亮横，列
  ctx.fillStyle = color.selectBackground;
  ctx.fillRect(margin, y * boxSize + margin, props.size, boxSize);
  ctx.fill();

  ctx.fillRect(margin + x * boxSize, margin, boxSize, props.size);
  ctx.fill();
  // 高亮当前九宫格
  for (let i = 0; i < nine.length; i++) {
    let x = nine[i] % 9;
    let y = Math.floor(nine[i] / 9);
    ctx.fillRect(margin + x * boxSize, margin + y * boxSize, boxSize, boxSize);
    ctx.fill();
  }
  // 高亮当前格子
  ctx.fillStyle = color.selectCurrentBackground;
  // ctx.fillRect(margin + x * boxSize, margin + y * boxSize, boxSize, boxSize);

  // 高亮相同数字
  let number = data.value.number;
  if (number[data.value.select].type == 'select') {
    for (let i = 0; i < number.length; i++) {
      if (i != data.value.select && number[i].type == 'select' && number[i].value == number[data.value.select].value) {
        let x = i % 9;
        let y = Math.floor(i / 9);
        ctx.fillStyle = color.selectBackground;
        ctx.fillRect(margin + x * boxSize, margin + y * boxSize, boxSize, boxSize);
        ctx.fill();
      }
    }
  }


}

/**
 * 绘制边框，包括所有的数字笼
 * @param {*} ctx ctx
 */
function drawBorder(ctx) {

  // 白色背景
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, props.size, props.size);
  ctx.fill();

  const width = [2, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 2];
  const color = ['#cbd1dc','#344861']
  // 边框
  
  for (let i = 0; i < 10; i++) {
    ctx.lineWidth = width[i];
    ctx.strokeStyle = color[width[i] - 1];
    ctx.beginPath();
    ctx.moveTo(margin - width[i] / 2, margin + i * boxSize);
    ctx.lineTo(boxSize * 9 + width[i] / 2 + margin, margin + i * boxSize);
    ctx.stroke();
  }
  for (let i = 0; i < 10; i++) {
    ctx.lineWidth = width[i];
    ctx.beginPath();
    ctx.moveTo(margin + i * boxSize, margin);
    ctx.lineTo(margin + i * boxSize, boxSize * 9 + margin);
    ctx.stroke();
  }

  // 绘制数字笼

  data.value.cages.forEach(s => {
    let sum = 0;
    s.forEach(m => sum += data.value.solution[m])
    drawCages(ctx, s, sum);
  })
  // drawCages(ctx,[9]);
  // drawCages(ctx,[0,1,10]);
  // drawDashed(ctx, margin + dashedMargin,margin + dashedMargin,boxSize - dashedMargin * 2, true );
  // drawDashed(ctx, margin + dashedMargin,margin + dashedMargin,boxSize - dashedMargin * 2, false );

  // // 普通边框
  // ctx.lineWidth = 1;
  // ctx.strokeStyle = "black";
}

function drawNumber(ctx) {

  let number = data.value.number;

  // number[0].type = 'select';
  // number[0].value = '2';

  // number[1].type = 'note';
  // number[1].notes = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  // number[2].type = 'note';
  // number[2].notes = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  let numberWidth = (boxSize - dashedMargin * 2) / 7 // 算上空格，应该是七个数字的位置

  for (let i = 0; i < number.length; i++) {

    let row = i % 9;
    let col = Math.floor(i / 9);
    // 首先清空
    ctx.clearRect(row * boxSize + margin + dashedMargin * 1.5 + numberWidth,
      col * boxSize + margin + dashedMargin * 1.5,
      boxSize - dashedMargin * 3 - numberWidth,
      boxSize - dashedMargin * 3);

    if (number[i].type == 'null') {
    } else if (number[i].type == 'select') {
      // 绘制左上角的数字
      ctx.font = '39px "微软雅黑"';
      ctx.textAlign = 'center'
      ctx.textBaseline = "middle"
      if (number[i].mistake) {
        ctx.fillStyle = color.selectNumberError
      } else
        ctx.fillStyle = color.selectNumber;
      // ctx.fillRect(array[0] % 9 * boxSize + margin + 4, Math.floor(array[0] / 9) * boxSize + margin + 4, 2,2 )

      ctx.fillText(number[i].value, row * boxSize + margin + boxSize / 2, col * boxSize + margin + boxSize / 2 + dashedMargin * 0.5);

    } else if (number[i].type == 'note') {
      for (let j = 0; j < number[i].notes.length; j++) {
        // 为了直观，布局采用小键盘方案，即大数字在上方
        let nrow = 3 - Math.ceil(number[i].notes[j] / 3);
        let ncol = (number[i].notes[j] + 3 - 1) % 3; // https://blog.inkroom.cn/2020/05/28/3NZ0KXT.html
        // debugger

        ctx.font = '10px "微软雅黑"';
        ctx.textAlign = 'left'
        ctx.textBaseline = "top"
        ctx.fillStyle = color.noteNumberText;
        // ctx.fillRect(array[0] % 9 * boxSize + margin + 4, Math.floor(array[0] / 9) * boxSize + margin + 4, 2,2 )

        //
        ctx.fillText(number[i].notes[j],
          row * boxSize + margin + dashedMargin + (ncol * 2 + 1) * numberWidth,
          col * boxSize + margin + dashedMargin + (nrow * 2 + 1) * numberWidth + 1);




      }
    }

  }
}
/**
 * 检查是否结束
 */
function checkFinish() {
  let numberCount = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < data.value.number.length; i++) {
    if (data.value.number[i].type == 'select') {

      numberCount[data.value.number[i].value - 1]++;

    }
  }
  console.log('checkFinish', numberCount);
  // data.value.toBeSelected = numberCount;
  for (let i = 0; i < data.value.number.length; i++) {

    if (data.value.number[i].type != 'select') return false;// 没填完
    if (data.value.number[i].mistake) return false;//有错误
    if (data.value.number[i].value != data.value.solution[i]) return false;
  }

  return true;

}

/**
 * 重复数字检查，
 */
function check() {
  let result = true;
  // 所有单元格都检查

  function flag(v) {
    // 不知道为什么 for in 只获取一个key就结束循环了，只能换种逻辑
    Object.keys(v).forEach(key => {
      const element = v[key];
      if (element.length <= 1) return;
      element.forEach(s => {
        data.value.number[s].mistake = true;
        result = false;
      })
    })

  }

  // 横
  for (let i = 0; i < 9; i++) {
    let startIndex = i * 9;
    let v = {};
    for (let j = startIndex; j < startIndex + 9; j++) {
      let s = j;
      if (data.value.number[j].type == 'select') {
        if (v.hasOwnProperty(data.value.number[j].value)) {
          v[data.value.number[j].value].push(j);
        } else {
          v[data.value.number[j].value] = [j]
        }
      }
    }
    flag(v);
  }
  // 竖
  for (let i = 0; i < 9; i++) {
    let v = {};
    for (let j = 0; j < 9; j++) {
      let s = i + j * 9;
      if (data.value.number[s].type == 'select') {
        if (v.hasOwnProperty(data.value.number[s].value)) {
          v[data.value.number[s].value].push(s);
        } else {
          v[data.value.number[s].value] = [s]
        }
      }
    }
    flag(v);
  }
  // 九宫格内
  let startIndexAll = [
    0, 3, 6,
    27, 30, 33,
    54, 57, 60,
  ];

  for (let i = 0; i < startIndexAll.length; i++) {
    let startIndex = startIndexAll[i];
    let nine = [
      startIndex,
      startIndex + 1,
      startIndex + 2,
      startIndex + 9,
      startIndex + 10,
      startIndex + 11,
      startIndex + 18,
      startIndex + 19,
      startIndex + 20
    ];
    let v = {};
    for (let j = 0; j < nine.length; j++) {
      let s = nine[j];
      if (data.value.number[s].type == 'select') {
        if (v.hasOwnProperty(data.value.number[s].value)) {
          v[data.value.number[s].value].push(s);
        } else {
          v[data.value.number[s].value] = [s]
        }
      }
    }
    flag(v);
  }

  return result;


}
/**
 * 当前位置的数字是否正确
 * @param {*} index
 * @param {*} number
 */
function checkError(index, number) {

  if (number != data.value.solution[index]) {
    data.value.number[index].mistake = true;
  }

}

/**
 * 确定可输入的数字
 */
function toBeSelected(n) {
  if (n == null) return;

  data.value.toBeSelected = [0, 0, 0, 0, 0, 0, 0, 0, 0];

  let y = Math.floor(n / 9);
  let x = n % 9;
  let to = [3, 3, 3, 3, 3, 3, 3, 3, 3];
  // 横着的
  for (let i = y * 9; i < y * 9 + 9; i++) {
    if (data.value.number[i].type == 'select') {
      to[data.value.number[i].value - 1]--;
    }
  }
  // 竖着的
  for (let i = x; i < x + 8 * 9 + 1; i += 9) {
    if (data.value.number[i].type == 'select') {
      to[data.value.number[i].value - 1]--;
    }
  }
  // 九宫格
  let nine = nineIndex(data.value.select);
  for (let i = 0; i < nine.length; i++) {
    if (data.value.number[nine[i]].type == 'select') {
      to[data.value.number[nine[i]].value - 1]--;
    }
  }

  for (let i = 0; i < to.length; i++) {
    if (to[i] < 3) {// 小于3就说明数字出现过一次，不能再设置了
      data.value.toBeSelected[i] = 9;
    }
  }
  // 在某个数字笼中，不能超过数字笼的值
  let s = data.value.cages.findIndex(s=>s.indexOf(n)>-1);
  if(s!=-1){
    let sum = 0;
    data.value.cages[s].forEach(m => sum += data.value.solution[m])
    for(let i = 0;i<data.value.toBeSelected.length;i++){
      if(i + 1 > sum){
        data.value.toBeSelected[i]=9;
      }
    }
  }
}

/**
 * 取消范围内的
 * @param {*} index 当前下标
 */
function hideNote(index) {

}

function press(key) {
  if (key == '0') {
    // 开启或关闭 标注
    data.value.noting = !data.value.noting;
    return;
  }
  let n = null;
  if (key >= '1' && key <= '9') {// 小键盘 和顶部键盘都兼容
    n = key - '1' + 1;
    if (data.value.select != null) {
      if (data.value.noting) {// 打开标记
        let index = data.value.number[data.value.select].notes.findIndex(s => s == n)
        if (index != -1) {
          // 有则去除
          data.value.number[data.value.select].notes.splice(index, 1);
        } else {
          // 没有则添加
          data.value.number[data.value.select].notes.push(n);// 顺序不重要
        }
        // 判断当前状态
        if (data.value.number[data.value.select].notes.length != 0) {
          data.value.number[data.value.select].type = 'note';
        } else {
          data.value.number[data.value.select].type = 'null';
        }
      } else {

        for (let i = 0; i < data.value.number.length; i++) {
          data.value.number[i].mistake = false;
        }

        if (data.value.number[data.value.select].value == n) {
          data.value.number[data.value.select].value = null;
          data.value.number[data.value.select].type = 'null';
        } else {
          data.value.number[data.value.select].type = 'select';
          data.value.number[data.value.select].value = n;
          data.value.number[data.value.select].notes = [];
          checkError(data.value.select, n);
        }
      }
      
      check()

      refreshBorder();
      refreshHighlight();

      if (checkFinish()) {
        setTimeout(() => {
          alert('游戏结束');
        }, 100)

      }

    }
    return;

  } else if (key == 'ArrowUp') {
    // 上
    n = data.value.select - 9;
  } else if (key == 'ArrowDown') {
    // 下
    n = data.value.select + 9
  } else if (key == 'ArrowLeft') {
    // 左
    n = data.value.select - 1;
  } else if (key == 'ArrowRight') {
    // 右
    n = data.value.select + 1;
  }
  if (n !=null && n >= 0 && n <= 80) {
    data.value.select = n;
    refreshHighlight();
  }
}


function keydownEvent(e) {
  if(e.keyCode==110){
    // .
    setTimeout(()=>{
// 不加延迟 会输入一个 .
      document.getElementsByTagName('input')[0].focus();
      caluRes.value='';
      calu.value='';
    },10);
  }

  if(e.target.tagName!='INPUT'){
    press(e.key);
    return;
  }
  let key = e.key;
  let n = null;
  if (key == 'ArrowUp') {
    n = data.value.select - 9;
    // 上
    document.getElementsByTagName('input')[0].blur();
  } else if (key == 'ArrowDown') {
    n = data.value.select + 9
    // 下
    document.getElementsByTagName('input')[0].blur();
  } else if (key == 'ArrowLeft') {
    n = data.value.select - 1;
    // 左
    document.getElementsByTagName('input')[0].blur();
  } else if (key == 'ArrowRight') {
    n = data.value.select + 1;
    // 右
    document.getElementsByTagName('input')[0].blur();
  }
  if (n !=null && n >= 0 && n <= 80) {
    data.value.select = n;
    refreshHighlight();
  }

}


function refreshBorder() {
  let e = document.getElementById('sudoku_background');
  const ctx = e.getContext("2d");
  ctx.clearRect(0, 0, props.size, props.size);
  drawBorder(ctx);

  drawNumber(ctx);
}

function refreshHighlight() {
  let ctx = document.getElementById('sudoku_fornt').getContext("2d");
  ctx.clearRect(0, 0, props.size, props.size);
  drawHighlight(ctx)
}

onMounted(() => {
  let e = document.getElementById('sudoku_background');

  refreshBorder();

  refreshHighlight();


  // 事件注册
  document.addEventListener('keydown', keydownEvent);
  e.addEventListener('mousedown', (eve) => {
    if (eve.buttons == 1) {
      // 计算所属单元格下标

      let x = Math.floor((eve.layerX - margin) / boxSize);
      let y = Math.floor((eve.layerY - margin) / boxSize);
      let index = y * 9 + x;
      data.value.select = index;


      refreshHighlight();
    }
  })

  toBeSelected(data.value.select);


});

onUnmounted(() => {
  document.removeEventListener('keydown', keydownEvent);
});
function initWatch(){

  watch(data, (n, o) => {
    localStorage.setItem('data', JSON.stringify(data.value));
  }, { deep: true })

  watch(() => data.value.select, (n, o) => {
    toBeSelected(n);
  })
}
const isLoading = ref(false);

function newGame(first) {
  isLoading.value = true;
  ajax.get('/sudoku/new')
    .then(JSON.parse)
    .then(res => {
      delete res['mission'];
      delete res['id'];
      delete res['win_rate'];
      res.solution = res.solution.split("").map(s => parseInt(s));

      data.value = Object.assign(res, {
        select: 1,
        noting: false,
        toBeSelected: Array(9).fill(0),
        number: Array(81).fill({
        }).map(_=>({
          type: 'null', // 状态，null 默认，什么都没有。select设置了数字，note标记
          value: null,
          notes: [],
          editable: true,
          mistake: false
        }))
      })
      if (first) {
        initWatch();
      }

      refreshBorder();
      refreshHighlight();
      isLoading.value = false;
    })
}

watch(calu,(nv,ov)=>{
  try{
    caluRes.value = calculate(nv);
  }catch(e){

  }

})
function inputKeydown(e){
  if(e.keyCode==13){// enter
    e.target.blur();
  }
}
</script>
<template>
  <loading v-if="isLoading" />
  <div class="sudoku" :style="{ width: normalizedSize + 'px', height: normalizedSize + 'px' }">
    <canvas id="sudoku_background" :width="normalizedSize" :height="normalizedSize"></canvas>
    <canvas id="sudoku_fornt" :width="normalizedSize" :height="normalizedSize"></canvas>
  </div>
  <div class="calu"><input v-model="calu" @keydown="inputKeydown" /><div>{{ caluRes }}</div></div>
  <div class="number">
    <button @click="newGame">new</button>
    <button @click="press('0')">{{ data.noting ? 'on' : 'off' }}</button>
    <button @click="press(index + 1 + '')" v-for="(item, index) in data.toBeSelected" :key="index" :disabled="item >= 9"
      :class="item >= 9 ? 'disable' : ''">{{ index + 1 }}</button>
  </div>
</template>
<style lang="less">
.sudoku {
  position: relative;
  margin: auto;

  #sudoku_fornt {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
  }

}
.calu{
    input{
      background-color: white;
      color: black;
    }
    div{
      display: inline-block;
      margin-left: 10px;
      width: 20px;
    }
    color: black;
  }

.number {
  button {
    width: 50px;
  }
}

.disable {
  color: #796565;
  cursor: default;
}
</style>
