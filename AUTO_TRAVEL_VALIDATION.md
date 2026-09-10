# 自動旅行驗證

- 公開網址：https://bunnymeth.github.io/quantum-bunny-pwa/
- GitHub Pages 來源：`gh-pages` 分支根目錄，HTTPS 已啟用。
- 2026-09-10 公開頁面確認顯示「單次自動跳躍」與「安排一次自動跳躍」按鈕。
- 開啟後顯示「兔兔正在準備這一次跳躍」，並保留設定於 `quantum-bunny-pwa-state-v1` localStorage。
- 實測以足夠資源啟用自動旅行：首頁顯示「兔兔正在穿越星海」、目的地「威尼斯水巷」與倒數進度。
- 單次跳躍版本會在第一趟旅程完成後將 `autoTravel` 設為 `false`、清除 `nextDepartureAt`，因此旅行次數增加、明信片與日誌正常回收後不會再次出發。
- 單次自動跳躍會消耗正能量與純淨脫質；測試資料為公開頁面瀏覽器本機資料，不涉及使用者裝置。
