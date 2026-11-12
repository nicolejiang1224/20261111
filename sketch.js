let stopSprite; // 儲存站立動畫的精靈圖。
let runSprite; // 儲存跑步動畫的精靈圖。
let character2WaitSprite; // 儲存角色 2 的等待動畫精靈圖。
let character2CorrectSprite; // 儲存角色 2 答對時的動畫精靈圖。
let character2WrongSprite; // 儲存角色 2 答錯時的動畫精靈圖。
let backgroundImage; // 儲存畫布背景圖片。
let characterX; // 儲存角色在畫布中的水平位置。
let characterY; // 儲存角色在畫布中的垂直位置。
let facing = 1; // 設定角色朝向，1 代表右方，-1 代表左方。
let currentFrame = 0; // 儲存目前播放的動畫影格。
let lastFrameTime = 0; // 記錄上次切換動畫影格的時間。
let wasRunning = false; // 記錄上一畫格是否正在跑步。
let runIntroFinished = false; // 記錄跑步動畫前 12 格是否已播放完畢。
let questionActive = false; // 記錄選擇題是否正在顯示。
let questionAsked = false; // 記錄角色 1 靠近後是否已經出過題。
let character2State = "wait"; // 記錄角色 2 目前的等待、答對或答錯狀態。
let character2Frame = 0; // 儲存角色 2 目前播放的動畫影格。
let lastCharacter2FrameTime = 0; // 記錄角色 2 上次切換動畫影格的時間。
const quizQuestion = "國中生小明常對同學小華開黃腔、說性暗示言論，\n並做出令其不舒服的肢體碰觸。\n依照《性別平等教育法》，這屬於下列何者？"; // 設定性別平等教育法情境題並分行方便閱讀。
const quizOptions = ["性侵害", "性騷擾", "性霸凌", "家庭暴力"]; // 設定題目的四個法律概念選項。
const correctQuizOption = 1; // 設定正確答案為第 2 個選項（B）性騷擾。
const frameInterval = 90; // 設定每隔幾毫秒切換一次影格。
const moveSpeed = 4; // 設定角色每次繪圖時移動的像素數。

function preload() { // 在畫面開始前載入動畫精靈圖。
  backgroundImage = loadImage("bg/bg1.png"); // 載入背景圖片。
  stopSprite = loadImage("1/stop/stop.png"); // 載入站立動畫精靈圖。
  runSprite = loadImage("1/run/run.png"); // 載入跑步動畫精靈圖。
  character2WaitSprite = loadImage("2/wait/wait.png"); // 載入角色 2 的等待動畫精靈圖。
  character2CorrectSprite = loadImage("2/correct/correct.png"); // 載入角色 2 答對時的動畫精靈圖。
  character2WrongSprite = loadImage("2/wrong/wrong.png"); // 載入角色 2 答錯時的動畫精靈圖。
} // 結束載入函式。

function setup() { // 設定畫布與角色的初始狀態。
  createCanvas(windowWidth, windowHeight); // 建立符合瀏覽器視窗大小的畫布。
  characterX = width * 2 / 3; // 將角色 1 的水平初始位置放在畫布 2/3 處。
  characterY = height; // 將角色初始位置設在畫布底部，繪製時會對齊地板。
  imageMode(CORNER); // 使用影像左上角作為繪圖定位模式。
  frameRate(60); // 將畫面更新頻率設定為每秒 60 張。
} // 結束設定函式。

