# Bàn giao dự án Quán Nhậu Thanh Tịnh

Cập nhật ngày **03/11/2026**, giờ Việt Nam. Tài liệu này thay thế các ghi chép vận hành chánh điện trước đây. Trạng thái LIVE và kết nối là lần quan sát gần nhất, không bảo đảm tại thời điểm đọc; luôn kiểm tra lại trước khi thao tác.

## Trạng thái hiện tại và các phần đã hoàn thiện — 03/11/2026

Mục này là nguồn mô tả bản hiện tại, thay thế các quy tắc tương ứng trong phần bàn giao lịch sử bên dưới. Workspace hiện tại: `/Users/balance/Documents/quan-nhau-thanh-tinh`; Node **22.21.1**. Không suy ra trạng thái LIVE hoặc kết nối TikTok hiện tại từ những lần kiểm tra trước.

### Giao diện quán

- Overlay Canvas dọc **1080 × 1920**. Thu nhỏ banner, bàn và ghế; giữ **8 bàn × 10 ghế**, gồm 2 bàn VIP và 6 bàn bình dân.
- Menu nằm trong không gian quán, nền xanh mờ như bảng hướng dẫn. Có **15 món M01–M15, 10 bia B01–B10**, chuyển trang mỗi 12 giây; giá ghi đầy đủ `10xu`, `50xu`… Menu ở x35/y640, đã nâng 180px để chừa khoảng camera bên dưới, phía trên xe xúc xích.
- Bàn thường bày sẵn **3 món và bia**; bàn VIP **6 món, bia và xô lạnh**. Món khách gọi thêm tiếp tục hiện trên bàn trong 30 phút, tối đa 9 mục hiển thị gần nhất cùng phần bày sẵn.
- Thông báo món ở y300 và banner mời khách ở y360, phía trên mái nhà bên trái, tránh che khu bàn.
- Góc dưới menu là **xe nướng xúc xích** (`drawSausageCart`, x65/y1420): người đứng sau xe, kẹp đảo chuyển động, vỉ nướng, than hồng, khói nhẹ, khay món chín và gia vị.
- Đã sửa vùng cắt ảnh đầu bếp: ranh giới hàng cuối atlas ở y964 thay vì1024 trên ảnh1024×1536. Mũ, đầu và cổ hiển thị đầy đủ ở xe xúc xích và bếp chính; tránh lẫn mũ vào ảnh khách ngồi.
- Animation dùng lưới ảnh liền nhau 4×7 ô thay bản tách tay/chân: nhân vật bước khi di chuyển, nhún/đổi hướng khi nhảy; phục vụ giữ khay. Đây vẫn là biến dạng ảnh 2D với biên độ nhỏ, chưa phải bộ ảnh từng khung hình.

### Khách vào quán và gọi món

- **Bình luận chỉ tạo nhân vật vào hàng chờ**, không tự cấp ghế. Chat `nam` / `nữ` đổi nhân vật.
- Follow mới nhận trong phiên **hoặc tổng quà 10xu** cho quyền bàn bình dân; từ **100xu** lên VIP. Xu tính theo phiên, không lấy tổng ledger lịch sử để cấp hạng. Xu đã dùng mua món vẫn tính hạng bàn.
- Khi hết ghế, khách chờ theo hạng. Khách có ghế được giữ trong quán; khách chưa có ghế hết hoạt động 5 phút sẽ rời hàng chờ. Có mời bàn thủ công trong controller.
- Chat `gọi M04`, `goi B03` hoặc tên món chính xác để chọn món, không phân biệt dấu/hoa thường. Tên bia cần khớp khoảng trắng, ví dụ `bia 333`. Chọn mã mới thay lựa chọn đang chờ.
- Xu từ quà vào số dư; đủ xu và có ghế sẽ thanh toán món đã chọn, tối đa99 phần/lượt, giữ xu lẻ. Có thể gọi bằng số dư đã tặng trước đó. Chưa đủ xu/chưa có ghế sẽ báo trạng thái và giữ lựa chọn chờ.
- Quà **đơn giá1xu**, khi chưa chọn món, đổi thành số xúc xích tương ứng (không cộng phần xu đó vào số dư). Quà **đơn giá10xu**, khi chưa chọn món, mặc định gọi bia333/B03. Khi đã chọn món, quà dùng thanh toán món đó. Combo tính đơn giá × số lượng.
- Đơn từ20xu yêu cầu đọc tên/món khi bật đọc quà;50–99xu cả bàn nâng cốc;100–199xu pháo hoa; từ200xu chủ quán cảm ơn và pháo hoa. Hiệu ứng pháo hoa quà riêng >300xu vẫn giữ.

### Phục vụ giao món

