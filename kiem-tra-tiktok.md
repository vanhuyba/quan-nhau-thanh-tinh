# Kiểm tra TikTok và nghiệm thu — 03/11/2026

## Kết quả thực tế

- Server localhost:3000 chạy. Controller báo chưa kết nối trước kiểm tra.
- Đã dùng controller kết nối `@hannie.l.lm.n`; log xác nhận thành công lúc 00:10:46 giờ Việt Nam.
- Snapshot WebSocket thực tế: `connected`, đúng tài khoản, 4 người thật (`demo=false`), 0 người mô phỏng, 4 người xếp hàng, 0 người ngồi. Có 8 bàn/80 ghế.
- Trong 15 giây quan sát tiếp theo không phát sinh chat/quà/TTS mới. Không mua hoặc gửi quà để thử. Chưa xác minh quà thật và âm thanh phát đến người xem trong lần kiểm tra này.
- Overlay, controller, nền v2, atlas nhân vật và ảnh phục vụ nam đều trả HTTP 200; trình duyệt không ghi lỗi JavaScript trong lần kiểm tra.
- Chạy lại đủ 12 test: đạt. Gồm ngưỡng chính xác 10/100 xu, quà 1 xu và combo, FIFO theo hạng, chuyển hạng, không trùng ghế, đúng 10 ghế/bàn, dữ liệu quà lịch sử và payload TikTok giả lập.

## Đối chiếu yêu cầu

| Yêu cầu | Kết quả |
|---|---|
| Bình luận có một nhân vật theo ID, đứng chờ | Đã có; nhận diện theo ID, mọi bình luận đều cho vào theo yêu cầu mới |
| Quà đơn giá 1 xu nhận xúc xích | Đạt trong test, nhận số lượng theo combo; chưa nhận quà thật trong đợt kiểm tra |
| Cộng xu phiên, 10–99 bình dân, từ 100 VIP | Đạt trong test |
| Hết ghế xếp hàng, có ghế tự vào | Đạt trong test, FIFO riêng theo hạng |
| 10 người/bàn, 6 bình dân + 2 VIP | Đạt, 80 ghế riêng biệt |
| Trang phục đời thường, ngồi ghế, đồ nhậu, phân biệt VIP, nền bỏ bàn trang trí | Đã kiểm tra hình ảnh preview |
| Bếp chính + phụ bếp, phục vụ 1 nam + 1 nữ | Đã có và kiểm tra preview |
| Người đã ngồi được đọc comment bằng giọng đã gán | CHƯA CÓ: `onChat()` chỉ phát sự kiện chat; chưa gọi TTS, chưa gán giọng riêng |
| Nhiều người comment xếp lượt đọc, làm nổi bật người đang nói | CHƯA CÓ: hàng TTS hiện chỉ phục vụ lời cảm ơn quà/thông báo; chat bật bong bóng ngay khi nhận, chưa đồng bộ audio |

## Giới hạn cần xử lý trước khi kết luận hoàn tất

- Tổng xu phiên và số xúc xích chỉ ở RAM, đặt lại khi restart server. Ledger quà thật vẫn trên đĩa.
- Người vắng tương tác 5 phút bị mời rời; quyền theo xu chỉ giữ trong cùng lần chạy server.
- 80 người làm nickname ngắn lại trên bản dọc, cần duyệt khả năng đọc trên điện thoại.
- Thư viện TikTok nhận sự kiện công khai; trạng thái kết nối thành công chưa thay thế thử nghiệm nhận quà thật và nghe âm thanh từ thiết bị người xem.
- Chưa xác minh luồng trùng quà khi reconnect bằng sự kiện thật; kiểm thử hiện chống trùng trong một lần kết nối.
- Các mô phỏng đã tự hết hạn, không còn trộn người mẫu vào snapshot lúc kiểm tra. Không khởi động lại server sau khi đã kết nối thật.

Kết luận: kết nối TikTok đã thành công, phần xếp hàng/quà/bàn có test đạt; chưa thể kết luận toàn bộ yêu cầu ban đầu hoàn tất vì thiếu đọc comment, giọng theo người và highlight đồng bộ.


## Bổ sung kiểm thử LIVE thật — 03/11/2026, khoảng 00:21

Theo yêu cầu người dùng đã bắt đầu phát LIVE Studio với nguồn Link quán nhậu mới, reconnect TikTok00:19:50. 00:21:01.881 nhận join,00:21:01.883 nhận chat thật sau khi người dùng báo đã gửi hey. Người Hannie nè có đúng1nhân vật,0xu,xếp hàng#1; đã đối chiếu cả controller, logWebSocket và hình phát Studio. Phiên30FPS,frame drops0,upload khoảng1Mbps. Giữ LIVE chạy. Chưa có quà thật trong khoảng quan sát nên chưa nghiệm thu xúc xích/vào bàn/TTS bằng quà thật.
