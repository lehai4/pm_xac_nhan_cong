import React from "react";

function UserGuide() {
  return (
    <div>
      <h1>Hướng dẫn sử dụng</h1>
      <p>Đây là trang hướng dẫn sử dụng cho ứng dụng của chúng ta.</p>

      <div class="row">
        <div class="col-xl-12 col-xxl-12 d-flex">
          <div class="ratio ratio-16x9">
            <iframe
              src="https://www.youtube.com/embed/j9VLOXdx9VQ?si=nV6_x-dtr8s630AB"
              title="YouTube video"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserGuide;