function draw() { // 每一畫格更新背景、移動與角色動畫。
  image(backgroundImage, 0, 0, width, height); // 將背景圖片縮放至填滿整個畫布。
  const movingLeft = !questionActive && keyIsDown(LEFT_ARROW); // 選擇題顯示時暫停移動，否則檢查左方向鍵。
  const movingRight = !questionActive && keyIsDown(RIGHT_ARROW); // 選擇題顯示時暫停移動，否則檢查右方向鍵。
  const isRunning = movingLeft || movingRight; // 判斷角色是否正在移動。
  const sprite = isRunning ? runSprite : stopSprite; // 移動時使用跑步圖，否則使用站立圖。
  const frameCountInSheet = isRunning ? 12 : 14; // 設定跑步有 12 格、站立有 14 格動畫。
  const frameWidth = sprite.width / frameCountInSheet; // 依精靈圖總寬度計算單格影格寬度。
  const frameHeight = sprite.height; // 取得單格影格的高度。
  const targetCharacterHeight = height * 4 / 7; // 將兩個角色的目標身高設定為畫布高度的 4/7。
  const spriteScale = min(targetCharacterHeight / frameHeight, (width * 0.8) / frameWidth); // 依目標身高等比例縮放角色 1，並避免超出畫布寬度。
  const displayWidth = frameWidth * spriteScale; // 計算角色影格縮放後的顯示寬度。
  const displayHeight = frameHeight * spriteScale; // 計算角色影格縮放後的顯示高度。
  const floorPadding = min(12, height * 0.02); // 保留少量底部空間，避免角色腳部貼齊畫布邊緣。
  const character2X = width / 3; // 將角色 2 固定放在畫布寬度的 1/3 處。
  const character2Sprite = character2State === "correct" ? character2CorrectSprite : character2State === "incorrect" ? character2WrongSprite : character2WaitSprite; // 依角色狀態選擇等待、答對或答錯動畫精靈圖。
  const character2FrameCount = character2State === "correct" ? 12 : character2State === "incorrect" ? 22 : 18; // 設定角色 2 各種動畫的影格數。
  const character2FrameWidth = character2Sprite.width / character2FrameCount; // 依角色 2 精靈圖總寬度計算單格影格寬度。
  const character2FrameHeight = character2Sprite.height; // 取得角色 2 單格影格的高度。
  const character2Scale = min(targetCharacterHeight / character2FrameHeight, (width * 0.45) / character2FrameWidth); // 讓角色 2 與角色 1 等高，目標為畫布高度的 4/7。
  const character2DisplayWidth = character2FrameWidth * character2Scale; // 計算角色 2 影格縮放後的顯示寬度。
  const character2DisplayHeight = character2FrameHeight * character2Scale; // 計算角色 2 影格縮放後的顯示高度。
  const stopDisplayWidth = (stopSprite.width / 14) * min(targetCharacterHeight / stopSprite.height, (width * 0.8) / (stopSprite.width / 14)); // 計算角色 1 站立時的最大顯示寬度。
  const runDisplayWidth = (runSprite.width / 12) * min(targetCharacterHeight / runSprite.height, (width * 0.8) / (runSprite.width / 12)); // 計算角色 1 跑步時的最大顯示寬度。
  const character1DetectionWidth = max(stopDisplayWidth, runDisplayWidth); // 取角色 1 兩種動畫中較寬的影格，避免狀態切換影響靠近判定。
  if (isRunning !== wasRunning) { // 當跑步狀態改變時重設動畫影格。
    currentFrame = 0; // 從第一格開始播放新狀態的動畫。
    runIntroFinished = false; // 重新開始跑步時，讓跑步動畫前 12 格先完整播放一次。
    lastFrameTime = millis(); // 重設影格計時，避免切換狀態時立刻跳過第一格。
    wasRunning = isRunning; // 記錄目前的跑步狀態。
  } // 結束動畫狀態切換判斷。
  if (movingLeft && !movingRight) { // 當只有左方向鍵按下時執行左移。
    characterX -= moveSpeed; // 將角色往左移動。
    facing = -1; // 將角色翻轉為朝向左方。
  } // 結束左移判斷。
  if (movingRight && !movingLeft) { // 當只有右方向鍵按下時執行右移。
    characterX += moveSpeed; // 將角色往右移動。
    facing = 1; // 將角色設定為朝向右方。
  } // 結束右移判斷。
  characterX = constrain(characterX, displayWidth / 2, width - displayWidth / 2); // 限制角色水平位置，避免移出畫布左右邊界。
  characterY = constrain(characterY, displayHeight / 2, height - displayHeight / 2 - floorPadding); // 限制角色高度，讓腳落在地板上且不被畫布裁切。
  const nearThreshold = (character1DetectionWidth + character2DisplayWidth) / 2 + min(12, width * 0.02); // 以角色最大顯示寬度加少量距離作為固定靠近判定範圍。
  const isNearCharacter2 = abs(characterX - character2X) <= nearThreshold; // 判斷角色 1 是否已經靠近角色 2。
  const isMovingTowardCharacter2 = (characterX > character2X && movingLeft) || (characterX < character2X && movingRight); // 判斷角色 1 是否正在朝角色 2 的位置移動。
  if (isNearCharacter2 && isMovingTowardCharacter2 && !questionAsked) { // 角色 1 移動靠近角色 2 時顯示選擇題。
    questionActive = true; // 開啟選擇題並暫停角色 1 移動。
    questionAsked = true; // 標記本次靠近已經出過題目。
  } // 結束靠近角色 2 的出題判斷。
  if (!isNearCharacter2) { // 角色 1 遠離角色 2 時恢復角色 2 站立狀態。
    questionActive = false; // 隱藏選擇題。
    if (questionAsked || character2State !== "wait") { // 只在離開角色 2 時重設一次反應狀態。
      questionAsked = false; // 允許角色 1 下次靠近時再次出題。
      character2State = "wait"; // 切回角色 2 的等待動畫。
      character2Frame = 0; // 從角色 2 等待動畫的第一格重新播放。
      lastCharacter2FrameTime = millis(); // 重設角色 2 動畫計時。
    } // 結束離開時的角色 2 動畫重設。
  } // 結束角色遠離時的狀態重設。
  if (millis() - lastFrameTime >= frameInterval) { // 到達影格間隔時才切換動畫。
    if (isRunning && !runIntroFinished) { // 跑步動畫前 12 格尚未播放完時進入此區塊。
      if (currentFrame < 11) { // 尚未到達第 12 格時繼續往後播放。
        currentFrame += 1; // 切換到下一格跑步影格。
      } else { // 第 12 格已顯示一個影格間隔後進入此區塊。
        currentFrame = 5; // 從第 6 格開始接續循環播放。
        runIntroFinished = true; // 標記跑步動畫的前 12 格已播放完畢。
      } // 結束跑步動畫首次播放判斷。
    } else if (isRunning) { // 跑步動畫首次播放完成後進入此區塊。
      currentFrame = currentFrame >= 11 ? 5 : currentFrame + 1; // 在第 6 格到第 12 格之間循環播放。
    } else { // 沒有按住左右方向鍵時進入此區塊。
      currentFrame = (currentFrame + 1) % frameCountInSheet; // 循環播放 14 格站立動畫。
    } // 結束跑步與站立影格切換判斷。
    lastFrameTime = millis(); // 記錄本次切換影格的時間。
  } // 結束動畫影格切換判斷。
  if (millis() - lastCharacter2FrameTime >= frameInterval) { // 到達影格間隔時切換角色 2 的動畫。
    character2Frame = (character2Frame + 1) % character2FrameCount; // 循環播放角色 2 目前狀態的所有影格。
    lastCharacter2FrameTime = millis(); // 記錄角色 2 本次切換影格的時間。
  } // 結束角色 2 動畫影格切換判斷。
  push(); // 儲存目前的繪圖座標與縮放狀態。
  translate(character2X, height - character2DisplayHeight / 2 - floorPadding); // 將繪圖原點移到角色 2 的位置並讓腳靠近地板。
  image(character2Sprite, -character2DisplayWidth / 2, -character2DisplayHeight / 2, character2DisplayWidth, character2DisplayHeight, character2Frame * character2FrameWidth, 0, character2FrameWidth, character2FrameHeight); // 從角色 2 精靈圖裁切目前影格並繪製。
  pop(); // 還原繪圖座標與縮放狀態。
  push(); // 儲存目前的繪圖座標與縮放狀態。
  translate(characterX, characterY); // 將繪圖原點移到角色目前的位置。
  scale(facing, 1); // 依角色朝向水平翻轉跑步或站立影像。
  image(sprite, -displayWidth / 2, -displayHeight / 2, displayWidth, displayHeight, currentFrame * frameWidth, 0, frameWidth, frameHeight); // 從精靈圖裁切目前影格並繪製在角色位置。
  pop(); // 還原繪圖座標與縮放狀態。
  if (character2State === "correct" || character2State === "incorrect") { // 角色 2 正在回應答案時顯示對話框。
    drawCharacter2Dialogue(character2X, character2DisplayHeight, floorPadding); // 依答題結果繪製角色 2 的鼓勵或提示訊息。
  } // 結束角色 2 對話框顯示判斷。
  if (questionActive) { // 選擇題啟用時將題目與答案選項繪製在畫布上。
    drawQuizPanel(); // 繪製透明黃色選擇題方框與答案按鈕。
  } // 結束選擇題繪製判斷。
} // 結束每畫格繪圖函式。