- Sự kiện món mang `id`, `tableId`, `seatId`, loại món. Hàng đợi giữ các đơn liên tiếp, không để đơn mới cắt ngang đơn đang giao.
- Phục vụ mang hình món/bia, đi từ lối giữa tới vị trí phía trước/sau bàn tương ứng ghế gọi món, **dừng giao 1,6 giây**, rồi quay về; tổng8 giây/lượt.
- Đích giao lấy theo bàn/ghế đã ghi trong đơn. Đã sửa lỗi dùng ghế VIP mới của khách nhưng vẫn lấy tọa độ bàn cũ khi khách đổi hạng trong lúc giao.
- Đã thử mô phỏng giao bia tại **B1 / B1-0** trên overlay và kiểm thử tự động đích giao, thứ tự đơn, giữ bàn gọi khi khách chuyển VIP.

### Tim và nâng ly

- Thanh tiến độ ở góc trên trái **x120/y137**, hiển thị tổng tim / mốc kế tiếp **500 →1.000 →1.500…**.
- Phần tô **màu hồng** chạy theo từng chặng500 tim:200/500 =40%,400/500 =80%; đạt500 chuyển chặng kế tiếp;700/1.000 =40% của chặng500–1.000. Có chuyển động mượt khi cập nhật.
- Mỗi sự kiện `like` cập nhật thanh. Tim thật lấy số tăng thêm `likeCount`, không cộng lại `totalLikeCount`; lọc trùng `msgId` trong kết nối. Tổng `roomLikes` được checkpoint và khôi phục từ snapshot khi tải overlay.
- Mỗi500 tim mới, toàn bộ khách ngồi/chờ/nhảy nâng ly8 giây với câu **“Một, hai, ba… dô!”**. Một gói vượt nhiều mốc chỉ hô một lần cho mốc cao nhất.
- Tim mô phỏng đếm riêng, thanh có nhãn **Thử**; controller có nút Thử500 tim. Tải lại overlay hiển thị lại tổng tim thật từ snapshot.

### Sàn nhảy VIP

- Đã thay cơ chế karaoke sau30 phút bằng: **khách có ghế VIP ngồi đủ10 phút → nhảy một bài → về bàn cũ**. Thời gian bàn thường/hàng chờ không tính vào mốc VIP.
- Khách đủ điều kiện cùng lúc nhảy chung bài. Khách đủ điều kiện trong lúc bài đang chạy chờ bài tiếp theo.
- Giữ ghế khi khách nhảy; hết bài60 giây về đúng ghế cũ và bắt đầu lại mốc10 phút. Controller có kết thúc bài sớm và thử đủ10 phút riêng cho khách demo.
- Nhạc sàn `assets/music/dance-floor-v1.wav`:120BPM,60 giây,không lời,tự tạo. Khi nhảy dừng nhạc nền; hết bài khôi phục nhạc nền. Tải lại overlay giữa bài lấy đúng vị trí thời gian đang phát.

### Âm thanh và giọng đọc

- **Hai lời mời tự động định kỳ2/5 phút đã tắt**. Các file lời mời cũ bằng Linh còn trên đĩa không có nghĩa đang được phát.
- Âm thanh500 tim dùng bản ghép đã chọn **demo1+2+3**: `assets/room-cheers-mix-v2.wav`,8 giây; tiếng hô Việt chính, cụng ly từ2,8s và đám đông từ3,5s với âm lượng thấp. Nguồn và ghi chú quyền dùng: `assets/sfx/SOURCES.md`. Quyền thương mại nguồn TiếngĐộng chưa được xác minh.
- Controller có mục demo âm thanh, nghe riêng từng nguồn hoặc bản ghép; nghe bản mới dừng bản trước, có dừng tất cả.
- **Đã bỏ giọng Linh khỏi luồng đọc động**. Hoài My và Nam Minh đọc luân phiên từng câu; lựa chọn trong controller xác định giọng bắt đầu. Follow mới cảm ơn kèm tên; follow lặp trong phiên không đọc lại.
- `live/synthesize.py` dùng **edge-tts7.3.1**, thử tối đa4 lần khi dịch vụ trả rỗng/ngắt/chậm; từ lần2 dùng tốc độ/cao độ gốc nhưng giữ đúng giọng. Mỗi lần chờ tối đa28 giây; tiến trình tổng120 giây. Chỉ gửi MP3 hoàn chỉnh, xóa `.part` lỗi và giới hạn40 file TTS. Khi không có môi trường Python, server dùng thư viện Node `msedge-tts` sẵn có.
- Đã nhận âm thanh follow Hoài My30.816 bytes sau2 lần, quà Nam Minh32.976 bytes sau4 lần. Đã xác minh trình duyệt phát hết câu cảm ơn follow Minh bằng Nam Minh:4,2 giây, `ended=true`, `muted=false`, không lỗi.
- **Giới hạn còn tồn tại:** Edge TTS vẫn có câu thất bại sau4 lần; phụ thuộc dịch vụ ngoài và có thể chậm. Không coi đây là nguồn TTS được bảo đảm luôn hoạt động. Giọng đọc đã kiểm tra trên overlay local, chưa xác minh âm thanh tới thiết bị người xem LIVE.
- Trình duyệt cần bấm **Bật âm thanh** sau khi tải trang nếu autoplay bị chặn. Nguồn Studio có thể dùng `?autoplay=1`; vẫn phải kiểm tra âm thanh thực tế trong Studio.

### Controller và kiểm thử đã hoàn tất

