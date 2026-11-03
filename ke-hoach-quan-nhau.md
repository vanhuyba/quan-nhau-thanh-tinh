# Kế hoạch: Quán nhậu Thanh Tịnh tương tác TikTok LIVE

Ngày lập: 02/11/2026. Phạm vi hiện tại: lập kế hoạch từ yêu cầu trong ảnh và mã nguồn hiện có; chưa triển khai hoặc thay đổi phiên LIVE.

## 1. Nền tảng hiện có

- `live/server.mjs`: nhận chat/quà/tim TikTok, quản lý người theo ID, chống trùng một số sự kiện quà, ghi lịch sử quà, tạo TTS và truyền WebSocket.
- `live/overlay.html`: canvas dọc 1080×1920, nhân vật đi đến chỗ ngồi, hiện tên/bong bóng, phát âm thanh tuần tự. Hiện là chánh điện với lưới bồ đoàn, chưa có bàn hoặc khu chờ.
- `live/control.html`: kết nối TikTok, thử chat/quà, cấu hình giọng và mô phỏng người xem.
- `live/tests/live.test.mjs`: kiểm tra sức chứa, quà, kết nối và hết hạn người ngồi.
- Hiện mọi bình luận đều tạo người và cho ngồi; quà cũng tạo người. Bình luận không được đọc. Giọng đang dùng chung toàn hệ thống; chưa có giọng riêng từng người.
- Người không tương tác 5 phút bị xóa. Tổng quà hiện được phục hồi từ ledger qua các lần chạy, nên không thể dùng trực tiếp làm điểm xét bàn theo phiên.
- Working tree đang có thay đổi sẵn trong server, overlay và test; triển khai phải giữ các thay đổi đó.

## 2. Quy tắc đề xuất để làm bản đầu

Các mục dưới đây là giả định đề xuất, chưa phải quy tắc đã được người dùng xác nhận. Ảnh ghi “trên 10 đến 100 xu”, vì vậy đúng 10 xu chưa đủ điều kiện.

| Sự kiện | Hành vi dự kiến |
|---|---|
| Bình luận đúng `hey` sau khi bỏ khoảng trắng và không phân biệt hoa/thường | Tạo một nhân vật, nickname TikTok trên đầu, đi từ cửa vào khu đón khách. Lặp lại không tạo thêm. |
| Quà | Cộng giá trị quà hợp lệ trong phiên: đơn giá xu × số lượng combo đã kết thúc. Lịch sử cũ vẫn lưu riêng. |
| Tổng phiên ≤10 xu | Ở khu đón khách, chưa có ghế bàn. |
| Tổng phiên >10 và ≤100 xu | Được xếp vào bàn bình dân. |
| Tổng phiên >100 xu | Được xếp vào bàn VIP; nếu đang ngồi bình dân thì chuyển hạng và trả ghế cũ. |
| Bàn của hạng tương ứng hết ghế | Đi đến khu chờ của hạng đó, hiện số thứ tự. Không tự chiếm ghế hoặc thay người đang ngồi. |
| Có ghế trống | Người đầu hàng tương ứng được giữ ghế ngay và đi vào; mỗi ghế chỉ thuộc một người. |
| Người đã ngồi bình luận | Xếp lượt đọc bằng giọng được gán cố định cho người đó trong phiên. Khi âm thanh thực sự bắt đầu mới hiện bong bóng và làm nổi bật người nói. |
| Nhiều người bình luận | Phát lần lượt, một người nói tại một thời điểm; giữ thứ tự các bình luận được chấp nhận. |

Đề xuất thêm: quà trước `hey` cũng tạo một nhân vật để người tặng không bị bỏ sót. Người chờ/chưa ngồi không được đọc comment. Khi tăng hạng VIP mà VIP đầy, người đó trả ghế bình dân và chờ VIP. Không tự hạ hạng trong phiên.

Phân biệt ID TikTok dùng chống trùng với nickname dùng hiển thị. Hai người trùng nickname vẫn có hai nhân vật. Nếu người đã rời quay lại, chỉ khôi phục một nhân vật và quyền lợi trong phiên; số thứ tự chờ lấy lại từ cuối hàng.

## 3. Thiết kế luồng và dữ liệu

