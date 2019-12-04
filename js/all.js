// firebase 設定

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5fSkShgPdiS07cOMUXkUihmpO42Diqqg",
  authDomain: "node-project-bmi.firebaseapp.com",
  databaseURL: "https://node-project-bmi.firebaseio.com",
  projectId: "node-project-bmi",
  storageBucket: "node-project-bmi.appspot.com",
  messagingSenderId: "1037186048205",
  appId: "1:1037186048205:web:01085c8c3188589f918984"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const bmiRef = firebase.database().ref('bmi');

// Dom
const height = document.getElementById('height');
const weight = document.getElementById('weight');

const resultBtn = document.querySelector('.result-btn');
const count = document.querySelector('.count');
const reply = document.querySelector('.reply');
const resultText = document.querySelector('.result-text');

const bmiList = document.querySelector('.calculator-list');

const body = document.querySelector('body');
const modal = document.querySelector('.modal');
const modalList = document.querySelector('.modal-list');
const delBtn = document.querySelector('.modal-del');
const modalCloseBtn = document.querySelectorAll('.modal-close');

// 監聽
resultBtn.addEventListener('click', sendData, false);
bmiList.addEventListener('click', openModal, false);
delBtn.addEventListener('click', delData, false);
modalCloseBtn.forEach(function(item) {
  item.addEventListener('click', closeModal, false);
})

// BMI 狀態
const bmiStatus = {
  slight: {
    status: '過輕',
    color: '#31BAF9',
    shadow: 'rgba(49, 186, 249, 0.29)'
  },
  normal: {
    status: '理想',
    color: '#86D73F',
    shadow: 'rgba(134, 215, 63, 0.29)'
  },
  overweight: {
    status: '過重',
    color: '#FF982D',
    shadow: 'rgba(255, 152, 45, 0.29)'
  },
  mild: {
    status: '輕度肥胖',
    color: '#FF6C03',
    shadow: 'rgba(255, 108, 3, 0.29)'
  },
  moderate: {
    status: '中度肥胖',
    color: '#FF6C03',
    shadow: 'rgba(255, 108, 3, 0.29)'
  },
  severe: {
    status: '重度肥胖',
    color: '#FF1200',
    shadow: 'rgba(255, 18, 0, 0.29)'
  }
}

// BMI 判斷
function BMI(item) {
  switch (true) {
    case item.bmi > 0 && item.bmi < 18.5:
      return item.body = 'slight';
      break;
    case item.bmi >= 18.5 && item.bmi < 24:
      return item.body = 'normal';
      break;
    case item.bmi >= 24 && item.bmi < 27:
      return item.body = 'overweight';
      break;
    case item.bmi >= 27 && item.bmi < 30:
      return item.body = 'mild';
      break;
    case item.bmi >= 30 && item.bmi < 35:
      return item.body = 'moderate';
      break;
    case item.bmi >= 35 && item.bmi < 100:
      return item.body = 'severe';
      break;
    default:
      return 'ERROR';
      break;
  }
}

// 時間戳轉換
function transTime(timestamp) {
  const t = new Date(timestamp);
  const m = t.getMonth() + 1;
  const d = t.getDate();
  const month = m < 10 ? '0' + m : m;
  const day = d < 10 ? '0' + d : d;
  const time = day + '-' + month + '-' + t.getFullYear();
  return time
}