- Các nút mô phỏng: bình luận, quà, follow, đổi giới tính, VIP đủ10 phút, kết thúc nhảy,500 tim, dọn riêng khách thử. Cùng tên demo giữ xu/follow giữa các lượt thử; bình luận sau reset không tự được ghế.
- Demo tự động UI tại `control.html#uiScenario`:12 bước với2 tên thử riêng, kiểm tra bình luận→hàng chờ→follow/quà→gọi món/bia→VIP→nhảy đủ60 giây→về ghế→500 tim. Mỗi bước đợi đúng trạng thái WebSocket và có thời gian quan sát; có dừng/dọn riêng khách thử.
- Đã chạy UI **12/12 bước**; riêng điều kiện chờ VIP10 phút được tua nhanh cho demo, không thay luật khách thật. Đã kiểm tra nhạc nhảy phát và dừng; dọn khách thử, không ghi quà mô phỏng vào ledger thật.
- Kết quả gần nhất: **34 kiểm thử Node đạt**, gồm animation, món/follow/VIP, checkpoint, tim và giao món; **2 kiểm thử Python đạt** cho thử lại TTS và không phát file dở. Đây là kết quả ở lần kiểm tra đã ghi, không thay cho kiểm tra sau mỗi thay đổi mới.
- Ảnh đối chiếu trong workspace: `ui-scenario-results.png`, `ui-scenario-cheers.png`, `live-menu-camera-space.png`, `live-chef-fixed.png`, `live-audio-verified.png`, `live-heart-progress.png`.

### Chạy và tiếp quản

```sh
cd /Users/balance/Documents/quan-nhau-thanh-tinh/live
/Users/balance/.nvm/versions/node/v22.21.1/bin/node server.mjs
```

- Controller: `http://localhost:3000/live/control.html`.
- Overlay: `http://localhost:3000/live/overlay.html?v=menu-1`.
- Chuẩn bị Python TTS khi chuyển máy: tạo môi trường `python3 -m venv live/.tts-venv` từ root project, rồi chạy `live/.tts-venv/bin/pip install -r live/tts-requirements.txt`. Môi trường này không đưa vào Git.
- Kiểm thử Node: từ thư mục `live`, chạy Node22 với `--test tests/*.test.mjs`. Kiểm thử TTS: từ root chạy `live/.tts-venv/bin/python -m unittest discover -s live/tests -p 'test_*.py'`.
- Checkpoint giữ số dư, món, follow, mốc VIP, ghế, khu nhảy, bài đang phát và tổng tim thật. **Giữ nguyên ledger/key/checkpoint**, không xóa dữ liệu để dọn demo; dùng nút dọn khách thử.
- Các ghi chép về đường dẫn `/Users/huyba/...`, karaoke và lời mời Linh ở phần sau là lịch sử. Chưa xác minh lại Studio/LIVE thật sau toàn bộ loạt cập nhật này; kiểm tra riêng khi phát.


## Trạng thái kết thúc gần nhất — 03/11/2026

Theo yêu cầu tắt LIVE và kill: đã xác nhận Studio ở màn tổng kết, thời lượng11 phút41 giây, nút Go LIVE và upload0kbps. LIVE đã kết thúc trước lúc kiểm tra. Đã gửi Ngắt TikTok để hủy retry, sau đó dừng server Node cổng3000 bằng SIGTERM; kiểm tra không còn tiến trình lắng nghe cổng3000. Giữ nguyên ledger, key và cấu hình. Lần sau cần khởi động server trước khi phát lại.

## Lần mở lại gần nhất — 03/11/2026 khoảng 02:39

Theo yêu cầu người dùng, đã khởi động lại server Node22 trên cổng3000 (trước đó không có tiến trình lắng nghe), mở Studio và phát lại cấu hình đã lưu. Nguồn Link vẫn `?autoplay=1&v=gender-guide-1`, sound/custom1080×1920/always active bật; camera nhỏ, micro đang mute theo trạng thái app. Đã xác nhận đồng hồ LIVE00:00:30, upload1682kbps, encoder30FPS, frame drops0, meter nhạc có tín hiệu. Bộ nhận TikTok kết nối thành công @hannie.l.lm.n bằng key local. Giữ checkpoint/quyền phiên; khách cũ hết hạn nên khôi phục0 khách. Chưa có bình luận/quà thật trong lần kiểm tra ban đầu. Ảnh: `live-mo-lai-2026-11-03.png`. Đây là trạng thái lúc kiểm tra, không bảo đảm LIVE vẫn đang chạy ở lần đọc sau.

Hướng dẫn tự thao tác cho chủ quán: [HUONG-DAN-MO-LIVE.md](HUONG-DAN-MO-LIVE.md).

## 1. Đọc nhanh để tiếp quản

