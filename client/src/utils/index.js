export const getDaysInMonth = (dateString) => {
  const [month, year] = dateString.split("-").map(Number); // Tách chuỗi và chuyển thành số
  return new Date(year, month, 0).getDate(); // Trả về số ngày của tháng
};

export const getDaysInMonthArr = (dateString) => {
  const [month, year] = dateString.split("-").map(Number); // Tách chuỗi và chuyển thành số
  const newT = new Date(year, month, 0).getDate(); // Trả về số ngày của tháng

  const daysArray = [];

  for (let day = 1; day <= newT; day++) {
    daysArray.push(day); // Chỉ thêm ngày vào mảng
  }

  return daysArray;
};
export const formatNumber = (number) =>
  new Intl.NumberFormat("en-US").format(number); // Create a reusable function