// 傳送資料到 firebase
function sendData() {
  const hNum = height.value / 100;
  const bmi = Math.round((weight.value / (hNum * hNum)) * 100) / 100;
  const item = {
    "height": height.value,
    "weight": weight.value,
    "bmi": bmi
  }
  const content = BMI(item);

  if (content == 'ERROR') { 
    alert('請輸入正確身高、體重');
    return
  }
  if (height.value == '' || weight.value == '') { return }

  const time = new Date().getTime();
  const data = {
    "height": item.height,
    "weight": item.weight,
    "bmi": item.bmi,
    "timestamp": time,
    "bmiStatus": bmiStatus[content].status,
    "bmiColor": bmiStatus[content].color,
    "bmiShadow": bmiStatus[content].shadow
  }

  // 修改 calculator-result 樣式
  // resultBtn
  resultBtn.className = 'result-btn result-btn-active';
  resultBtn.style = `border: 6px solid ${data.bmiColor}; color: ${data.bmiColor}`;
  // count
  count.innerHTML = `${data.bmi} <small>BMI</small>`;
  // reply
  reply.style = `background-color: ${data.bmiColor}`;
  // resultText
  resultText.textContent = data.bmiStatus;
  resultText.style = `color: ${data.bmiColor}`;

  // 移除 sendData 監聽
  resultBtn.removeEventListener('click', sendData, false);

  // 加入 replyData 監聽
  resultBtn.addEventListener('click', replyData, false);
  
  // 傳送資料到 firebase
  bmiRef.push(data);
}

// 把 firebase 資料顯示到畫面上
bmiRef.orderByChild('timestamp').on('value', function(snapshot) {
  let arr = [];
  let str = '';
  
  snapshot.forEach(function(item) {
    arr.push({key: item.key, content: item.val()});
  })
  arr.reverse();

  for (const item in arr) {
    const itemVal = arr[item].content;
    const time = transTime(itemVal.timestamp);
    // 字串
    str += `
      <ul class="list">
        <li class="list-item list-border" style="background-color:${itemVal.bmiColor}; box-shadow: 2px 0 3px 0 ${itemVal.bmiShadow}"></li>
        <li class="list-item">${itemVal.bmiStatus}</li>
        <li class="list-item">
          <small>BMI</small>
          ${itemVal.bmi}
        </li>
        <li class="list-item">
          <small>weight</small>
          ${itemVal.weight}
        </li>
        <li class="list-item">
          <small>height</small>
          ${itemVal.height}
        </li>
        <li class="list-item">
          <small>${time}</small>
        </li>
        <li class="list-item">
          <a href="#" class="del-btn">
            <i class="fas fa-trash-alt" data-index=${arr[item].key}></i>
          </a>
        </li>
      </ul>
    `;
  }
  bmiList.innerHTML = str;

  // 清空表單
  height.value = '';
  weight.value = '';
})

// 點擊 reply 按鈕
function replyData(e) {
  e.preventDefault();
  if (e.target.nodeName == 'A' || e.target.parentNode.nodeName == 'A' || e.target.className == 'reply') {
    
    // 修改 calculator-result 樣式
    // resultBtn
    resultBtn.className = 'result-btn';
    resultBtn.style = '';
    // count
    count.innerHTML = '看結果';
    // reply
    reply.style = '';
    // resultText
    resultText.textContent = '';

    // 加入 sendData 監聽
    resultBtn.addEventListener('click', sendData, false);
  }
}

// 開啟 modal
function openModal(e) {
  e.preventDefault();
  if (e.target.nodeName !== 'I') { return }

  body.style = "overflow: hidden";
  modal.style = 'display: flex';

  const index = e.target.dataset.index;

  delBtn.dataset.index = index

  bmiRef.child(index).once('value', function(snapshot){
    const data = snapshot.val();
    const time = transTime(data.timestamp);

    modalList.innerHTML = `
      <li>狀態： ${data.bmiStatus}</li>
      <li>BMI： ${data.bmi}</li>
      <li>體重： ${data.weight} Kg</li>
      <li>身高： ${data.height}</li>
      <li>記錄日期： ${time}</li>
    `;
  });
}

// 關閉 modal
function closeModal() {
  body.style = "overflow: auto";
  modal.style = 'display: none';
}

// 點擊 modal-del 刪除資料
function delData(e) {
  e.preventDefault();
  const index = e.target.dataset.index;
  bmiRef.child(index).remove();
  closeModal();
}