- Workspace: `/Users/huyba/Documents/quán nhậu thanh tịnh`.
- Sản phẩm: cảnh quán nhậu sân vườn yên bình, dọc1080×1920, phát qua nguồn **Link** trong TikTok LIVE Studio. Người xem bình luận có nhân vật, tặng quà được xếp bàn và nhận hiệu ứng.
- Backend Node nhận sự kiện TikTok, quản lý khách/quà/ghế, tạo TTS và phát WebSocket. Overlay HTML Canvas vẽ cảnh/phát âm thanh. Controller HTML điều khiển tại máy.
- Tài khoản đã dùng: **@hannie.l.lm.n**. Đã kết nối bằng API key Euler riêng và nhận comment/quà thật.
- 8 bàn ×10 ghế: 6 bình dân, 2 VIP. Bàn thường9 món, VIP12 món. Không quay lại cảnh chùa hay bàn6 ghế.
- Lần quan sát gần nhất: Studio đang phát và đã hiện hướng dẫn chat nam/nữ, phụ bếp riêng, đồ ăn mới. Không suy ra phiên vẫn chạy khi AI tiếp theo bắt đầu.
- Nguồn Link gần nhất: `http://localhost:3000/live/overlay.html?autoplay=1&v=gender-guide-1`.
- Node đã dùng: **22.22.3**. Sửa HTML/ảnh không cần restart backend, nhưng **phải reload nguồn Link**; reload IAB không cập nhật Studio.
- **22/22 kiểm thử đạt** sau cập nhật hướng dẫn giới tính. Không dùng bot/quà giả trên LIVE thật nếu chưa được yêu cầu.
- Chưa hoàn thiện đọc comment theo giọng riêng và highlight người đang nói. TTS động đôi lúc lỗi dịch vụ.
- Các thay đổi chưa được commit trong quá trình làm việc này. Bảo toàn working tree và dữ liệu người dùng.

## 2. Quy tắc nghiệp vụ đã chốt

| Sự kiện | Hành vi |
| --- | --- |
| Bình luận bất kỳ, gồm hey | Tạo một nhân vật theo ID TikTok; chưa đủ điều kiện thì đứng hàng chờ |
| Người cũ bình luận tiếp | Cập nhật nhân vật cũ, hiện bong bóng, không tạo trùng |
| Chat nam | Đổi hình nam mặc đồ thường |
| Chat nữ hoặc nu | Đổi hình nữ mặc đồ thường |
| Tổng xu phiên10–99 | Đủ điều kiện bàn bình dân |
| Tổng xu phiên từ100 | Đủ điều kiện bàn VIP |
| Quà đơn giá1 xu | Một xúc xích ảo mỗi món; combo nhân số lượng; xu vẫn tính vào bàn |
| Bàn đúng hạng hết ghế | Chờ FIFO theo thứ tự đủ điều kiện, có chỗ tự vào |
| Nâng lên VIP | Trả ghế thường, nhận hoặc chờ ghế VIP |
| Một gift event đã kết thúc có tổng trên300 xu | Pháo hoa20 giây; đúng300 không kích hoạt |
| Quà pháo hoa tiếp theo | Tính lại20 giây từ món mới, không cộng thời gian vô hạn |
| Khách vừa được ghế hoặc nâng bàn | Banner tên/bàn8 giây, highlight nhân vật15 giây |
| Không bình luận/quà5 phút | Nhân vật off, trả ghế; quét mỗi15 giây |
| Mỗi2 phút | Mời tặng quà để vào bàn |
| Mỗi5 phút | Mời gọi món và gọi bia thoải mái |

Chi tiết cần giữ đúng:

- `sessionCoins` quyết định bàn; `coins`/ledger là tổng lịch sử. Không dùng tổng quà lịch sử để cấp hạng cho phiên mới. Phiên được checkpoint nên restart không đồng nghĩa phiên trắng.
- Pháo hoa xét một sự kiện quà đã chốt, có tính combo, không xét tổng xu tích lũy nhiều event.
- Không có sự kiện chính xác từng người rời LIVE. Timeout5 phút là dự phòng đã được người dùng chấp nhận; có thể dọn người xem im lặng. Like không gia hạn hiện diện.
- `joinOnEnter` mặc định tắt. Chỉ vào xem chưa tạo nhân vật; controller có thể bật tùy chọn này.
- Người hết hạn quay lại cùng phiên vẫn còn rewards trong `sessionRewards`. Off không xóa lịch sử quà.
- Lệnh nam/nữ giữ ID, ghế, xu, xúc xích, quyền mời. Đã kiểm thử cả hoa thường và Unicode tổ hợp, lưu qua restore.
- Parser giới tính vốn đã có: nữ/nu/chị/chi/gái/gai; nam/anh/trai; bà/ba/cô/co. Nhận câu tối đa3 từ, đúng từ khóa hoặc bắt đầu bằng từ khóa và khoảng trắng. Câu dài “Nam mô A Di Đà Phật” không bị nhận là nam. Alias cũ bà ánh xạ skin granny nhưng hiện vẽ đồ nữ thường.
- **80 là ghế bàn**. `MAX_SEATS=400`, `CAPS`, `seatMode` là logic số nhân vật cũ, không phải số ghế bàn hiện tại.

## 3. Kiến trúc và bản đồ file