function drawQuizPanel() { // 繪製選擇題方框、題目與四個答案按鈕。
  const panelWidth = width * 0.72; // 加寬題目方框，讓完整情境題能清楚呈現。
  const panelHeight = height * 0.68; // 加高題目方框，容納情境、題目與答案選項。
  const panelX = (width - panelWidth) / 2; // 將題目方框水平置中。
  const panelY = (height - panelHeight) / 2; // 將題目方框垂直置中。
  const panelPadding = panelWidth * 0.035; // 設定答案按鈕的左右內距。
  const buttonGap = panelWidth * 0.03; // 設定同一列答案按鈕間的間距。
  const buttonWidth = (panelWidth - panelPadding * 2 - buttonGap) / 2; // 計算每個答案按鈕的寬度。
  const buttonHeight = panelHeight * 0.16; // 計算每個答案按鈕的高度。
  const firstButtonY = panelY + panelHeight * 0.58; // 設定第一列答案按鈕的垂直位置。
  const rowGap = panelHeight * 0.04; // 設定兩列答案按鈕間的垂直距離。
  push(); // 儲存目前的繪圖樣式與文字設定。
  stroke(120, 95, 0); // 設定題目方框與按鈕的外框顏色。
  strokeWeight(2); // 設定題目方框與按鈕外框的粗細。
  fill(255, 255, 0, 80); // 設定黃色背景並使用 80 的透明度。
  rect(panelX, panelY, panelWidth, panelHeight, 12); // 繪製透明黃色題目方框。
  noStroke(); // 關閉文字區域的外框。
  fill(40); // 設定題目文字顏色。
  textAlign(CENTER, CENTER); // 將題目文字設定為水平與垂直置中。
  textSize(max(12, min(panelWidth * 0.04, panelHeight * 0.06))); // 依題目方框尺寸設定標題字體大小。
  text("性別平等情境題", width / 2, panelY + panelHeight * 0.1); // 顯示選擇題主題標題。
  textSize(max(12, min(panelWidth * 0.035, panelHeight * 0.05))); // 設定適合多行題目內容的字體大小。
  text(quizQuestion, width / 2, panelY + panelHeight * 0.34); // 顯示完整題目與法規情境。
  textSize(max(11, min(panelWidth * 0.04, panelHeight * 0.06, buttonWidth * 0.12))); // 依答案按鈕大小設定選項字體。
  for (let index = 0; index < quizOptions.length; index += 1) { // 逐一繪製四個答案選項按鈕。
    const column = index % 2; // 計算答案按鈕所在的欄位。
    const row = floor(index / 2); // 計算答案按鈕所在的列。
    const buttonX = panelX + panelPadding + column * (buttonWidth + buttonGap); // 計算答案按鈕的水平位置。
    const buttonY = firstButtonY + row * (buttonHeight + rowGap); // 計算答案按鈕的垂直位置。
    fill(255, 255, 255, 220); // 設定答案按鈕的半透明白色底色。
    stroke(120, 95, 0); // 設定答案按鈕外框顏色。
    rect(buttonX, buttonY, buttonWidth, buttonHeight, 6); // 繪製答案按鈕的背景。
    noStroke(); // 關閉答案文字的外框。
    fill(30); // 設定答案文字顏色。
    text("(" + String.fromCharCode(65 + index) + ") " + quizOptions[index], buttonX + buttonWidth / 2, buttonY + buttonHeight / 2); // 顯示 A 至 D 選項與答案內容。
  } // 結束答案選項繪製迴圈。
  pop(); // 還原繪圖樣式與文字設定。
} // 結束選擇題繪製函式。