Luồng nhân vật: `entering → lobby → walkingToSeat → seated`; khi hết ghế: `lobby → waiting → walkingToSeat → seated`; khi rời: `leaving → removed`. Chuyển VIP là một chuyển trạng thái riêng, không tạo bản sao nhân vật.

Server là nơi quyết định quyền ngồi, ghế và thứ tự chờ. Overlay chỉ vẽ và chạy chuyển động, không tự phân ghế. Giữ ghế khi bắt đầu đi để hai người không cùng nhận một ghế; chỉ mở đọc comment khi đã đến nơi. Với bản đầu, server dùng thời điểm đến dự kiến theo đường đi cố định, overlay dùng cùng thông số; không mở quyền gửi lệnh điều khiển cho overlay.

Dữ liệu cần thêm:

- Người: ID, nickname, hình, trạng thái, tổng xu phiên, hạng, tableId/seatId, thời điểm vào hàng, voiceId, lastAt.
- Bàn: ID, hạng, tọa độ, danh sách ghế và người sở hữu ghế.
- Hai hàng chờ độc lập: bình dân và VIP, FIFO theo thời điểm đủ điều kiện của hạng đó.
- Lượt nói: speechId, userId, nội dung, voiceId, thời điểm tạo, hạn sử dụng, trạng thái.
- Mã phiên: tách điểm phiên khỏi tổng lịch sử. Không tự cộng lịch sử quà cũ vào quyền VIP; không xóa ledger để bắt đầu phiên mới.

Snapshot WebSocket phải chứa cả người, bàn, ghế, hàng chờ và cấu hình để tải lại overlay không xáo ghế hoặc nhân đôi người. Reload overlay không phát lại comment đã đọc; có thể bỏ lượt đang phát khi mất kết nối để tránh phát lặp.

## 4. Giọng đọc và làm nổi bật người nói

- Bản đầu dùng hai giọng đang tích hợp: Nam Minh và Hoài My, phân luân phiên và giữ cố định trong phiên. Nhiều người có thể chung giọng; không suy đoán giới tính từ nickname. Controller cho phép đổi giọng từng người.
- Tách giai đoạn chuẩn bị file TTS khỏi phát âm thanh. Giữ speechId/userId qua toàn bộ luồng; không cho câu tạo file nhanh hơn vượt lên trước câu đã nhận trước đó.
- Mở rộng callback phát âm thanh hiện có: khi audio bắt đầu, bật bong bóng, viền sáng và nhãn “đang nói”; khi kết thúc/lỗi/timeout thì tắt. Nếu người rời trước lượt đọc, bỏ lượt đó.
- Dùng một bộ điều phối phát cho comment và lời cảm ơn quà. Quà được ưu tiên ở lượt kế tiếp, không cắt ngang câu đang đọc; giới hạn số lượt ưu tiên liên tục để comment không bị chờ vô hạn. Chế độ quán tắt đọc kinh tự động.
- Giới hạn đề xuất: 120 ký tự/comment; 1 lượt chờ/người; cooldown 5 giây; tối đa 30 lượt toàn hệ thống; bỏ lượt quá 60 giây. Khi đầy hàng đợi thì bỏ lượt mới và đếm trong controller. Không lặng lẽ thay câu cũ bằng câu mới.
- Có nút tạm dừng đọc, bỏ lượt hiện tại, xóa hàng đọc, tắt tiếng một người. Chuẩn hóa nội dung, bỏ link và lọc từ theo cấu hình trước TTS; vẫn escape XML và hiển thị văn bản an toàn như hiện có.

## 5. Bố cục và vận hành đề xuất

Giữ khung dọc 1080×1920: cửa vào ở dưới, khu chờ hai bên, bàn bình dân ở giữa, VIP phía trên. Chừa lối đi và khoảng trống cho nickname/bong bóng. Bản thử bắt đầu với 3 bàn bình dân ×4 ghế và 1 bàn VIP ×4 ghế; số bàn/ghế cấu hình được, không dùng mặc định 400 người của cảnh cũ.

Cần duyệt hình nền quán, bàn/ghế và nhân vật phù hợp. Bộ ảnh hiện tại là chánh điện; có thể tái sử dụng cơ chế chuyển động nhưng hình người đi bộ hiện chỉ có một số mẫu. Bản đầu chỉ dùng mẫu có đủ hoạt ảnh đi/ngồi; bổ sung hình sau khi chốt phong cách.