| File | Vai trò |
| --- | --- |
| `live/server.mjs` | HTTP, WebSocket, TikTok adapter, phân ghế, quà, TTS, Euler, checkpoint |
| `live/overlay.html` | Canvas, di chuyển, bàn/đồ ăn, banner, nhạc, lời nhắc, pháo hoa |
| `live/control.html` | Kết nối, nhập key, settings, tìm khách/mời bàn, mô phỏng |
| `live/package.json`, `live/package-lock.json` | Dependencies và lệnh chạy/test |
| `live/tests/live.test.mjs` | Backend/adapter/ledger/ghế/manual/restore/Euler/giới tính |
| `live/tests/invitation.test.mjs` | Nhắc2/5 phút, pháo hoa300/301 và thời hạn20 giây |
| `live/tests/music.test.mjs` | Audio source và phục hồi nhạc |
| `assets/` | Nền, sprite, nhạc, lời mời thu sẵn |
| `assets/tavern-v2-prompts.md` | Prompt hình quán/nhân vật, gồm phụ bếp mới |
| `live/data/` | Dữ liệu vận hành riêng, không phục vụHTTP/Git |
| `live/tts/` | MP3 TTS tạm, dọn khi server khởi động |
| `ke-hoach-quan-nhau.md`, `kiem-tra-tiktok.md` | Kế hoạch/audit trước đây; đối chiếu mã hiện tại |
| `README.md`, `index.html` | Còn nội dung chánh điện cũ, không phải luồng LIVE hiện tại |

Không có framework frontend hay bước build; server phục vụ HTML/assets trực tiếp. Tên package `chanh-dien-live` và các biến/comment `prayer`, chant, mõ, bot lines còn là di sản cũ, không phải yêu cầu khôi phục chùa.

Luồng dữ liệu: connector CHAT/GIFT/MEMBER/LIKE → `eventUser`/`eventGift` → `onChat`/`onGift` → rewards và `rebalanceDining` → WebSocket → overlay/controller. Snapshot chứa cấu hình/phòng/khách và trạng thái kết nối; không chứa key. `/ws?role=control` nhận lệnh `{t:'ctl',cmd:...}`; overlay chỉ nghe.

Hàm quan trọng backend: `skinFromText`, `onChat`, `onGift`, `manualSeat`, `rebalanceDining`, `expireSeats`, `connectTikTok`, `saveRuntimeSession`, `restoreRuntimeSession`. Overlay: `kitchen`, `serverAt`, `drawServer`, `drawTable`, `dish`, `applyRoom`, `welcomeGuest`, `maybeInviteGuests`, `triggerGiftFireworks`, `drawGiftFireworks`, `playMusic`, `nextTrack`, `queueTTS`, `frame`.

## 4. Hình ảnh, bàn và nhân vật

- Canvas1080×1920, tự scale vừa màn hình; sân vườn chiều tối yên bình. Đã loại bàn trang trí khỏi nền để tránh nhầm bàn tương tác.
- V1/V2 gần bếp; B1…B6 ở3 hàng sau. `TABLES`/`DINING_SEATS` backend cấp tọa độ, hạng, ghế.
- x bàn305/775; y880 + hàng×180, scale tăng theo chiều sâu. Mỗi bàn5 ghế sau +5 ghế trước. Bàn đã kéo gần bếp hơn.
- Thường: gỗ, ghế đôn,9 món. VIP: xanh/viền vàng, ghế đệm, thảm/biển VIP, xô đá,12 món.
- Đồ ăn vẽ bằng Canvas trong `dish`/`drawTable`: nướng, xúc xích, salad, đậu, mực, cá, hải sản, lẩu, gà, nem rán, khoai chiên, nghêu. Xếp3 hàng, bia/nước chấm ở rìa.
- Bếp có nam bếp chính + nữ phụ bếp; phục vụ1 nam +1 nữ bưng khay đi lối giữa, lệch pha/làn.
- Khách mặc thường phục, có ảnh đứng/ngồi; nickname rút gọn ở ghế đông. Backend giới hạn tên18 ký tự nên banner cũng không khôi phục phần đã cắt.

| Asset hiện tại | Nội dung |
| --- | --- |
| `assets/garden-tavern-v2.png` | Nền sân vườn không bàn trang trí |
| `assets/tavern-people-v2.png` | Atlas2 cột×3 hàng: nam/nữ đứng, nam/nữ ngồi, bếp chính/phục vụ nữ |
| `assets/tavern-male-server-v1.png` | Phục vụ nam riêng |
| `assets/tavern-kitchen-helper-v1.png` | Phụ bếp nữ mũ trắng, tạp dề đỏ đất, tô trộn; không dùng chung hình chạy bàn |
| `assets/fx_petal.png` | Asset hiệu ứng còn sử dụng |

Sprite crop theo alpha lúc tải để thống nhất tỷ lệ. Ảnh tạo bằng built-in imagegen, copy vào repo và lưu prompt. Giữ ảnh cũ khi chưa được yêu cầu xóa; dùng tên phiên bản cho ảnh mới.

## 5. Âm thanh, nhắc định kỳ và hiệu ứng

