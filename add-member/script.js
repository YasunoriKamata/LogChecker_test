const NAMELIST_URL = "https://script.google.com/macros/s/AKfycbxpmVaEqKuk_YU2w79Rojsc_0vBLh8aNWvCUOK61NmDi2ib672f7XqjXYtZQW8Z7GTn/exec";

// ボタン処理
function execRegist() {
  $('body').css('cursor', 'wait');
  $('#overlay').show();

  console.log(`クラブ員登録処理開始 [${new Date().toISOString()}]`);
  try {
    const requestData = {
      type: 'regist',
      name: $('#name').val(),
      namekana: $('#namek').val(),
    };
    const response = fetch(NAMELIST_URL, {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(requestData)
    });
    const result = response.json();
    if (result.status === 'error') {
      //何かしら失敗したら入る
      Swal.fire({
        icon: "error",
        title: "Oops...",
        html: result.message,
      });
      console.log(`クラブ員登録処理失敗 [${new Date().toISOString()}]`);
      return;
    }

    console.log(`クラブ員登録処理終了 [${new Date().toISOString()}]`);
    Swal.fire({
      title: "Good job!",
      text: "正常に登録されました。",
      icon: "success",
      showConfirmButton: false,
      timer: 2000
    });
  } catch (e) {
    console.error(`クラブ員登録処理失敗 [${new Date().toISOString()}]：`, error);
    Swal.fire({
      icon: "error",
      title: "Oops...",
      html: error.message,
    });
  } finally {
    $('body').css('cursor', 'default');
    $('#overlay').hide();
  }
}