Controller bổ sung: ngưỡng xu, số bàn/ghế, danh sách người theo khu, hàng chờ, lượt đọc, giọng từng người, mời rời ghế, gán giọng, bắt đầu phiên mới và bộ tình huống mô phỏng. Thao tác bắt đầu phiên mới phải nêu rõ sẽ đặt lại quyền ngồi/điểm phiên; ledger lịch sử giữ nguyên.

Đề xuất giữ timeout tương tác 5 phút làm cấu hình ban đầu cho cả ghế và hàng chờ. Khi hết hạn phải trả ghế, xóa lượt đọc của người đó và gọi người kế tiếp; quyền theo xu phiên giữ đến khi kết thúc phiên. Đây là thời hạn tương tác, không phải bằng chứng người đó đã rời TikTok.

## 6. Thứ tự triển khai

1. **Chốt luật và bố cục:** ngưỡng xu, tính cộng dồn hay từng quà, số ghế, quy tắc lên VIP, giọng và timeout. Đầu ra: bảng luật và phác thảo cảnh.
2. **Quản lý người/bàn/hàng chờ:** tách logic khỏi `seat()` hiện tại; thêm điểm phiên, giữ ghế, lên hạng và snapshot. Kiểm thử độc lập trước khi thay giao diện.
3. **Overlay quán:** bàn/ghế/khu chờ, đường đi, số thứ tự, thứ tự vẽ trước/sau bàn, tải lại giữ đúng trạng thái. Dùng tài nguyên tạm để xác minh luồng trước khi hoàn thiện hình.
4. **Comment TTS:** giọng riêng, hàng đọc, đồng bộ bong bóng và highlight, xử lý lỗi/bỏ lượt, điều phối với đọc quà.
5. **Controller và tài nguyên hoàn chỉnh:** cấu hình, công cụ kiểm soát đọc, bộ giả lập, hình/âm thanh quán và hướng dẫn vận hành.
6. **Nghiệm thu:** chạy test và mô phỏng tải trên cổng thử riêng; kiểm tra nguồn overlay ở 1080×1920. Chỉ áp dụng vào phiên thật khi người dùng yêu cầu triển khai/phát thử.

Nên giữ cảnh chánh điện hiện tại làm phương án quay lại và xây chế độ quán riêng, tái sử dụng kết nối TikTok/TTS/ledger. Không thay trực tiếp cảnh đang vận hành trong giai đoạn thử.

## 7. Điều kiện nghiệm thu

- Gửi `hey` 10 lần cùng ID chỉ có một người; hai ID cùng nickname không bị gộp.
- Thử 10, 11, 100, 101 xu và nhiều quà nhỏ cộng dồn; điểm phiên tách biệt lịch sử cũ.
- Combo quà và sự kiện gửi lặp không cộng hai lần trong phạm vi nhận diện sự kiện; kiểm tra cả reconnect TikTok.
- Hai người cùng đủ điều kiện khi chỉ còn một ghế: một người giữ ghế, một người chờ; không trùng ghế.
- Trống ghế gọi đúng người đầu hàng; lên VIP trả ghế cũ và cập nhật hai hàng đúng thứ tự.
- Người đang đi/chờ không được đọc; người đã ngồi đọc đúng giọng được gán.
- 20 người cùng comment: không chồng tiếng, highlight/bong bóng đúng người và đúng lúc; hàng đợi có giới hạn.
- TTS lỗi, autoplay bị chặn, mất WebSocket, người rời giữa lượt: không kẹt hàng hoặc sáng mãi.
- Reload overlay giữ đúng bàn/ghế/thứ tự chờ và không đọc lại hàng comment cũ.
- Hết hạn tương tác trả ghế, xử lý lượt đọc và vẫn giữ quyền theo điểm phiên khi quay lại.
- Đo độ mượt với số người/ghế đã chốt trên máy phát; không suy ra khả năng chịu tải từ giới hạn 400 hiện có.

## 8. Các lựa chọn cần chốt trước khi viết logic chính

