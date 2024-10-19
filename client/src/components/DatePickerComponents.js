import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const SingleMonthPicker = ({ onChange }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleChange = (date) => {
    setSelectedDate(date);
    onChange(date);
  };

  return (
    <DatePicker
      selected={selectedDate}
      onChange={handleChange}
      dateFormat="MM/yyyy"
      showMonthYearPicker
      className="form-control single-month"
    />
  );
};

const RangeDateTimePicker = ({
  startDate: initialStartDate,
  endDate: initialEndDate,
  onChange,
}) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    setStartDate(initialStartDate ? new Date(initialStartDate) : null);
    setEndDate(initialEndDate ? new Date(initialEndDate) : null);
  }, [initialStartDate, initialEndDate]);

  const handleStartChange = (date) => {
    setStartDate(date);
    onChange([date, endDate]);
  };

  const handleEndChange = (date) => {
    setEndDate(date);
    onChange([startDate, date]);
  };

  return (
    <div className="d-flex">
      <DatePicker
        selected={startDate}
        onChange={handleStartChange}
        selectsStart
        startDate={startDate}
        endDate={endDate}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        timeCaption="Time"
        dateFormat="dd/MM/yyyy HH:mm"
        placeholderText="Ngày bắt đầu"
        className="form-control range-date-time"
      />
      <DatePicker
        selected={endDate}
        onChange={handleEndChange}
        selectsEnd
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        timeCaption="Time"
        dateFormat="dd/MM/yyyy HH:mm"
        placeholderText="Ngày kết thúc"
        className="form-control range-date-time"
      />
    </div>
  );
};

// const RangeDateTimePicker = ({
//   startDate: initialStartDate,
//   endDate: initialEndDate,
//   onChange,
// }) => {
//   const [startDate, setStartDate] = useState(initialStartDate);
//   const [endDate, setEndDate] = useState(initialEndDate);

//   useEffect(() => {
//     setStartDate(initialStartDate);
//     setEndDate(initialEndDate);
//   }, [initialStartDate, initialEndDate]);

//   const handleStartChange = (date) => {
//     setStartDate(date);
//     onChange([date, endDate]);
//   };

//   const handleEndChange = (date) => {
//     setEndDate(date);
//     onChange([startDate, date]);
//   };

//   return (
//     <div className="d-flex">
//       <DatePicker
//         selected={startDate}
//         onChange={handleStartChange}
//         selectsStart
//         startDate={startDate}
//         endDate={endDate}
//         showTimeSelect
//         timeFormat="HH:mm"
//         timeIntervals={15}
//         timeCaption="Time"
//         dateFormat="dd/MM/yyyy HH:mm"
//         placeholderText="Ngày bắt đầu"
//         className="form-control range-date-time"
//       />
//       <DatePicker
//         selected={endDate}
//         onChange={handleEndChange}
//         selectsEnd
//         startDate={startDate}
//         endDate={endDate}
//         minDate={startDate}
//         showTimeSelect
//         timeFormat="HH:mm"
//         timeIntervals={15}
//         timeCaption="Time"
//         dateFormat="dd/MM/yyyy HH:mm"
//         placeholderText="Ngày kết thúc"
//         className="form-control range-date-time"
//       />
//     </div>
//   );
// };
const SingleDatePicker = ({ onChange }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleChange = (date) => {
    setSelectedDate(date);
    onChange(date);
  };

  return (
    <DatePicker
      selected={selectedDate}
      onChange={handleChange}
      dateFormat="dd/MM/yyyy"
      className="form-control single-date"
    />
  );
};

export { SingleMonthPicker, RangeDateTimePicker, SingleDatePicker };
