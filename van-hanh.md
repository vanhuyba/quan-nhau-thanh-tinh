# Bàn giao dự án Quán Nhậu Thanh Tịnh

Cập nhật ngày **03/11/2026**, giờ Việt Nam. Tài liệu này thay thế các ghi chép vận hành chánh điện trước đây. Trạng thái LIVE và kết nối là lần quan sát gần nhất, không bảo đảm tại thời điểm đọc; luôn kiểm tra lại trước khi thao tác.

## Cập nhật menu và sàn nhảy VIP — 03/11/2026

- Thanh tim góc trên trái x120/y137: tổng tim/mốc kế tiếp500,1000,1500…; phần tô theo tiến độ của từng chặng500 tim, dữ liệu thật khôi phục từ snapshot. Tim mô phỏng có nhãn Thử. Phục vụ giữ tableId/seatId của đơn để tránh ghép bàn cũ với ghế VIP mới, mang đúng hình món/bia, dừng1.6 giây giao tại đích rồi quay về. Đã thử quà10xu giao bia B1/B1-0 trên overlay và mốc tim mô phỏng;34 kiểm thử Node đạt, gồm hồi quy đổi bàn và tiến độ500 tim.

- Sửa vùng cắt atlas nhân vật: ranh giới hàng đầu bếp ở y964 thay vì1024 (ảnh1024x1536), lấy đủ mũ/đầu/cổ và tránh lẫn mũ vào hàng khách ngồi. Đã xác minh đầu bếp xe xúc xích và bếp chính trên overlay, console không lỗi.

- Đọc quà/món/follow luân phiên Hoài My và Nam Minh, controller chọn giọng bắt đầu; bỏ Linh. Follow mới cảm ơn kèm tên, follow lặp không đọc lại. `synthesize.py` dùng edge-tts7.3.1 trong `live/.tts-venv`, thử tối đa4 lần khi dịch vụ trả rỗng/ngắt/chậm; từ lần2 dùng tốc độ/cao độ gốc cùng giọng. Mỗi lần tối đa28 giây; tổng120 giây. Chỉ gửi file MP3 hoàn chỉnh, xóa file .part lỗi, giới hạn40 file. Đã thử thật follow Hoài My30816 bytes sau2 lần và quà Nam Minh32976 bytes sau4 lần. Dịch vụ ngoài vẫn có thể chậm/lỗi; không bảo đảm tuyệt đối. Có2 kiểm thử Python về retry/file dở và32 kiểm thử Node. Xác minh trực tiếp overlay đọc follow Minh bằng Nam Minh: audio readyState4, ended=true, currentTime=duration=4.2s, muted=false, error=null. Vẫn ghi nhận một câu thử khác thất bại sau4 lần; chưa thể bảo đảm dịch vụ Edge luôn đáp ứng.

Bản hiện tại chạy tại workspace `/Users/balance/Documents/quan-nhau-thanh-tinh`, dùng Node22.21.1. Các đường dẫn huyba và trạng thái Studio bên dưới là lịch sử. Đã áp dụng backend lên localhost:3000; chưa phát LIVE hoặc xác minh quà/follow thật trong bản này.

