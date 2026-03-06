# 如何將寶可夢能力值計算器嵌入 WordPress 網站

您可以透過以下兩種方式將此計算器嵌入您的 WordPress 網站：

## 方法一：使用 iframe（最簡單）

在 WordPress 編輯器中，新增一個「自訂 HTML」區塊，並貼上以下程式碼：

```html
<iframe 
  src="https://pokevcalc-3akm6djk.manus.space" 
  width="100%" 
  height="800" 
  style="border: none; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
  title="Pokemon EV Calculator"
></iframe>
```

您可以根據需要調整 `height`（高度）數值。

## 方法二：使用 WordPress 外掛（更進階）

如果您希望有更好的整合體驗，可以使用 "Insert Headers and Footers" 或類似的外掛，將計算器作為全頁面應用程式載入，或者直接使用上述的 iframe 方法。

### 注意事項：
1. 確保您的 WordPress 網站支援 iframe 嵌入。
2. 如果您希望嵌入英文版，請將 `src` 網址改為 `https://pokevcalc-3akm6djk.manus.space/en`。