- Mặc định Nam Minh `vi-VN-NamMinhNeural`, pitch-18Hz, rate-20%; có Hoài My. NhạcON, mõOFF, tự đọc kinhOFF; controller đã bỏ các nút chùa.
- Playlist `assets/music/music1.mp3`, `music2.mp3`; một audio DOM `backgroundMusic` và một MediaElementSource được tái sử dụng.
- Kiểm tra mỗi5 giây: resume audio context/pause, retry lỗi play, đổi bài nếu kẹt hơn15 giây. Gain nhạc0.5, khi đọc0.14, master0.9.
- IAB cần bấm bật âm thanh; Studio dùng `autoplay=1` và bật sound. Tránh bật tiếng nhiều overlay gây vọng.
- Quà/TTS xếp hàng, giảm nhạc lúc đọc. Banner quà cũng xếp hàng.
- Nhắc2 phút dùng `assets/table-invitation-v1.mp3`; gọi món5 phút dùng `assets/order-invitation-v2.mp3`.
- Hai lịch độc lập trong mỗi overlay, reload bắt đầu lại đồng hồ. Chữ theo lịch; tiếng chờ quà, mỗi loại tối đa1 lượt chờ.
- Giọng nhắc thu sẵn không đổi theo voice/pitch/rate controller. Tùy chọn giọng áp dụng TTS động/cảm ơn quà và thông báo nhập tay.
- Món được kể: gà nướng muối ớt, bò lúc lắc, mực nướng, tôm rang muối, ốc xào dừa, cá lóc nướng, nem chua rán, khoai tây chiên, lẩu hải sản. Bia: Sài Gòn,333,Tiger,Heineken,Larue,Hà Nội.
- Gọi món hiện là lời mời và bình luận, **chưa có hệ thống nhận đơn món/bia riêng**.
- Pháo hoa theo gift>300xu,20 giây, tối đa360 hạt, caption cảm ơn; chưa thêm tiếng pháo riêng.
- Welcome8 giây/highlight15 giây cho người vừa được ghế hoặc nâng bàn; snapshot reload không chào lại toàn bộ khách đã ngồi.

## 6. Controller và mời bàn thủ công

Mở `http://localhost:3000/live/control.html`.

- Kết nối username đang LIVE; Ngắt chỉ dừng bộ nhận sự kiện, không kết thúc Studio.
- Settings: title/subtitle, voice/pitch/rate, nhạc, joinOnEnter. Quy tắc quà/thời gian là thông tin đọc, không phải ô cấu hình động.
- Tìm nickname, bấm Bình dân/VIP để mời khách hiện có. `manualTier` lưu riêng; không cộng xu/xúc xích/ledger.
- Tự động bỏ quyền mời, xét lại xu. Không hạ VIP đã đạt bằng quà. Bàn đầy vẫn FIFO, không đuổi người khác.
- Mời bàn làm mới lastAt, báo kết quả, hiện nhãn chủ quán mời.
- Công cụ mô phỏng thu gọn: chat/gift/301xu/fill/tavernDemo/bots/clear có thể hiện lên LIVE. Không dùng tùy tiện trên phiên thật.

## 7. Dữ liệu phiên và bảo mật

| File | Nội dung |
| --- | --- |
| `live/data/gifts.jsonl` | Ledger quà thật append từng dòng; không xóa để làm sạch màn hình |
| `live/data/session-state.json` | Checkpoint version1 mỗi2 giây bằng temp+rename, lưu khách/rewards/ghế/manualTier/settings/account/thời gian |
| `live/data/euler-key.json` | Key riêng mode0600, không in nội dung khi audit |
| `live/tts/` | Audio tạm, không phải dữ liệu cần bảo toàn dài hạn |

Restore checkpoint hợp lệ không cũ quá24 giờ, vẫn áp timeout khách và đối chiếu delta ledger. Nếu checkpoint ghi account connected, server tự reconnect lúc khởi động. Phải tạo `wss` trước restore vì restore có broadcast; đã từng sửa lỗi thứ tự này.

Không có luồng reset phiên riêng được xác nhận. Nếu cần phiên trắng, thiết kế rõ reset rewards/viewers/settings nhưng giữ ledger. Không xóa file khi server đang ghi2 giây/lần; không coi restart hoặc clear là reset phiên an toàn khi chưa đọc code.

`.gitignore` loại `live/data/`, `live/tts/`, `node_modules/`, `.env*`, log. HTTP chặn data/dotfile/node_modules/mã server. Bind mặc định127.0.0.1, có kiểm tra Host/Origin; đây là công cụ local, không phải dashboard có đăng nhập để public Internet.

Không ghi key, cookie, mật khẩu, stream key vào tài liệu/log/ảnh/commit. Public state chỉ báo key đã cấu hình và nguồn. Bộ nhận không dùng mật khẩu/cookie TikTok.

## 8. TikTok và Euler: cách kết nối đã sửa

Dependencies: `tiktok-live-connector@2.5.0`, `msedge-tts@2.1.1`, `ws@8.18.0`; Node>=20.

