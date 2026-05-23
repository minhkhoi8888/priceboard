# Pinetree Priceboard Test

**Ứng viên:** Hoàng Minh Khôi

## Tóm tắt

Project được em xây dựng từ mockup Figma **"Priceboard Test"** thành một giao diện trading hoạt động được với dữ liệu realtime.

## Tech Stack

- React 19 + TypeScript + Vite
- Redux Toolkit + RTK Query
- Tailwind CSS
- TradingView `lightweight-charts`
- Binance Spot REST API + WebSocket
- `react-window`
- `sonner`
- AI support `(review logic, rà soát UI, hỗ trợ test flow, utilities functions, etc)`

## Cách chạy local

```bash
npm install
npm run dev
```

## Flow triển khai

1. Từ Figma, em chia màn hình thành các khối chính: header, market list, overview, chart, order book, recent trades và order panel.
2. Ở mức app, em tổ chức luồng qua **Redux Store -> ThemeProvider -> SocketProvider**.
3. Binance WebSocket được dùng để cập nhật mini ticker cho market list, aggregate trade cho recent trades và depth stream cho order book.
4. Chart lấy dữ liệu nến ban đầu từ Binance REST `/api/v3/klines`, sau đó đồng bộ tiếp bằng kline stream realtime.
5. Phần market stats được bổ sung bằng CoinGecko do em chưa tìm thấy API Binance phù hợp cho phần này.
6. Khi load trang, skeleton sẽ hiển thị trước để giảm cảm giác giật layout.

## Kết quả đã hoàn thành

- Điều chỉnh timeframe chart: thay `3M` và `1Y` bằng `12H` và `1W` do API hiện tại không hỗ trợ tốt cho flow fetch nến của bài làm
- Gom batch socket updates trước khi ghi vào Redux để giảm rerender và giữ UI mượt hơn
- Tách code theo module, lazy-load chart để giảm initial bundle size, đồng thời memo các giá trị cần thiết để hạn chế render và xử lý dư thừa
- Order panel có tương tác tính toán theo giá và amount, tự cập nhật số lượng mua/bán tương ứng
- Tự nhận dark/light theme theo setting của máy, đồng thời vẫn cho phép người dùng chuyển theme thủ công
- Responsive cho mobile, có market overlay và mobile depth tabs
- Virtualize danh sách recent trades để scroll ổn định hơn khi dữ liệu cập nhật liên tục
- Có cơ chế reconnect socket khi kết nối realtime bị ngắt và có toast feedback cho các action chưa sẵn sàng

## Tài liệu tham khảo

- Binance Spot WebSocket Streams: [github.com/binance/binance-spot-api-docs/blob/master/web-socket-streams.md](https://github.com/binance/binance-spot-api-docs/blob/master/web-socket-streams.md)
- Binance Spot REST Klines: [github.com/binance/binance-spot-api-docs/blob/master/rest-api.md](https://github.com/binance/binance-spot-api-docs/blob/master/rest-api.md)
- CoinGecko API Overview: [docs.coingecko.com/reference/endpoint-overview](https://docs.coingecko.com/reference/endpoint-overview)
- Lightweight Charts Docs: [tradingview.github.io/lightweight-charts](https://tradingview.github.io/lightweight-charts/)

## Lời kết

Đây là phần thể hiện tốt nhất của em trong thời gian hơn **3 ngày** để cân bằng giữa UI fidelity, dữ liệu realtime và cấu trúc code.  
Chắc chắn sản phẩm vẫn còn một vài thiếu sót, em rất mong nhận được góp ý từ anh/chị để tiếp tục cải thiện tốt hơn.  
Em cũng rất mong có cơ hội được đồng hành và làm việc tại **Pinetree**.
