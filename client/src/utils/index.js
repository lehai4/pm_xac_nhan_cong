export const getDaysInMonth = (dateString) => {
  const [month, year] = dateString.split("-").map(Number); // Tách chuỗi và chuyển thành số
  return new Date(year, month, 0).getDate(); // Trả về số ngày của tháng
};
export const formatNumber = (number) =>
  new Intl.NumberFormat("en-US").format(number); // Create a reusable function