function drawCharacter2Dialogue(characterX, characterHeight, floorPadding) { // 在角色 2 頭部附近繪製答題回饋對話框。
  const message = character2State === "correct" ? "太好了！答對了" : "答錯了，再試一次！"; // 依答題結果設定對話內容。
  const bubbleWidth = min(width * 0.46, max(180, width * 0.28)); // 依畫布寬度設定對話框寬度。
  const bubbleHeight = max(46, height * 0.12); // 依畫布高度設定對話框高度。
  const bubbleX = constrain(characterX - bubbleWidth / 2, 8, width - bubbleWidth - 8); // 將對話框水平置中於角色 2 並限制在畫布內。
  const bubbleY = max(8, height - characterHeight - floorPadding - bubbleHeight - 18); // 將對話框放在角色 2 頭部上方。
  push(); // 儲存目前的繪圖樣式與文字設定。
  fill(255); // 設定對話框與對話尾巴的白色底色。
  stroke(50); // 設定對話框外框顏色。
  strokeWeight(2); // 設定對話框外框粗細。
  triangle(characterX - 9, bubbleY + bubbleHeight - 2, characterX + 9, bubbleY + bubbleHeight - 2, characterX, bubbleY + bubbleHeight + 12); // 繪製指向角色 2 的對話框尾巴。
  rect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 12); // 繪製圓角白色對話框。
  noStroke(); // 關閉文字外框。
  fill(35); // 設定對話文字顏色。
  textAlign(CENTER, CENTER); // 將對話文字水平與垂直置中。
  textSize(max(11, min(width * 0.03, bubbleHeight * 0.32))); // 依畫布大小設定對話文字字體大小。
  text(message, bubbleX + bubbleWidth / 2, bubbleY + bubbleHeight / 2); // 顯示答題回饋訊息。
  pop(); // 還原繪圖樣式與文字設定。
} // 結束角色 2 對話框繪製函式。

