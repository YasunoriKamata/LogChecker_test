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

  // ヘッダの初期化・行の動的追加
  initHeaders();
  initRow();

  // 今日の日付を設定
  document.getElementById('date').value = new Date().toISOString().split('T')[0];

  // ドラッグスクロールの実装
  initDragScroll();
});

// 全ての記入者・監視長の初期値を初期化
function initHeaders() {
  for (let i = 1; i <= 4; i++) {
<<<<<<< HEAD
    document.getElementById(`writer${i}`).value = '-';
    document.getElementById(`supervisor${i}`).value = '-';
=======
<<<<<<< HEAD
    document.getElementById(`recorder${i}`).textContent = '-';
    document.getElementById(`supervisor${i}`).textContent = '-';
=======
    document.getElementById(`writer${i}`).value = '-';
    document.getElementById(`supervisor${i}`).value = '-';
>>>>>>> cec5aea6b150e679a3414f0ee35030ebfdf18568
>>>>>>> 3f0242f016b446c51c4fa0dda93cc27b536012f9
  }
}

// テーブルの行を初期化
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
    Swal.fire({
      title: 'データ取得中...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

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
    Swal.close();
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

    initHeaders(); // ヘッダを初期化
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
  displayLocationInfo('1', data.morito);
  displayLocationInfo('2', data.isshiki);
  displayLocationInfo('3', data.chojagasaki);
  displayLocationInfo('4', data.event);
}

// 各監視所の情報を更新する関数
function displayLocationInfo(index, locationData) {
  if (!locationData) {
    return; // locationDataがnullまたはundefinedの場合は処理をスキップ
  }

  const recorderElement = document.getElementById(`recorder${index}`);
  const supervisorElement = document.getElementById(`supervisor${index}`);
  const tableBody = document.getElementById(`attendanceTableBody${index}`);

<<<<<<< HEAD
  if (writerElement && supervisorElement) {
    writerElement.value = locationData.writer;
    supervisorElement.value = locationData.supervisor;
=======
<<<<<<< HEAD
  if (recorderElement && supervisorElement) {
    recorderElement.textContent = locationData.writer;
    supervisorElement.textContent = locationData.supervisor;
=======
  if (writerElement && supervisorElement) {
    writerElement.value = locationData.writer;
    supervisorElement.value = locationData.supervisor;
>>>>>>> cec5aea6b150e679a3414f0ee35030ebfdf18568
>>>>>>> 3f0242f016b446c51c4fa0dda93cc27b536012f9
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
        <td><input type="text" value="${detail.name || ''}" /></td>
        <td><input type="checkbox" ${detail.volunteer == 1 ? 'checked' : ''} /></td>
        <td>
          <select>
            <option value="1" ${detail.type == 1 ? 'selected' : ''}>日勤</option>
            <option value="2" ${detail.type == 2 ? 'selected' : ''}>時間勤</option>
          </select>
        </td>
        <td><input type="time" list="data-list" value="${detail.startTime || ''}" /></td>
        <td><input type="time" list="data-list" value="${detail.endTime || ''}" /></td>
        <td><input type="checkbox" ${detail.batchTest == 1 ? 'checked' : ''} /></td>
        <td><input type="text" value="${detail.remarks || ''}" /></td>
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

// ボタン処理
<<<<<<< HEAD
=======
<<<<<<< HEAD
function addRow(location) {
  //１行しかないときは、削除してから
  const tableBody = document.getElementById(`attendanceTableBody${location}`);
  if (tableBody && tableBody.children.length === 1) {
    tableBody.innerHTML = '';
  }
  // 新しい行を追加
  if (tableBody) {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td><input type="text" value="" /></td>
      <td><input type="checkbox" /></td>
      <td>
        <select>
          <option value="1">日勤</option>
          <option value="2">時間勤</option>
        </select>
      </td>
      <td><input type="time" list="data-list" value="" /></td>
      <td><input type="time" list="data-list" value="" /></td>
      <td><input type="checkbox" /></td>
      <td><input type="text" value="" /></td>
    `;
    tableBody.appendChild(newRow);
  }
}

=======
>>>>>>> cec5aea6b150e679a3414f0ee35030ebfdf18568
>>>>>>> 3f0242f016b446c51c4fa0dda93cc27b536012f9
async function execUpdate(location) {
  let msg = '';
  const selectedDate = document.getElementById('date').value.replace(/-/g, '/');
  if (!selectedDate) {
    alert('日付を選択してください');
    return;
  }
  switch (location) {
    case 1:
      msg = '森戸海岸'
      break;
    case 2:
      msg = '一色海岸'
      break;
    case 3:
      msg = '長者ヶ崎海岸'
      break;
    case 4:
      msg = 'イベント'
      break;
  }

  alert(`${msg}：${selectedDate} の出勤簿データを修正登録します。`);

  try {
    setLoading(true);
    console.log(`データ削除処理開始：[${getJSTISOString()}]`);
    //削除データ作成
    const deleteData = {
      type: 'delete',
      date: selectedDate,
      location: `${location}`
    };
    //削除処理実行
<<<<<<< HEAD
    const response = await fetch(GAS_URL, {
=======
<<<<<<< HEAD
    let response = await fetch(GAS_URL, {
=======
    const response = await fetch(GAS_URL, {
>>>>>>> cec5aea6b150e679a3414f0ee35030ebfdf18568
>>>>>>> 3f0242f016b446c51c4fa0dda93cc27b536012f9
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(deleteData)
    });

<<<<<<< HEAD
    const result = await response.json();
=======
<<<<<<< HEAD
    let result = await response.json();
=======
    const result = await response.json();
>>>>>>> cec5aea6b150e679a3414f0ee35030ebfdf18568
>>>>>>> 3f0242f016b446c51c4fa0dda93cc27b536012f9
    if (result.status === 'error') {
      //削除データがない場合などはここに入る
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: result.message,
      });
      console.log(`出勤簿データ登録失敗 削除データ無し？：[${getJSTISOString()}]`);
      return
    }
    console.log(`データ削除処理完了：[${getJSTISOString()}]`);
    console.log(`データ登録処理開始：[${getJSTISOString()}]`);

<<<<<<< HEAD


    console.log(`データ登録処理完了：[${getJSTISOString()}]`);
=======
<<<<<<< HEAD
    // 登録データ作成
    const tableBody = document.getElementById(`attendanceTableBody${location}`);
    const rows = tableBody.querySelectorAll('tr');
    const details = Array.from(rows).map(row => {
      const inputs = row.querySelectorAll('input, select');
      return {
        name: inputs[0].value.trim(),
        volunteer: inputs[1].checked ? 1 : 0,
        shiftType: parseInt(inputs[2].value, 10),
        startTime: inputs[3].value.trim(),
        endTime: inputs[4].value.trim(),
        batchTest: inputs[5].checked ? 1 : 0,
        remarks: inputs[6].value.trim()
      };
    }).filter(detail => detail.name !== '');
    const requestData = {
      type: 'regist',
      date: selectedDate,
      location: `${location}`,
      recorder: document.getElementById(`recorder${location}`).textContent.trim(),
      supervisor: document.getElementById(`supervisor${location}`).textContent.trim(),
      details: details
    };

    response = await fetch(GAS_URL, {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(requestData)
    });
    result = await response.json();

    switch (result.status) {
      case 'success':
        // 登録成功
        console.log(`データ登録処理完了：[${getJSTISOString()}]`);
        alert(`データ登録処理完了：[${getJSTISOString()}]`);
        break;
      case 'error':
        // 既存データがある場合などはここに入る
        console.log(`データ登録処理失敗 既存データ有り？：[${getJSTISOString()}]`);
        alert(`データ登録処理失敗：[${getJSTISOString()}]`);
        return;
    }
=======


    console.log(`データ登録処理完了：[${getJSTISOString()}]`);
>>>>>>> cec5aea6b150e679a3414f0ee35030ebfdf18568
>>>>>>> 3f0242f016b446c51c4fa0dda93cc27b536012f9
  } catch (error) {
    console.error(`データ更新処理失敗：[${getJSTISOString()}]：`, error);
  } finally {
    setLoading(false);
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
