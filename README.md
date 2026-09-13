# Flood Alert Dashboard

Ứng dụng React + TypeScript + Vite theo dõi dòng chảy và ước tính rủi ro lũ theo vị trí.

## Chạy

```bash
npm install
npm run dev
npm run test
npm run lint
npm run build
```

Không cần API key. Frontend gọi trực tiếp Open-Meteo Flood API và Geocoding API.

## Chức năng

- Tìm địa điểm, nhập tọa độ hoặc dùng Geolocation sau thao tác người dùng.
- Lưu nhiều điểm theo dõi trong localStorage; đổi tên, chọn, xóa và bật/tắt thông báo theo điểm.
- Dữ liệu lưu lượng sông 7 ngày từ Open-Meteo, trạng thái loading/error/empty và cập nhật tự động.
- Bản đồ Leaflet/OpenStreetMap với marker và popup theo trạng thái.
- Thông báo dùng Notification API và Service Worker, có cooldown/chống lặp.
- TypeScript strict, validation tọa độ, test cho domain logic và storage/notification.

## Rủi ro và giới hạn

Các mức `Bình thường / Theo dõi / Cảnh báo / Nguy hiểm` trong ứng dụng là **ước tính tham khảo**, không phải cảnh báo chính thức. Khi không có ngưỡng thủy văn chính thức cho địa điểm, ứng dụng dùng phân vị của chuỗi dự báo trả về và gắn nhãn `estimated`. Không có dữ liệu **không** được hiểu là an toàn.

Flood API dựa trên dữ liệu mô hình GloFAS và có độ phân giải không gian khoảng 5 km; kết quả có thể không đại diện cho một điểm cụ thể hoặc tình hình tại hiện trường. Người dùng phải tuân theo cảnh báo và hướng dẫn của cơ quan phòng chống thiên tai địa phương.

Ứng dụng không lưu API key, mật khẩu hay dữ liệu nhạy cảm. localStorage chỉ chứa cấu hình điểm theo dõi do người dùng tạo.

## Nguồn và attribution

- Open-Meteo: https://open-meteo.com/
- Flood API: https://flood-api.open-meteo.com/v1/flood
- GloFAS: https://global-flood.emergency.copernicus.eu/
- OpenStreetMap: https://www.openstreetmap.org/copyright

## Kiến trúc

`features/flood` chứa API client, model, classifier và hook fetching; `features/locations` chứa storage adapter; `features/notifications` chứa permission/cooldown; `components` chứa bản đồ; `lib` chứa constants và validation. Request được hủy bằng AbortController khi đổi điểm hoặc unmount.
