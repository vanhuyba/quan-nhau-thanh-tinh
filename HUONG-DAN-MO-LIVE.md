# Hướng dẫn tự mở LIVE Quán Nhậu Thanh Tịnh

Dành cho máy Mac hiện tại. Cập nhật 03/11/2026.

## 1. Mở server quán nhậu

Mở ứng dụng **Terminal** trên Mac (Command + Space → gõ Terminal → Enter).

Dán lệnh sau để kiểm tra server đã chạy chưa:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

- Nếu có dòng `node ... LISTEN`: server đang chạy, bỏ qua lệnh khởi động và sang bước2.
- Nếu không có kết quả: dán hai dòng sau vào Terminal rồi Enter:

```bash
cd '/Users/huyba/Documents/quán nhậu thanh tịnh/live'
/Users/huyba/.nvm/versions/node/v22.22.3/bin/node server.mjs
```

Khi thấy `Server chạy tại http://localhost:3000` là thành công.

**Giữ cửa sổ Terminal này mở trong suốt buổi LIVE.** Không bấm Control + C, không đóng Terminal, không cho máy ngủ. Không cần chạy npm install mỗi lần mở.

## 2. Mở bảng điều khiển

Mở trình duyệt và vào:

[http://localhost:3000/live/control.html](http://localhost:3000/live/control.html)

Hoặc mở một tab Terminal khác bằng Command + T rồi chạy:

```bash
open 'http://localhost:3000/live/control.html'
```

Bảng điều khiển dùng để kết nối TikTok, chỉnh nhạc và mời khách vào bàn. Chưa cần bấm Kết nối nếu chưa phát LIVE.

API key Euler đã được lưu riêng trên máy. Không cần nhập lại mỗi lần, không gửi key vào chat hoặc chụp ảnh key.

## 3. Mở TikTok LIVE Studio

Mở từ Applications hoặc chạy trong tab Terminal mới:

```bash
open -a 'TikTok LIVE Studio'
```

Nếu đang ở trang chủ Studio, bấm **Go LIVE** để vào màn hình chuẩn bị cảnh. Nút này ở trang chủ có thể chỉ mở giao diện chuẩn bị, chưa phát ngay.

Kiểm tra cảnh **Screen + Camera** và nguồn **Link**. Quán phải hiện đúng: 8 bàn, bếp chính/phụ bếp, phục vụ nam/nữ.

Double-click nguồn **Link** để kiểm tra:

| Mục | Giá trị |
| --- | --- |
| Link | `http://localhost:3000/live/overlay.html?autoplay=1&v=gender-guide-1` |
| Turn on sound | Bật |
| Custom resolution | Bật |
| W | 1080 |
| H | 1920 |
| Always keep active | Bật |

Bấm **Apply**. Giữ camera nhỏ góc dưới phải như đã bố trí. Nếu muốn nói chuyện với người xem, bật micro trong Studio; micro tắt vẫn có thể phát nhạc từ nguồn Link.

Tiêu đề dùng: **Quán Nhậu Thanh Tịnh · Góc bình yên**. Danh mục đã dùng: **Music**.

## 4. Bắt đầu phát LIVE

Ở màn hình có cảnh quán, bấm nút hồng **Go LIVE**. Nếu có màn hình chuẩn bị tiếp theo, kiểm tra tiêu đề/cảnh rồi hoàn tất bước phát của Studio.

Dấu hiệu đã phát:

- Nút Go LIVE chuyển thành đồng hồ đang tăng.
- Upload có dữ liệu, Encoder FPS khoảng30.
- Khung hình có quán, thanh âm thanh có tín hiệu khi nhạc phát.

Nếu TikTok yêu cầu camera, kiểm tra nguồn Camera đang bật. Nếu ứng dụng báo lỗi hoặc hạn chế, đọc thông báo trước, không bấm Go LIVE liên tục.

## 5. Kết nối bình luận và quà TikTok

Quay lại [bảng điều khiển](http://localhost:3000/live/control.html).

1. Ở ô username, nhập `hannie.l.lm.n` (hoặc tài khoản thực sự đang phát nếu bạn đổi kênh).
2. Nếu bảng đã hiện **TikTok: @hannie.l.lm.n ✓**, không bấm kết nối thêm.
3. Nếu chưa kết nối, bấm **Kết nối** một lần và chờ trạng thái thành công.

**Phát video trong Studio và nhận bình luận/quà là hai việc riêng:** cần cả đồng hồ LIVE trong Studio và trạng thái kết nối TikTok thành công trong bảng điều khiển.

Dùng tài khoản khác hoặc nhờ người xem bình luận `hey` để thử: nhân vật sẽ xuất hiện ở hàng chờ. Bình luận `nam` hoặc `nữ` để đổi hình. Không cần mua/tặng quà để kiểm tra ban đầu.

Nên dùng điện thoại/tài khoản khác xem LIVE để xác nhận hình và tiếng thực sự đến người xem. Thanh âm thanh trong Studio chưa thay thế việc nghe thử này.

## 6. Thao tác trong lúc LIVE

- **Mời khách:** tìm tên ở bảng điều khiển → bấm Bình dân hoặc VIP. Tự động bỏ quyền mời thủ công và xét lại theo xu.
- **Nhạc:** kiểm tra nhạc nền được bật trong controller và Turn on sound bật ở nguồn Link.
- **Chỉnh hình chưa lên LIVE:** mở nguồn Link → đổi phần cuối `v=gender-guide-1` thành tên mới, ví dụ `v=reload-2` → Apply. Giữ `autoplay=1`.
- Tải lại trang trên Chrome/IAB không tự tải lại nguồn Link trong Studio.
- Không bật bot, đổ người mẫu, thử quà hoặc xóa khách khi đang LIVE thật nếu bạn không muốn các thao tác đó xuất hiện trước người xem.
- Server lưu trạng thái phiên định kỳ. Mở lại server có thể giữ quyền/xu của phiên trước; restart không phải nút reset toàn bộ phiên.

Quy tắc đang áp dụng: bình luận vào hàng chờ; tổng10–99 xu vào bàn thường, từ100 xu VIP; quà đơn giá1 xu tặng xúc xích; một sự kiện quà trên300 xu có pháo hoa20 giây. Người không bình luận/quà5 phút tự off. Nhắc tặng quà2 phút/lần, gọi món5 phút/lần.

## 7. Kết thúc buổi LIVE

1. Trong **TikTok LIVE Studio**, bấm nút kết thúc LIVE và xác nhận **End now** nếu ứng dụng hỏi.
2. Kiểm tra Studio trở lại **Go LIVE** hoặc màn hình tổng kết.
3. Trong controller bấm **Ngắt** để ngừng bộ nhận TikTok và các lần thử kết nối lại.
4. Nếu không dùng tiếp, quay lại tab Terminal chạy server, bấm **Control + C** để dừng server.

Không chỉ tắt server để kết thúc LIVE: Studio có thể vẫn phát nhưng cảnh mất kết nối. Nút Ngắt ở controller cũng không kết thúc video LIVE.

## 8. Xử lý lỗi thường gặp

### Không mở được localhost:3000

Kiểm tra bước1. Server phải đang chạy và Terminal chưa đóng. Khi đã chạy lại, reload trang.

### Terminal báo EADDRINUSE / address already in use

Cổng3000 đang được một tiến trình sử dụng. Chạy lệnh kiểm tra ở bước1, thử mở controller; không chạy thêm server hoặc tắt tiến trình bất kỳ khi chưa biết nó là gì.

### Lệnh Node báo không tìm thấy file hoặc lỗi cú pháp

Lệnh hướng dẫn dùng Node22 ở đường dẫn đã cài trên máy. Nếu đã đổi/cài lại Node, kiểm tra:

```bash
node -v
```

Cần Node>=20. Nếu đúng phiên bản, có thể dùng:

```bash
cd '/Users/huyba/Documents/quán nhậu thanh tịnh/live'
node server.mjs
```

Nếu thiếu thư viện sau khi chuyển máy/copy project, dùng Node>=20 rồi chạy `npm ci` trong thư mục live trước khi khởi động. Không cần làm bước này thường xuyên.

### TikTok chưa kết nối / không thấy nhân vật

Kiểm tra kênh thực sự đang LIVE, username đúng và controller có dấu✓. Sau đó bình luận mới từ tài khoản khác. Chỉ vào xem không tự tạo nhân vật theo cấu hình mặc định.

### rate_limit_account_minute / rate_limit_account_hour

Đây là giới hạn số lần mở kết nối. Không bấm Kết nối liên tục. Bản hiện tại ngừng tự retry khi nhận lỗi giới hạn ở bước kết nối. Chờ quota được phục hồi, kiểm tra trạng thái key trong controller hoặc dashboard Euler rồi thử lại một lần. Key riêng vẫn có hạn mức; không có nút mở khóa ngay trên quán.

### Không nghe nhạc

Kiểm tra nhạc nền trong controller, Turn on sound của Link, âm lượng nguồn trong Studio và âm lượng điện thoại xem. Nếu mở preview trên trình duyệt thì bấm “Bấm để bật âm thanh”. Tránh mở tiếng nhiều preview cùng lúc gây vọng. Nếu vẫn mất nhạc, reload nguồn Link theo bước6 rồi kiểm tra lại.

Nếu nhạc chạy nhưng lời cảm ơn quà đôi lúc không đọc, có thể là lỗi TTS riêng; không cần ngắt TikTok liên tục vì lỗi đó.

### Hình cũ hoặc màn hình đen trong Studio

Kiểm tra server trước, sau đó URL nguồn Link và Apply lại bằng tham số v mới. Nguồn chính là **Link**, không phải `OngChuMMO_Live` cũ.

## 9. Lệnh nhanh cho lần sau

Chỉ chạy lệnh khởi động nếu cổng3000 chưa có server:

```bash
cd '/Users/huyba/Documents/quán nhậu thanh tịnh/live'
/Users/huyba/.nvm/versions/node/v22.22.3/bin/node server.mjs
```

Giữ tab đó mở. Trong tab Terminal mới:

```bash
open 'http://localhost:3000/live/control.html'
open -a 'TikTok LIVE Studio'
```

Sau đó: **kiểm tra cảnh → Go LIVE trong Studio → Kết nối TikTok trên controller → thử bình luận và nghe từ điện thoại**.

Tài liệu kỹ thuật để AI tiếp quản: [van-hanh.md](van-hanh.md).
