// components/StatCard.js
import React from "react";

function StatCard({ title, value, icon }) {
  return (
    <div className="col-sm-6">
      <div className="card">
        <div className="card-body">
          <div className="row">
            <div className="col mt-0">
              <h5 className="card-title">{title}</h5>
            </div>
            <div className="col-auto">
              <div className="stat text-primary">
                <i className="align-middle" data-feather={icon}></i>
              </div>
            </div>
          </div>
          <h1 className="mt-1 mb-3">{value}</h1>
        </div>
      </div>
    </div>
  );
}

export default StatCard;
