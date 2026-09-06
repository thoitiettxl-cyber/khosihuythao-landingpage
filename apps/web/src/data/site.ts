export const proofStats = [
  {
    value: "02",
    label: "Số điện thoại",
    detail: "Gọi máy hoặc nhắn Zalo",
  },
  {
    value: "HCM",
    label: "Kho Phú Định",
    detail: "119/16A Mễ Cốc",
  },
  {
    value: "VN",
    label: "Chành xe toàn quốc",
    detail: "Miễn phí giao ra chành",
  },
] as const;

export const benefits = [
  {
    title: "Gọi số trên trang",
    text: "Hai số điện thoại để gọi máy. Không tạo tài khoản, không điền form trên web.",
  },
  {
    title: "Có hình thì nhắn Zalo",
    text: "Cùng hai số đó trên Zalo để gửi ảnh lưỡi cắt, băng keo hoặc dụng cụ khi chưa nhớ tên hàng.",
  },
  {
    title: "Báo giá theo quy cách thật",
    text: "Nói đường kính, khổ băng, số lượng khi gọi. Trang không đoán tồn kho hay hiện giá bán.",
  },
  {
    title: "Lấy tại kho hoặc ra chành xe",
    text: "Nhận ở Phú Định sau khi xác nhận, hoặc kho giao miễn phí ra chành xe gửi tỉnh.",
  },
] as const;

export const orderSteps = [
  {
    number: "01",
    title: "Gọi hoặc nhắn Zalo",
    text: "Gọi máy, hoặc gửi hình sản phẩm qua một trong hai số Zalo trên trang.",
  },
  {
    number: "02",
    title: "Kiểm tra và báo giá",
    text: "Kho kiểm tra mặt hàng tại chỗ rồi báo giá theo quy cách thật.",
  },
  {
    number: "03",
    title: "Xác nhận nhận hàng",
    text: "Thống nhất đơn, nhận tại kho hoặc giao ra chành xe.",
  },
] as const;

export const tradeVoices = [
  {
    role: "Thợ cắt kính / gạch",
    context: "Lưỡi 105 mm",
    quote:
      "Gọi hoặc gửi hình lưỡi đang dùng, ghi đường kính. Kho đối chiếu mặt hàng tại chỗ rồi báo — không cần nhớ hết tên mã.",
  },
  {
    role: "Cửa hàng sơn sửa",
    context: "Băng che phủ, cọ lăn",
    quote:
      "Cần theo cuộn hoặc theo bộ. Nói khổ băng, loại cọ và số lượng để kho kiểm tra trước khi báo.",
  },
  {
    role: "Đội thi công",
    context: "Nhận kho hoặc chành xe",
    quote:
      "Lấy hàng tại Phú Định sau khi xác nhận, hoặc nhờ kho giao miễn phí ra chành xe gửi tỉnh. Liên hệ trước khi đến.",
  },
  {
    role: "Cửa hàng vật tư",
    context: "Mua sỉ theo thùng",
    quote:
      "Nói tên hàng, quy cách và số lượng. Trang không hiện tồn kho realtime — kho xác nhận đúng thời điểm đặt.",
  },
] as const;
