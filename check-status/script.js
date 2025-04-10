// 定数定義
const ROW_TEMPLATE = `
     <tr>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
    </tr>
  `;
const GAS_URL = "https://script.google.com/macros/s/AKfycbyu0mCvUeOs_wMg0PZExPkK1_MnEhT4f8vdGsmoZjBo1YMg5pIovVHHYvXpg1XdCClz/exec";
const ROWS = 3;
let dataCache = null; // キャッシュの管理を行う関数

// 初期処理
$(document).ready(function () {
  // 行の動的追加
  initRow();

  // 今日の日付を設定
  document.getElementById('date').value = new Date().toISOString().split('T')[0];

  // 全データを取得
  fetchAllData();

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

// エラーメッセージを表示する関数
function showError(message, error = null) {
  console.error(message, error);
  alert(message);
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

// データを取得する共通関数
async function fetchData() {
  try {
    setLoading(true);

    const response = await fetch(GAS_URL, {
      method: 'GET',
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();

    if (responseData.status !== 'success') {
      throw new Error(responseData.message || 'データの取得に失敗しました');
    }

    return responseData;
  } catch (error) {
    showError('データの取得中にエラーが発生しました', error);
    throw error;
  } finally {
    setLoading(false);
  }
}

// 全データを取得する関数
async function fetchAllData() {
  try {
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

    console.log('全データを取得しました');
  } catch (error) {
    // エラーは既にfetchDataで処理されているため、ここでは何もしない
  }
}

//「確認」ボタン押下時の処理
async function checkStatus() {
  try {
    const selectedDate = document.getElementById('date').value;
    if (!selectedDate) {
      alert('日付を選択してください');
      return;
    }

    // 全データから選択された日付のデータを取得
    const formattedDate = formatDateForAPI(selectedDate);
    if (dataCache && dataCache[formattedDate]) {
      updateDisplay(dataCache[formattedDate]);
      return;
    }

    // 全データにない場合はテーブル初期化
    initRow();

  } catch (error) {
    // エラーは既にfetchDataで処理されているため、ここでは何もしない
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
  const writerElement = document.getElementById(`writer${index}`);
  const supervisorElement = document.getElementById(`supervisor${index}`);
  const tableBody = document.getElementById(`attendanceTableBody${index}`);

  if (writerElement && supervisorElement) {
    writerElement.textContent = locationData.writer || '*';
    supervisorElement.textContent = locationData.supervisor || '*';
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
          <td>${detail.name || '-'}</td>
          <td>${detail.type == 1 ? '日勤' : '時間勤務'}</td>
          <td>${detail.startTime || ''}</td>
          <td>${detail.endTime || ''}</td>
          <td>${detail.batchTest == 1 ? '実施' : ''}</td>
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
