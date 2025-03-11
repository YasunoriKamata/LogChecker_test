$(document).ready(function () {
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
  // const GAS_URL = hogehoge;
  const ROWS = 15;


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