```js
new TikTokLiveConnection(uniqueId, {
  enableExtendedGiftInfo: false,
  fetchRoomInfoOnConnect: false,
  processInitialData: false,
  ...(apiKey ? { signApiKey: apiKey } : {})
});
```

- Adapter proto/v3 lấy ID `user.id` và fallback; comment `content`/`comment`; quà `gift` và fallback; avatar urlList.
- Combo type1 chỉ xử lý khi repeatEnd; chống trùng common.msgId/messageId, tối đa2.000 ID mỗi kết nối.
- `connectionVersion` chặn sự kiện/kết quả kết nối cũ sau reconnect.
- Key ưu tiên `EULER_API_KEY` môi trường, rồi file local. Controller ô password lưu key/xóa input sau thành công; snapshot không trả key.
- Đổi key cần cập nhật `SignConfig.apiKey`, xóa `SignConfig.cachedInstance` tránh signer anonymous cache cũ.
- Đã lưu key người dùng cung cấp và kết nối thành công lúc01:39:34 ngày03/11/2026. Không chép giá trị key vào đây.
- Đã gặp rate_limit_account_minute/hour do nhiều lần mở kết nối. Nhánh catch khi connect nhận rate limit hiện báo `rate_limited`, dừng autoRetry. Lỗi khác backoff2/4/8/16/32/60 giây.
- Không bấm connect liên tục. Key riêng vẫn có quota; chờ reset hoặc kiểm tra dashboard, không tự mua gói/đổi tài khoản né giới hạn. Lưu key xong kết nối khi kênh đang LIVE.
- Không bật extended gift info nếu chưa kiểm tra yêu cầu dịch vụ. Lỗi Business plan trước đây không đồng nghĩa mọi kết nối cơ bản cần trả phí.

Nguồn chính thức đã tham khảo (kiểm tra lại nếu hỏi quota/gói hiện thời):

- https://www.eulerstream.com/docs/api/rate-limits
- https://www.eulerstream.com/docs/api-key-usage/nodejs
- https://www.eulerstream.com/docs/api/accounts

## 9. Lệnh chạy và kiểm thử

Kiểm tra cổng trước, không chạy thêm server chung dữ liệu:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

Khởi động:

```bash
cd '/Users/huyba/Documents/quán nhậu thanh tịnh/live'
/Users/huyba/.nvm/versions/node/v22.22.3/bin/node server.mjs
```

Nếu thiếu dependencies dùng Node>=20 và `npm ci` trong live/. Shell login từng chọn Node cũ gây lỗi cú pháp; kiểm tra node-v, không sửa mã để chiều Node lỗi thời. Agent có thể cần quyền ngoài sandbox để bind cổng.

- Controller: `http://localhost:3000/live/control.html`
- Preview: `http://localhost:3000/live/overlay.html`
- Studio: `http://localhost:3000/live/overlay.html?autoplay=1&v=gender-guide-1`
- WebSocket: `/ws`; controller role=control.

Từ gốc repo:

```bash
/Users/huyba/.nvm/versions/node/v22.22.3/bin/node --test live/tests/*.test.mjs
```

Lần gần nhất22/22 đạt. Test dùng mock/thư mục tạm, không mua quà hoặc gọi TikTok thật. Đã có integration manual seat ở server tạm3002; nếu làm lại phải tách dữ liệu/thư mục, không chỉ đổi PORT cùng checkout.

## 10. Vận hành LIVE Studio và cập nhật hình đang phát

Ứng dụng Mac: TikTok LIVE Studio, bundle `com.tiktok.livestudio.desktop`.

Cấu hình lần gần nhất: @hannie.l.lm.n; tiêu đề “Quán Nhậu Thanh Tịnh · Góc bình yên” (UI có thể cắt chữ), danh mục Music. Scene Screen + Camera, Link phủ1080×1920; Custom resolutionON, Turn on soundON, Always keep activeON. Camera nhỏ góc dưới phải; người dùng đã tự bật camera/micro, không áp lại ghi chép mic mute cũ. Nguồn OngChuMMO_Live cũ không phải nguồn chính. TikTok từng yêu cầu camera khi Go LIVE, cần kiểm tra thực tế.

### Sửa HTML/ảnh mà LIVE chưa đổi

1. Lưu file, reload preview và kiểm tra hình/console.
2. Double-click nguồn Link trong Studio.
3. Chờ modal tải preview rồi đọc lại UI: index element thay đổi khi preview nhúng xuất hiện. Không tái dùng index cũ.
4. Giữ autoplay=1, đổi tham số v sang phiên bản mới, bấm Apply. Không cần ngắt connector/dừng LIVE.
5. Xem screenshot khung Studio có thay đổi thật và giữ âm thanh nguồn bật. Reload IAB không reload Studio.
6. Nếu báo người dùng đổi app, đọc lại state trước khi thao tác, không bấm mù.

### Mở LIVE hoặc sửa backend

Kiểm tra server/controller/scene; khi được yêu cầu phát thì Go LIVE, kết nối username nếu chưa connected. Xác nhận đồng hồ, encoder/FPS, hình, meter, TikTok✓ và sự kiện thật. Không tự chat công khai, mua quà, bật bot để thử.