function answerQuestion(optionIndex) { // 根據學生選擇的答案設定角色 2 的反應。
  if (!questionActive) { // 題目未顯示時不接受答案。
    return; // 結束答案處理函式。
  } // 結束題目狀態判斷。
  questionActive = false; // 答題後立即隱藏選擇題方框。
  character2State = optionIndex === correctQuizOption ? "correct" : "incorrect"; // 依答案正誤選擇角色 2 的反應動畫。
  character2Frame = 0; // 從反應動畫的第一格開始播放。
  lastCharacter2FrameTime = millis(); // 重設角色 2 反應動畫的計時。
} // 結束答案處理函式。

function mousePressed() { // 處理學生使用滑鼠點選答案按鈕。
  if (!questionActive) { // 題目未顯示時不處理滑鼠選擇。
    return; // 結束滑鼠事件函式。
  } // 結束題目狀態判斷。
  const panelWidth = width * 0.72; // 取得加寬後的題目方框寬度。
  const panelHeight = height * 0.68; // 取得加高後的題目方框高度。
  const panelX = (width - panelWidth) / 2; // 取得題目方框的水平位置。
  const panelY = (height - panelHeight) / 2; // 取得題目方框的垂直位置。
  const panelPadding = panelWidth * 0.035; // 取得答案按鈕的左右內距。
  const buttonGap = panelWidth * 0.03; // 取得同一列答案按鈕的間距。
  const buttonWidth = (panelWidth - panelPadding * 2 - buttonGap) / 2; // 取得每個答案按鈕的寬度。
  const buttonHeight = panelHeight * 0.16; // 取得每個答案按鈕的高度。
  const firstButtonY = panelY + panelHeight * 0.58; // 取得第一列答案按鈕的垂直位置。
  const rowGap = panelHeight * 0.04; // 取得兩列答案按鈕間的垂直距離。
  for (let index = 0; index < quizOptions.length; index += 1) { // 逐一檢查點擊位置是否落在答案按鈕內。
    const column = index % 2; // 計算答案按鈕所在的欄位。
    const row = floor(index / 2); // 計算答案按鈕所在的列。
    const buttonX = panelX + panelPadding + column * (buttonWidth + buttonGap); // 計算答案按鈕的水平位置。
    const buttonY = firstButtonY + row * (buttonHeight + rowGap); // 計算答案按鈕的垂直位置。
    if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth && mouseY >= buttonY && mouseY <= buttonY + buttonHeight) { // 判斷滑鼠是否點在目前答案按鈕內。
      answerQuestion(index); // 提交被點選的答案並播放角色 2 的反應。
      return false; // 結束滑鼠事件並避免瀏覽器預設行為。
    } // 結束答案按鈕點擊判斷。
  } // 結束答案按鈕檢查迴圈。
} // 結束滑鼠事件函式。

function keyPressed() { // 處理方向鍵按下時的瀏覽器預設行為。
  if (questionActive && key >= "A" && key <= "D") { // 題目顯示時允許按下 A 到 D 選擇標示的選項。
    answerQuestion(key.charCodeAt(0) - 65); // 依英文字母換算答案選項位置。
  } // 結束英文字母答題判斷。
  if (questionActive && key >= "a" && key <= "d") { // 題目顯示時也允許按下小寫 a 到 d。
    answerQuestion(key.toUpperCase().charCodeAt(0) - 65); // 將小寫字母轉成大寫後換算選項位置。
  } // 結束小寫字母答題判斷。
  if (questionActive && key >= "1" && key <= "4") { // 題目顯示時檢查數字鍵 1 到 4。
    answerQuestion(Number(key) - 1); // 使用數字鍵選擇對應的答案選項。
  } // 結束數字鍵答題判斷。
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) { // 檢查按下的按鍵是否為左右方向鍵。
    return false; // 阻止方向鍵捲動瀏覽器頁面。
  } // 結束方向鍵判斷。
} // 結束按鍵處理函式。

function windowResized() { // 當瀏覽器視窗大小改變時重新調整畫布。
  resizeCanvas(windowWidth, windowHeight); // 讓畫布持續填滿整個瀏覽器視窗。
  characterX = constrain(characterX, 0, width); // 調整角色水平位置，確保仍在新畫布範圍內。
  characterY = constrain(characterY, 0, height); // 調整角色垂直位置，確保仍在新畫布範圍內。
} // 結束視窗尺寸變更函式。
