# WordPress 嵌入指南

本文件說明如何將寶可夢努力值計算器嵌入到您的 WordPress 網站中。

## 方法一：使用 iframe 嵌入（推薦）

這是最簡單的方法，只需在 WordPress 文章或頁面中加入以下 HTML 代碼：

```html
<iframe 
  src="https://3000-ikgtqddsc68ym6i2e1kd5-95fdb9a8.manus-asia.computer/embed.html" 
  width="100%" 
  height="1200" 
  frameborder="0" 
  style="border: none; max-width: 1200px; margin: 0 auto; display: block;"
></iframe>
```

### 步驟說明

1. 在 WordPress 編輯器中切換到「HTML」或「程式碼」模式
2. 貼上上方的 iframe 代碼
3. 儲存並預覽頁面

### 調整高度

如果計算器顯示不完整，可以調整 `height` 參數：

```html
<iframe ... height="1500" ...></iframe>
```

## 方法二：直接嵌入 HTML（進階）

如果您想要更好的整合效果，可以直接將 `embed.html` 的內容嵌入到 WordPress 頁面中。

### 步驟說明

1. 下載 `client/public/embed.html` 檔案
2. 在 WordPress 中安裝「Insert Headers and Footers」或類似的插件
3. 將 `embed.html` 的內容複製到頁面中
4. 確保 WordPress 允許執行 JavaScript

### 注意事項

- 某些 WordPress 主題可能會與計算器的樣式衝突
- 如果遇到樣式問題，建議使用方法一（iframe）

## 方法三：使用短代碼（需要自訂）

如果您熟悉 WordPress 開發，可以建立自訂短代碼：

```php
function pokemon_ev_calculator_shortcode() {
    return '<iframe src="https://3000-ikgtqddsc68ym6i2e1kd5-95fdb9a8.manus-asia.computer/embed.html" width="100%" height="1200" frameborder="0" style="border: none; max-width: 1200px; margin: 0 auto; display: block;"></iframe>';
}
add_shortcode('pokemon_ev_calc', 'pokemon_ev_calculator_shortcode');
```

然後在文章中使用：

```
[pokemon_ev_calc]
```

## 自訂樣式

如果您想要調整計算器的外觀以配合您的網站風格，可以：

1. 下載 `embed.html` 檔案
2. 修改 `<style>` 標籤內的 CSS
3. 將修改後的檔案上傳到您的伺服器
4. 更新 iframe 的 `src` 屬性指向新的檔案位置

## 常見問題

### Q: 計算器無法顯示？

A: 請確認：
- 您的 WordPress 主題允許 iframe
- 瀏覽器沒有阻擋第三方內容
- 網址正確無誤

### Q: 如何調整計算器大小？

A: 修改 iframe 的 `width` 和 `height` 屬性。建議：
- 寬度：`100%` 或固定像素值（如 `1200px`）
- 高度：`1200px` 到 `1500px` 之間

### Q: 可以在多個頁面使用嗎？

A: 可以！您可以在任意數量的頁面或文章中嵌入計算器。

### Q: 計算器會影響網站速度嗎？

A: 不會。計算器使用 iframe 載入，不會影響您網站的載入速度。

## 技術支援

如有任何問題，請參考：
- PokéAPI 文件：https://pokeapi.co/docs/v2
- 阿比丁的寶可夢圖鑑：https://abitingpokedex.manus.space/

## 授權說明

本計算器使用 PokéAPI 提供的資料，遵循其使用條款。
計算器本身可自由使用於個人或商業網站。