- Nâng menu thêm180px Canvas để chừa khoảng camera bên dưới, phía trên xe xúc xích. Bàn thường bày sẵn3 món và bia; bàn VIP6 món, bia và xô lạnh. Món gọi thêm vẫn hiện trên bàn.
- Thu nhỏ banner/bàn/ghế. Menu là bảng gỗ Canvas trong sân quán ở x35/y640, nền rgba(20,35,29,.65) như bảng hướng dẫn, đổi trang món/bia mỗi12 giây; giá có hậu tố xu (10xu/50xu). Thông báo món ở y300 và banner mời bàn ở y360, bên trái trên mái nhà, tránh che bàn/khách và bảng hướng dẫn bên phải. Không còn khối menu HTML treo đầu màn hình. Phục vụ đi hai làn x657/693 trong lối giữa hai cột bàn; giao món dừng bên cạnh bàn, không đi xuyên mặt bàn. Giữ15 món M01–M15,10 bia B01–B10,8 bàn×10 ghế, VIP100xu.
- Chat `gọi M04` / `goi B03` hoặc tên món chính xác chọn món. Xu từ quà vào số dư; khi đủ tiền và có ghế, đổi số dư thành tối đa99 phần món đã chọn, giữ xu lẻ. Mỗi khách một lựa chọn đang chờ; gọi mã khác sẽ thay lựa chọn. Có thể gọi bằng số dư đã tặng. Xu đã chi vẫn tính hạng bàn trong phiên.
- Quà đơn giá1xu khi chưa chọn món đổi thành xúc xích (không cộng số dư mua món); đơn giá10xu chưa chọn món mặc định bia333. Khi đã chọn món, mọi quà đều thanh toán món đó. Combo nhân giá trị/số lượng. Món chưa có ghế giữ trong phần thưởng chờ khách vào bàn.
- Sự kiện follow mới nhận trong phiên hoặc tổng10xu cho quyền bàn thường. Follow lặp không tăng xu. Chưa xác minh được người đã follow từ trước; chủ quán có thể mời bàn thủ công.
- Món thực tế hiện trên bàn trong30 phút. Phục vụ đi đến bàn; đơn20xu trở lên thông báo tên bằng TTS khi bật đọc quà;50–99xu nâng cốc;100–199xu pháo hoa; từ200xu chủ quán cảm ơn và pháo hoa. Pháo hoa quà riêng >300xu vẫn giữ. Các khoảng giá được mở rộng liên tục để không bỏ sót tổng combo.
- Thay toàn bộ karaoke/30 phút bằng sàn nhảy: chỉ khách có ghế VIP ngồi đủ10 phút mới được lên nhảy. Mốc tính từ lúc nhận ghế VIP (không tính thời gian bàn thường hoặc hàng chờ). Các khách đủ điều kiện cùng lúc nhảy chung một bài; khách đủ điều kiện khi bài đang chạy đợi bài tiếp theo.
- Ghế VIP được giữ khi khách nhảy. Bài60 giây kết thúc thì khách về ghế cũ, mốc10 phút bắt đầu lại. Server quét sàn mỗi giây; controller có nút kết thúc bài sớm. Khách có ghế được giữ trong quán, khách chưa có ghế vẫn timeout5 phút.
- Nhạc sàn local tự tạo `assets/music/dance-floor-v1.wav`,120BPM/60 giây/không lời. Khi nhảy, overlay dừng nhạc nền, phát đúng một bài; sau đó khôi phục nhạc nền. Tải lại overlay giữa bài sẽ phát từ vị trí thời gian hiện tại. Nhân vật lắc lư/đổi hướng và sàn đổi màu. Chưa xác minh âm thanh từ thiết bị người xem LIVE.
- Checkpoint giữ số dư, món, follow, mốc VIP10 phút, khu nhảy và thời điểm bài đang phát. Ledger/key được giữ nguyên.29 kiểm thử gồm hồi quy và luồng mua món/follow/VIP nhảy rồi về ghế đạt sau cập nhật; kiểm tra lại khi sửa tiếp.
- Studio chưa được reload trong lần cập nhật này. Khi áp dụng lên nguồn Link, dùng `http://localhost:3000/live/overlay.html?autoplay=1&v=vip-dance-1` và kiểm tra trực tiếp Studio.

- Kiểm tra trực tiếp controller ngày03/11: khách mô phỏng QA Kiem Thu thử bình luận/nam/nữ,1xu xúc xích,follow vào B1,M04,10xu bia333,nâng VIP,đơn50/100/300xu,số dư1xu,V1-0 giữ qua nhảy và tự về sau60 giây; nút kết thúc sớm cũng về đúng ghế. Audio DOM readyState4,paused=false,currentTime tăng; dừng bài paused=true. Khách thử đã dọn riêng, không ghi ledger quà thật. TTS động tiếp tục lỗi stream/timeout; không coi phần đọc cảm ơn đã đạt.
- Mục mô phỏng controller có Thử follow,Thử VIP đủ10 phút (chỉ khách demo VIP),Dọn khách thử này (chỉ xóa demo đang chọn),giữ nguyên khách thật/ledger.

- Lời nhắc5 phút đổi sang hướng dẫn xem menu/chọn món nhậu và bia,chat gọi M04/B03,dùng xu dư hoặc tặng quà đủ xu. File mới `assets/order-invitation-v3.wav` tổng hợp bằng giọng Linh local; không phụ thuộc Edge TTS. Giọng khác bản Nam Minh cũ.
- Chat gọi món nhận mã hoặc tên chính xác,không phân biệt dấu/hoa thường (gọi khoai tây chiên / goi bia333 cần khoảng trắng như tên menu “bia 333”). Chưa đủ xu/có ghế sẽ báo trạng thái. Khi giao,sự kiện mang id khách/seatId; phục vụ theo hàng đợi8 giây/lượt,đi lối giữa rồi vòng phía trước/sau hàng ghế tới đúng khách. Đơn mới không ngắt đơn trước. Kiểm thử tự động tới đúng tọa độ ghế và thứ tự2 lượt giao đạt.