1. Giữ đúng ảnh là **11–100 bình dân, từ 101 VIP**, hay muốn **10–100**?
2. Xét **xu cộng dồn trong phiên** (đề xuất), **giá trị từng lần tặng**, hay **tổng lịch sử**?
3. Chấp nhận **2 giọng dùng chung, gán cố định từng người**, hay cần nhiều giọng khác biệt hơn?
4. Chốt số bàn/ghế và khi nâng VIP mà hết ghế: trả ghế bình dân để chờ (đề xuất) hay ngồi ghế cũ chờ chuyển?

Các mặc định khác đã được ghi rõ ở trên để có thể điều chỉnh khi duyệt kế hoạch.


## Cập nhật theo yêu cầu mới — 02/11/2026

Đã triển khai preview: bình luận bất kỳ tạo một người đứng xếp hàng; tổng xu trong lần chạy server từ 10 đến 99 vào bình dân, từ 100 vào VIP. Quà đơn giá 1 xu tặng 1 xúc xích/món (combo nhân số lượng). Xúc xích không trừ xu. Sáu bàn bình dân, hai bàn VIP, mỗi bàn bốn ghế; khi hết ghế chờ FIFO theo hạng. Lên VIP trả ghế bình dân; quyền phiên và xúc xích giữ khi người quay lại trong cùng lần chạy server, chưa lưu qua restart. Ledger quà thật giữ riêng. Có nút dựng cảnh mẫu trong controller. Comment TTS theo người chưa nằm trong lần triển khai này.


## Cập nhật giao diện — 03/11/2026

Thay toàn bộ nhân vật khách sang áo polo/sơ mi và quần jeans, có ảnh ngồi thật trên ghế. Nền v2 bỏ toàn bộ bàn ghế trang trí. Thêm đầu bếp/phục vụ di chuyển trong cửa bếp. Sáu bàn bình dân và hai bàn VIP, mỗi bàn sáu ghế, tổng 48 chỗ. VIP dùng ghế đệm xanh, viền vàng, runner xanh và món hải sản; bình dân dùng ghế gỗ, đồ nướng, rau và đậu phộng. Biển bàn được vẽ trước người xem để luôn đọc được. Cảnh mẫu mới có 54 khách: 48 ngồi và 6 chờ, không ghi quà giả vào ledger. 12 kiểm thử đạt gồm 6 ghế riêng biệt mỗi bàn và FIFO khi đầy 36 ghế bình dân/12 ghế VIP. Tài nguyên và prompt ở assets/tavern-v2-prompts.md.


## Nâng sức chứa mỗi bàn — 03/11/2026

Theo yêu cầu mới: mỗi bàn 10 khách, 5 ghế mỗi phía; 6 bàn bình dân (60 ghế), 2 bàn VIP (20 ghế), tổng 80 ghế. Preview mới có 86 khách, 80 ngồi và 6 chờ. Thay thế cấu hình 6 người/bàn ở ghi chép trước.


## Bố cục gần bếp và phục vụ — 03/11/2026

Đẩy toàn bộ bàn lên gần bếp 70px trong khung thiết kế 1080×1920; giữ lối giữa cho phục vụ bưng khay đi từ bếp tới các dãy bàn rồi quay lại. Bếp giữ đầu bếp chuyển động riêng. VIP có thảm xanh, biển khu vực, mặt bàn xanh đậm/viền vàng và ghế đệm; bình dân bàn/ghế gỗ. Bàn thường bày 5 đĩa gồm đồ nướng, xúc xích, rau, đậu, mực; VIP bày 6 đĩa gồm hải sản, lẩu, cá, mực, đồ nướng, rau cùng xô đá. Mỗi bàn giữ 10 ghế, tổng 80 ghế. Preview mô phỏng 86 người được dựng qua controller; không kết nối TikTok, không ghi quà mô phỏng vào ledger.


Thêm một phụ chạy bàn: tổng 2 nhân viên bưng khay trên sân, lệch nhau nửa chu kỳ và lệch làn trên lối giữa; đầu bếp vẫn làm việc riêng trong bếp.


Đội ngũ theo yêu cầu mới nhất: 2 người trong bếp (bếp chính nam, phụ bếp nữ), 2 người chạy bàn (1 nam, 1 nữ) bưng khay, có nhãn vai trò riêng. Phục vụ nam dùng asset tavern-male-server-v1.png; bếp và phục vụ không nằm trong 80 ghế khách.