Studio phát video và backend nhận TikTok là hai luồng khác nhau. Dấu✓ không chứng minh video đang lên; Go LIVE không chứng minh comment đã vào backend. Có lần uploadUI=0kbps dù timer/encoder/chat đang chạy; chưa đối chiếu thiết bị xem thì không khẳng định chất lượng đầu ra.

Nếu cần restart, kiểm tra checkpoint mới và tránh gián đoạn không cần thiết. Tìm PID hiện tại, không dùng PID/session cũ. Checkpoint không đảm bảo nhận lại mọi quà xảy ra trong khoảng backend bị ngắt.

## 11. Bằng chứng và phần chưa hoàn thiện

Đã kiểm chứng:

- Comment thật hey tạo đúng một nhân vật; comment/quà thật vào controller/overlay sau sửa adapter.
- Key Euler riêng kết nối thành công; test private file/public state/redaction/rate limit đạt.
- Test ngưỡng quà, xúc xích, FIFO, manual seat, restore, nam/nữ giữ ghế và xu đạt.
- Test lịch2/5 phút và pháo hoa300không/301có/20giây đạt.
- Nhạc từng readyState4, không mute/pause, currentTime tăng, Studio có meter; chưa đối chiếu đầy đủ audio từ điện thoại người xem.
- Đã nhìn trực tiếp Studio thấy bàn9/12 món, phụ bếp mới, bảng nam/nữ sau Apply.
- Ảnh ở gốc repo: `live-studio-mon-an-moi.png`, `live-huong-dan-nam-nu.png`, `euler-key-ket-noi-thanh-cong.png`. Đây là ảnh lịch sử, không phải trạng thái hiện tại.

Chưa hoàn thiện hoặc giới hạn:

- **Chưa đọc comment theo giọng riêng từng người, chưa xếp lượt đọc và highlight người đang nói**. Highlight hiện tại là người vừa vào bàn.
- TTS động đôi lúc `Stream closed before synthesis completed (no turn.end received)`; sửa nhạc không đồng nghĩa sửa hết TTS.
- Chưa xác minh toàn bộ20 giây pháo hoa từ quà thật ở thiết bị người xem; có test logic và từng thấy quà lớn trong Studio, không coi đó là bằng chứng đầy đủ hiệu ứng.
- Chưa có kiểm chứng riêng từ người dùng thật cho từng lệnh nam/nữ sau lần thêm hướng dẫn; test backend đã đạt.
- Tên dài bị cắt18 ký tự; không xác nhận presence chính xác; còn legacy code/tên package/bot lines.
- TikTok từng hạn chế quà/hiển thị10 phút do nhận định nội dung tái sử dụng; đã báo người dùng, chưa kháng nghị. Không hứa đổi cảnh sẽ hết hạn chế, không quy mọi lỗi âm thanh/kết nối về thông báo này.
- Phiên iPad/LAN3001 trước đây đã hủy và hoàn tác. LIVE_INSTANCE/LAN_OVERLAY_HOST không phải tính năng hiện tại.

## 12. Tổng kết công việc đã làm

1. Chuyển chánh điện thành quán sân vườn, đồ thường, bàn/ghế tương tác và hàng chờ.
2. Chốt8 bàn×10 ghế, phân thường/VIP, xúc xích1xu, ngưỡng10/100 và FIFO.
3. Thêm bếp chính/phụ và phục vụ nam/nữ, kéo bàn gần bếp, bỏ bàn nền trang trí.
4. Thêm welcome tên, nhắc2/5 phút, menu món/bia, pháo hoa>300xu20giây và hướng dẫn.
5. Giữ timeout5 phút theo lựa chọn, cập nhật controller đúng mô hình quán.
6. Thêm mời bàn thủ công, checkpoint phiên và bảo toàn ledger.
7. Sửa nhạc, cấu hình Euler key riêng, ngừng retry liên tục khi rate limit.
8. Tăng món9/12, tạo phụ bếp riêng, Apply và xác minh trực tiếp Studio.
9. Kiểm tra lệnh nam/nữ có sẵn, thêm hướng dẫn và test hồi quy, tổng22 test đạt.
10. Viết lại tài liệu bàn giao này để loại cấu hình cũ mâu thuẫn.

## 13. Quy ước cho AI tiếp quản

- Ưu tiên yêu cầu mới của người dùng, đối chiếu code; tài liệu không cấp quyền tự phát/dừng LIVE, gửi chat hay chi tiền.
- Kiểm tra trạng thái hiện tại, không tin PID/số khách/ảnh cũ. Không reconnect liên tục hoặc restart cho thay đổi giao diện.
- Bảo toàn ledger/key/checkpoint/working tree. Không in secrets trong output.
- Phân biệt mock test, preview, khung Studio và kết quả phía người xem; báo đúng mức đã kiểm chứng.
- Đổi hình LIVE phải hoàn tất file + reload Link + kiểm tra screenshot.
- Cập nhật đúng mục tài liệu sau thay đổi lớn, không nối nhiều đoạn “mới nhất” mâu thuẫn.
