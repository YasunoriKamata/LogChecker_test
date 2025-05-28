// 定数定義
const ROW_TEMPLATE = `
     <tr>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
    </tr>
  `;
const GAS_URL = "https://script.google.com/macros/s/AKfycbyu0mCvUeOs_wMg0PZExPkK1_MnEhT4f8vdGsmoZjBo1YMg5pIovVHHYvXpg1XdCClz/exec";
const ROWS = 1;
let dataCache = null; // キャッシュ

// 初期処理
$(document).ready(function () {
  // 全データを取得
  fetchAllData();

  // 行の動的追加
  initRow();

  // 今日の日付を設定
  document.getElementById('date').value = new Date().toISOString().split('T')[0];

  // ドラッグスクロールの実装
  initDragScroll();
});

// テーブルの行を初期化する関数
function initRow() {
  // 一度にすべてのテーブルボディをクリア
  const tableBodies = [
    document.getElementById('attendanceTableBody1'),
    document.getElementById('attendanceTableBody2'),
    document.getElementById('attendanceTableBody3'),
    document.getElementById('attendanceTableBody4')
  ];

  // 各テーブルボディに空の行を追加
  tableBodies.forEach(tableBody => {
    if (tableBody) {
      tableBody.innerHTML = '';
      for (let i = 0; i < ROWS; i++) {
        tableBody.insertAdjacentHTML('beforeend', ROW_TEMPLATE);
      }
    }
  });
}

//ドラッグスクロールの実装
function initDragScroll() {
  const slider = document.querySelector('.status-container');
  let isDown = false;
  let startX;
  let scrollLeft;

  const events = {
    mousedown: (e) => {
      isDown = true;
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    },
    mouseleave: () => isDown = false,
    mouseup: () => isDown = false,
    mousemove: (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2;
      slider.scrollLeft = scrollLeft - walk;
    }
  };

  Object.entries(events).forEach(([event, handler]) => {
    slider.addEventListener(event, handler);
  });
}

// ローディング表示を制御する関数
function setLoading(isLoading) {
  if (isLoading) {
    $('body').css('cursor', 'wait');
    $('#overlay').show();
  } else {
    $('#overlay').hide();
    $('body').css('cursor', 'default');
  }
}

// 全データを取得する関数
async function fetchAllData() {
  try {
    setLoading(true);

    console.log(`全データを取得開始：[${getJSTISOString()}]`);
    const responseData = await fetchData();

    // 全データをキャッシュに保存
    dataCache = responseData;
    const sizeInBytes = new TextEncoder().encode(JSON.stringify(dataCache)).length;
    console.log(`キャッシュサイズ：${sizeInBytes} バイト（約 ${(sizeInBytes / 1024).toFixed(2)} KB）`);

    // 今日の日付のデータを表示
    const today = new Date().toISOString().split('T')[0];
    const formattedToday = formatDateForAPI(today);
    if (responseData[formattedToday]) {
      updateDisplay(responseData[formattedToday]);
    }

    console.log(`全データを取得完了：[${getJSTISOString()}]`);
  } catch (error) {
    console.error(`データ取得処理失敗：[${getJSTISOString()}]：`, error);
  } finally {
    setLoading(false);
  }
}

// データを取得する共通関数
async function fetchData() {
  const response = await fetch(GAS_URL, {
    method: 'GET',
    mode: 'cors'
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const responseData = await response.json();

  if (responseData.status !== 'success') {
    console.error(`データ取得処理失敗：[${getJSTISOString()}]：`, responseData.message);
    return null; // エラー時はnullを返す
  }

  return responseData;
}

//「確認」ボタン押下時の処理
async function checkStatus() {
  try {
    const selectedDate = document.getElementById('date').value;
    if (!selectedDate) {
      alert('日付を選択してください');
      return;
    }

    initRow(); // まずは初期化

    // 全データから選択された日付のデータを取得
    const formattedDate = formatDateForAPI(selectedDate);
    if (dataCache && dataCache[formattedDate]) {
      updateDisplay(dataCache[formattedDate]);
      return;
    }

  } catch (error) {
    console.error(`データ表示処理失敗：[${getJSTISOString()}]：`, error);
  }
}

// データを画面に表示
function updateDisplay(data) {
  updateLocationInfo('1', data.morito);
  updateLocationInfo('2', data.isshiki);
  updateLocationInfo('3', data.chojagasaki);
  updateLocationInfo('4', data.event);
}

// 各監視所の情報を更新する関数
function updateLocationInfo(index, locationData) {
  if (!locationData) {
    return; // locationDataがnullまたはundefinedの場合は処理をスキップ
  }

  const writerElement = document.getElementById(`writer${index}`);
  const supervisorElement = document.getElementById(`supervisor${index}`);
  const tableBody = document.getElementById(`attendanceTableBody${index}`);

  if (writerElement && supervisorElement) {
    writerElement.textContent = locationData.writer;
    supervisorElement.textContent = locationData.supervisor;
  }

  // テーブルの内容をクリア
  if (tableBody) {
    tableBody.innerHTML = '';

    // 明細データが存在する場合、テーブルに追加
    if (locationData.details && locationData.details.length > 0) {
      // フラグメントを使用してDOM操作を最適化
      const fragment = document.createDocumentFragment();

      locationData.details.forEach(detail => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${detail.name || ''}</td>
          <td>${detail.volunteer == 1 ? '✓' : ''}</td>
          <td>${detail.type == 1 ? '日勤' : '時間勤'}</td>
          <td>${detail.startTime || ''}</td>
          <td>${detail.endTime || ''}</td>
          <td>${detail.batchTest == 1 ? '✓' : ''}</td>
          <td>${detail.remarks || ''}</td>
        `;
        fragment.appendChild(row);
      });

      tableBody.appendChild(fragment);
    } else {
      // データがない場合は空の行を表示
      tableBody.innerHTML = ROW_TEMPLATE;
    }
  }
}

//日本時間取得
function getJSTISOString() {
  const now = new Date();
  const jstOffset = 9 * 60 * 60 * 1000; // UTC+9時間をミリ秒で計算
  const jstDate = new Date(now.getTime() + jstOffset);
  return jstDate.toISOString().replace('T', ' ').slice(0, 23); // ミリ秒3桁まで
}

// 日付フォーマット変換のユーティリティ関数
function formatDateForAPI(dateString) {
  return dateString.replace(/-/g, '/');
}

// 日付を移動する関数
function moveDay(day) {
  const dateInput = document.getElementById('date');
  const currentDate = new Date(dateInput.value);
  currentDate.setDate(currentDate.getDate() + day);
  dateInput.value = currentDate.toISOString().split('T')[0];
  checkStatus();
}
