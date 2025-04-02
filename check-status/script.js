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
const ROWS = 5;

$(document).ready(function () {
  // 初期処理
  // 行の動的追加
  for (let i = 0; i < ROWS; i++) {
    // const rowWithIndex = ROW_TEMPLATE.replace(/{index}/g, i + 1);
    $("#attendanceTableBody1").append(ROW_TEMPLATE);
    $("#attendanceTableBody2").append(ROW_TEMPLATE);
    $("#attendanceTableBody3").append(ROW_TEMPLATE);
    $("#attendanceTableBody4").append(ROW_TEMPLATE);
  }

  // 今日の日付を設定
  document.getElementById('date').value = new Date().toISOString().split('T')[0];

  // ドラッグスクロールの実装
  const slider = document.querySelector('.status-container');
  let isDown = false;
  let startX;
  let scrollLeft;

  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.style.cursor = 'grabbing';
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener('mouseleave', () => {
    isDown = false;
    slider.style.cursor = 'grab';
  });

  slider.addEventListener('mouseup', () => {
    isDown = false;
    slider.style.cursor = 'grab';
  });

  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2; // スクロール速度の調整
    slider.scrollLeft = scrollLeft - walk;
  });

  // 初期カーソルスタイルの設定
  slider.style.cursor = 'grab';
});


//「確認」ボタン押下時の処理
async function checkStatus() {
  try {
    // 日付の取得
    const selectedDate = document.getElementById('date').value;
    if (!selectedDate) {
      alert('日付を選択してください');
      return;
    }

    $('body').css('cursor', 'wait');
    $('#overlay').show();

    // 日付を「YYYY/MM/DD」形式に変換
    const formattedDate = selectedDate.replace(/-/g, '/');
    console.log('送信する日付:', formattedDate); // デバッグ用

    // GASにリクエストを送信
    const response = await fetch(`${GAS_URL}?date=${formattedDate}`, {
      method: 'GET',
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error('データの取得に失敗しました');
    }

    const data = await response.json();

    // データを画面に表示
    updateLocationInfo('1', data.morito);        // 森戸海岸監視所
    updateLocationInfo('2', data.isshiki);       // 一色海岸監視所
    updateLocationInfo('3', data.chojagasaki);   // 長者ヶ崎海岸監視所
    updateLocationInfo('4', data.event);         // イベント

  } catch (error) {
    console.error('エラーが発生しました:', error);
    alert('データの取得中にエラーが発生しました');
  } finally {
    $('body').css('cursor', 'default');
    $('#overlay').hide();
  }
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
        tableBody.appendChild(row);
      });
    } else {
      // データがない場合は空の行を表示
      tableBody.innerHTML = ROW_TEMPLATE;
    }
  }
}

function toTheDayBefore() {
  const dateInput = document.getElementById('date');
  const currentDate = new Date(dateInput.value);
  currentDate.setDate(currentDate.getDate() - 1);
  dateInput.value = currentDate.toISOString().split('T')[0];
  checkStatus();
}
function toTheDayAfter() {
  const dateInput = document.getElementById('date');
  const currentDate = new Date(dateInput.value);
  currentDate.setDate(currentDate.getDate() + 1);
  dateInput.value = currentDate.toISOString().split('T')[0];
  checkStatus();
}