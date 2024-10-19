!function () {
  var form = document.querySelector(".needs-validation");

  var btnSubmit = document.querySelector('form button[type="submit"]');
  if (btnSubmit) {
    btnSubmit.addEventListener("click", function (event) {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      form.classList.add("was-validated");
    });
  }

  $("input.single-date").daterangepicker(
    {
      showDropdowns: true,
      minYear: 1901,
      autoApply: true,
      singleDatePicker: true,
      locale: {
        format: "DD/MM/YYYY",
      },
    },
    function (start, end, label) {
      // document.querySelector("input[name='daterange']").value = start.format('DD/MM/YYYY HH:mm') + " - " + end.format('DD/MM/YYYY HH:mm');
      // document.querySelector("input[name='daterange']").dispatchEvent(new Event('change', {
      //    'bubbles': true
    }
  );

  $("input.range-date-time").daterangepicker(
    {
      showDropdowns: true,
      minYear: 1901,
      autoApply: true,
      timePicker: true,
      timePicker24Hour: true,
      locale: {
        format: "DD/MM/YYYY HH:MM",
      },
    },
    function (start, end, label) {
      // document.querySelector("input[name='daterange']").value = start.format('DD/MM/YYYY HH:mm') + " - " + end.format('DD/MM/YYYY HH:mm');
      // document.querySelector("input[name='daterange']").dispatchEvent(new Event('change', {
      //    'bubbles': true
    }
  );

  $("input.single-month").daterangepicker(
    {
      showDropdowns: true,
      minYear: 1901,
      autoApply: true,
      singleDatePicker: true,
      locale: {
        format: "MM/YYYY",
      },
    },
    function (start, end, label) {
      // document.querySelector("input[name='daterange']").value = start.format('DD/MM/YYYY HH:mm') + " - " + end.format('DD/MM/YYYY HH:mm');
      // document.querySelector("input[name='daterange']").dispatchEvent(new Event('change', {
      //    'bubbles': true
    }
  );
};
