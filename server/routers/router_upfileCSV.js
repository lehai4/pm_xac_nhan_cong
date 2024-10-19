const express = require("express");
const multer = require("multer");
const path = require("path");
const csv = require("csv-parser");
const fs = require("fs");
const chiTrongModel = require("../models/model_chi_trong.js"); // Import your model here

const router = express.Router();

// Set up multer for file upload
const upload = multer({
  dest: "uploads/", // Temporary storage for uploaded files
  fileFilter: (req, file, cb) => {
    const filetypes = /csv/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (extname) {
      return cb(null, true);
    } else {
      cb("Error: CSV Files Only!");
    }
  },
});

router.post("/", upload.single("file"), (req, res) => {
  const fileRows = [];

  // Open uploaded file
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      fileRows.push(row); // Push each row
    })
    .on("end", async () => {
      fs.unlinkSync(req.file.path); // Remove temp file

      try {
        // Insert each row into the database
        for (const row of fileRows) {
          await chiTrongModel.createChiTrong(row);
        }

        res
          .status(200)
          .json({ message: "CSV data has been added to the database!" });
      } catch (error) {
        res
          .status(500)
          .json({ error: `Error inserting data: ${error.message}` });
      }
    });
});

module.exports = router;