- Sửa mô phỏng: cùng tên giữ xu/follow qua các lần thử; bình luận không tự cấp ghế. Nút làm trống quán xóa phần thưởng khách demo/sim/preview để thử lại từ0,giữ phần thưởng khách thật và ledger. Dọn khách thử này dùng để reset riêng tên đang nhập.29 kiểm thử đạt,kể cả bình luận sau reset không có ghế.

- Giọng vui tự nhiên: mặc định Hoài My,cao độ+2Hz,tốc độ+8% thay Nam Minh-18Hz/-20%. Đã áp dụng setting phiên hiện tại. Hai lời mời dựng lại bằng Linh local195 từ/phút: table-invitation-v2.wav(15,6s),order-invitation-v4.wav(22,8s),lời văn thân mật cả nhà ơi/mời ăn ngon uống vui. TTS động vẫn phụ thuộc Edge; đổi tone không đồng nghĩa đã sửa lỗi stream của dịch vụ.

- Hai lời mời tự động2/5 phút đã tắt theo yêu cầu. Mỗi500 tim mới nhận từ connector (likeCount là số tăng thêm,không cộng totalLikeCount),backend phát roomCheers;cả khách ngồi/chờ/nhảy nâng ly8 giây,kèm câu “Một,hai,ba...dô!” và audio ngắn room-cheers-v1.wav. Mốc500/1000/1500…;một gói vượt nhiều mốc chỉ hô1 lần cho mốc cao nhất. Tim thật checkpoint trong roomLikes,lọc trùng msgId mỗi kết nối;tim thử đếm riêng. Controller có Thử500 tim.30 kiểm thử đạt.

- Controller thêm mục Demo âm thanh quán nhậu: hô123dzô TiếngĐộng,cụng ly/đám đông/không khí quán Mixkit và bản local hiện tại để đối chiếu. Trình phát trực tiếp nguồn công khai,preload none,chỉ phát tại controller,nghe1 bản dừng bản khác,có nút dừng tất cả. Chưa áp dụng nguồn ngoài lên overlay;TiếngĐộng chưa xác minh quyền dùng thương mại.

- Người dùng chọn ghép demo1+2+3 cho500 tim: file room-cheers-mix-v2.wav8 giây,tiếng hô Việt chính,cụng ly2,8s,đám đông3,5s âm lượng thấp. Đã thay đường dẫn hiệu ứng,thêm trình nghe bản ghép trong controller. Nguồn/ghi chú quyền dùng ở assets/sfx/SOURCES.md.

- Animation Canvas2D đã thay bản tách khớp bị đứt tay/chân bằng continuous skin mesh4×7 ô,chung đỉnh giữa tam giác,texture cache theo atlas. Biên độ nhỏ: nhún tối đa1,3% chiều cao,nghiêng tối đa0,025rad; tay/vai/hông/gối liền nhau. Phục vụ giữ khay,khách bước chuyển trọng tâm và nhún theo nhạc;không cộng offset gâytrôi.32 kiểm thử đạt (kiểm tra lưới không gập/đứt qua các pha,texturecache). Đã kiểm tra preview không lỗi console,dọn QA Smooth. Vẫn là biến dạng ảnh2D,cử động tiết chế,chưa có sprite đi/nhảy vẽ từng frame.

- Góc dưới menu đổi thành xe nướng xúc xích Canvas `drawSausageCart` tại x65/y1420: người đứng sau xe, kẹp đảo xúc xích chuyển động, vỉ nướng có than hồng và khói nhẹ, khay món chín và chai gia vị. Đã reload overlay, kiểm tra trực quan đúng vị trí và không có lỗi console.

- Controller có mục Demo tự động từng bước trên UI (`#uiScenario`):12 bước với2 tên sim riêng theo thời gian,bình luận/hàng chờ,follow,1xu/10xu,bia,món,VIP,nữ,nhảy trọn60s,về đúng ghế,500 tim. Mỗi bước đợi trạng tháiWebSocket đúng rồi nghỉ4 giây;có nút dừng và dọn riêng khách khi kết thúc. Mốc VIP10 phút được fast-forward riêng khách demo;không thay luật khách thật. Đã chạy trực tiếp hoàn tất12/12 bước,nhạc nhảy readyState4/pausedfalse,đã dọn2 khách;TTS động vẫn lỗi stream như cũ. Ảnh ui-scenario-results.png và ui-scenario-cheers.png.

Các mục bên dưới mô tả bản bàn giao trước nâng cấp; quy tắc menu/follow/timeout/karaoke ở mục này thay thế các quy tắc cũ tương ứng.

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
