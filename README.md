# Flood Alert Dashboard

Ứng dụng React + TypeScript + Vite theo dõi dòng chảy và ước tính rủi ro lũ theo vị trí.

## Chạy

```bash
npm ci
npm run dev
npm run test
npm run lint
npm run build
```

Không cần API key. Frontend gọi trực tiếp Open-Meteo Flood API và Geocoding API.

## Chức năng

- Tìm địa điểm, nhập tọa độ hoặc dùng Geolocation sau thao tác người dùng; lỗi permission/timeout được hiển thị rõ.
- Lưu nhiều điểm theo dõi trong localStorage; đổi tên, chọn mặc định, xóa và bật/tắt thông báo theo điểm.
- Dữ liệu lưu lượng sông 7 ngày từ Open-Meteo, loading/error/empty/stale states và polling tự hủy khi unmount.
- Bản đồ Leaflet/OpenStreetMap với marker an toàn, popup và trạng thái theo rủi ro.
- Xu hướng forecast bằng SVG nhẹ, không phụ thuộc Recharts.
- Notification API + Service Worker, permission chỉ sau thao tác người dùng, cooldown và escalation dedupe.
- TypeScript strict, Zod schema validation, AbortController, timeout HTTP và test domain/API/UI/storage/notification.

## Rủi ro và giới hạn

Các mức `Bình thường / Theo dõi / Cảnh báo / Nguy hiểm` là **ước tính tham khảo**, không phải cảnh báo chính thức. Khi không có ngưỡng thủy văn chính thức cho địa điểm, ứng dụng dùng phân vị của chuỗi dự báo trả về và gắn nhãn `estimated`. Không có dữ liệu được coi là **chưa xác định**, không phải an toàn.

Flood API dựa trên dữ liệu mô hình GloFAS và có độ phân giải không gian khoảng 5 km; kết quả có thể không đại diện cho một điểm cụ thể hoặc tình hình tại hiện trường. Người dùng phải tuân theo cảnh báo và hướng dẫn của cơ quan phòng chống thiên tai địa phương.

Thông báo nền yêu cầu secure context (HTTPS hoặc localhost). Quyền thông báo không được yêu cầu lúc khởi động.

Ứng dụng không lưu API key, mật khẩu hay dữ liệu nhạy cảm. localStorage chỉ chứa cấu hình điểm theo dõi do người dùng tạo.

## Nguồn và attribution

- Open-Meteo: https://open-meteo.com/
- Flood API: https://flood-api.open-meteo.com/v1/flood
- GloFAS: https://global-flood.emergency.copernicus.eu/
- OpenStreetMap: https://www.openstreetmap.org/copyright

## Kiến trúc

`features/flood` chứa API client, schema, model, classifier và hook fetching; `features/locations` chứa storage adapter; `features/notifications` chứa permission/cooldown; `components` chứa bản đồ; `lib` chứa constants và validation. Request được hủy bằng AbortController khi đổi điểm hoặc unmount.

CI dùng `npm ci` với `package-lock.json`, sau đó chạy lint, test và production build.
