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
const ROWS = 15;

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
  }
}
// 各監視所の情報を更新する関数
function updateLocationInfo(index, locationData) {
  const writerElement = document.getElementById(`writer${index}`);
  const supervisorElement = document.getElementById(`supervisor${index}`);

  if (writerElement && supervisorElement) {
    writerElement.textContent = locationData.writer || '*';
    supervisorElement.textContent = locationData.supervisor || '*';
  }
}