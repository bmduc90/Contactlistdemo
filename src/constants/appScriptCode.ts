export const DEFAULT_FOLDER_ID = '1IynnEuXISkogZT6vmbeEdgZLOy8p5Ouq';
export const DEFAULT_FOLDER_URL = `https://drive.google.com/drive/folders/${DEFAULT_FOLDER_ID}`;
export const DEFAULT_CAMPAIGN_TITLE = 'Tên giải - Email campaign';
export const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxl76xgXm-gpJXWJZOENthMe1Rf5yDgqjAl5vdm7UWucpMWYo-qIYSiIKQaF4GwaWla/exec';

// Thư mục đích Bước 2 (sinh ra file Google Sheet chứa 2 cột ID và image_url)
export const STEP2_TARGET_FOLDER_ID = '1tyK0Q71BIPG0KLu4i1giISCJ5zvKCE6O';
export const STEP2_TARGET_FOLDER_URL = `https://drive.google.com/drive/folders/${STEP2_TARGET_FOLDER_ID}`;

// Thư mục mẫu chứa ảnh demo
export const DEFAULT_IMAGE_FOLDER_ID = '1ddKeOm3m468O3aBUVGbBdZLkzhzEbnkX';
export const DEFAULT_IMAGE_FOLDER_URL = `https://drive.google.com/drive/folders/${DEFAULT_IMAGE_FOLDER_ID}`;

/**
 * GOOGLE APPS SCRIPT HỢP NHẤT (DÙNG CHO CẢ 3 BƯỚC)
 * - Bước 1: Tạo Google Sheet Contact List từ Excel & Lưu lịch sử
 * - Bước 2: Quét Google Drive Folder ảnh & Trích xuất 2 cột (ID, image_url)
 * - Bước 3: Export Contact List & Tự động bổ sung cột "img" vào Google Sheet Bước 1
 * - GET: Lấy danh sách lịch sử chiến dịch mới nhất
 */
export const APP_SCRIPT_SOURCE_CODE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - TẠO CONTACT LIST & TỰ ĐỘNG BỔ SUNG CỘT IMG
 * Script dùng chung duy nhất cho cả 3 bước của ứng dụng.
 * =========================================================================
 */

// Hàm tìm hoặc tạo Sheet ghi lịch sử tạo Contact List
function getOrCreateHistorySheet(folderId) {
  var ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    ss = null;
  }

  if (!ss) {
    var folder = DriveApp.getFolderById(folderId || "1IynnEuXISkogZT6vmbeEdgZLOy8p5Ouq");
    var files = folder.getFilesByName("Lich_Su_Email_Campaign");
    if (files.hasNext()) {
      ss = SpreadsheetApp.open(files.next());
    } else {
      ss = SpreadsheetApp.create("Lich_Su_Email_Campaign");
      var f = DriveApp.getFileById(ss.getId());
      folder.addFile(f);
      DriveApp.getRootFolder().removeFile(f);
    }
  }

  var historySheetName = "Lịch sử tạo Campaign";
  var sheet = ss.getSheetByName(historySheetName);
  if (!sheet) {
    sheet = ss.insertSheet(historySheetName, 0);
    var headers = [
      "STT",
      "Thời gian tạo",
      "Tên Email Campaign",
      "Tên file Google Sheet",
      "Số lượng liên hệ",
      "Link Google Sheet",
      "ID File"
    ];
    sheet.appendRow(headers);

    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#0f172a");
    headerRange.setFontColor("#ffffff");
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    sheet.setRowHeight(1, 36);
    sheet.setFrozenRows(1);

    sheet.setColumnWidth(1, 60);  // STT
    sheet.setColumnWidth(2, 160); // Thời gian
    sheet.setColumnWidth(3, 260); // Tên Campaign
    sheet.setColumnWidth(4, 300); // Tên file
    sheet.setColumnWidth(5, 130); // Số lượng
    sheet.setColumnWidth(6, 320); // Link Sheet
    sheet.setColumnWidth(7, 240); // ID File
  }
  return sheet;
}

// Đối soát mã ID với bản đồ ảnh (hỗ trợ exact, lowercase, uppercase, bỏ số 0 ở đầu, thêm số 0 ở đầu)
function findMatchedImageUrl(targetId, imageMap) {
  if (targetId === null || targetId === undefined) return "";
  var s = String(targetId).trim();
  if (!s) return "";
  if (imageMap[s]) return imageMap[s];
  if (imageMap[s.toLowerCase()]) return imageMap[s.toLowerCase()];
  if (imageMap[s.toUpperCase()]) return imageMap[s.toUpperCase()];

  var unp = s.replace(/^0+/, "");
  if (unp && imageMap[unp]) return imageMap[unp];
  if (unp && imageMap[unp.toLowerCase()]) return imageMap[unp.toLowerCase()];

  if (/^\\d+$/.test(s)) {
    var p2 = ("00" + s).slice(-2);
    if (imageMap[p2]) return imageMap[p2];
    var p3 = ("000" + s).slice(-3);
    if (imageMap[p3]) return imageMap[p3];
    var p4 = ("0000" + s).slice(-4);
    if (imageMap[p4]) return imageMap[p4];
    var p5 = ("00000" + s).slice(-5);
    if (imageMap[p5]) return imageMap[p5];
  }
  return "";
}

function doPost(e) {
  try {
    var contents = e.postData ? e.postData.contents : "{}";
    var payload = JSON.parse(contents);

    // =========================================================================
    // XỬ LÝ BƯỚC 3: EXPORT CONTACT LIST & TỰ ĐỘNG BỔ SUNG CỘT "img" VÀO SHEET BƯỚC 1
    // =========================================================================
    if (payload.action === "exportContactList" || payload.type === "export_contact_list" || payload.action === "mapImages") {
      var sourceFolderId = payload.sourceFolderId;
      var step1SheetId = payload.step1SheetId;
      var contacts = payload.contacts || [];
      var title = payload.title || "Email campaign";
      var folderId = payload.folderId || "1IynnEuXISkogZT6vmbeEdgZLOy8p5Ouq";

      if (!sourceFolderId) {
        throw new Error("Vui lòng cung cấp link hoặc ID thư mục ảnh Google Drive!");
      }

      var sourceFolder;
      try {
        sourceFolder = DriveApp.getFolderById(sourceFolderId);
      } catch (fErr) {
        throw new Error("Không thể mở thư mục ảnh Drive. Vui lòng đảm bảo đã chia sẻ 'Bất kỳ ai có liên kết đều có thể xem'!");
      }

      // 1. Quét tất cả file ảnh trong thư mục Drive
      var files = sourceFolder.getFiles();
      var imageMap = {};
      var totalImages = 0;
      var sampleImages = [];

      while (files.hasNext()) {
        var file = files.next();
        var mime = file.getMimeType();
        var name = file.getName();
        if (mime.indexOf("image/") === 0 || /\\.(jpe?g|png|webp|gif|bmp|heic)$/i.test(name)) {
          totalImages++;
          var idKey = name.replace(/\\.[^/.]+$/, "").trim();
          var directUrl = "https://lh3.googleusercontent.com/d/" + file.getId();

          imageMap[idKey] = directUrl;
          imageMap[idKey.toLowerCase()] = directUrl;
          imageMap[idKey.toUpperCase()] = directUrl;

          var unpadded = idKey.replace(/^0+/, "");
          if (unpadded && !imageMap[unpadded]) {
            imageMap[unpadded] = directUrl;
          }

          if (sampleImages.length < 20) {
            sampleImages.push({ id: idKey, imageUrl: directUrl });
          }
        }
      }

      var targetSpreadsheet = null;
      var targetSheet = null;
      var matchedCount = 0;
      var unmatchedCount = 0;
      var totalContactsCount = 0;

      // 2. Mở file Google Sheet đã tạo ở Bước 1 và bổ sung cột img
      if (step1SheetId) {
        try {
          targetSpreadsheet = SpreadsheetApp.openById(step1SheetId);
          targetSheet = targetSpreadsheet.getSheetByName("Contact List") || targetSpreadsheet.getActiveSheet();
        } catch (openErr) {
          targetSpreadsheet = null;
        }
      }

      if (targetSpreadsheet && targetSheet) {
        var lastRow = targetSheet.getLastRow();
        var lastCol = targetSheet.getLastColumn();
        var headers = lastCol > 0 ? targetSheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];

        var idCol = 1;
        var emailCol = -1;
        var imgCol = -1;

        for (var c = 0; c < headers.length; c++) {
          var hName = String(headers[c] || "").trim().toLowerCase();
          if (hName === "id" && idCol === 1) idCol = c + 1;
          if (hName === "email") emailCol = c + 1;
          if (hName === "img" || hName === "image" || hName === "image_url") imgCol = c + 1;
        }

        // Nếu chưa có cột img: Tự động chèn cột img mới sau cột Email hoặc ở cuối
        if (imgCol === -1) {
          if (emailCol > 0 && emailCol < lastCol) {
            targetSheet.insertColumnAfter(emailCol);
            imgCol = emailCol + 1;
          } else {
            imgCol = lastCol + 1;
          }
          var headerCell = targetSheet.getRange(1, imgCol);
          headerCell.setValue("img")
            .setFontWeight("bold")
            .setBackground("#0f172a")
            .setFontColor("#ffffff")
            .setHorizontalAlignment("center")
            .setVerticalAlignment("middle");
        }

        totalContactsCount = Math.max(0, lastRow - 1);

        if (lastRow >= 2) {
          var idValues = targetSheet.getRange(2, idCol, lastRow - 1, 1).getValues();
          var imgColValues = [];

          for (var r = 0; r < idValues.length; r++) {
            var rawId = idValues[r][0];
            var imgUrl = findMatchedImageUrl(rawId, imageMap);
            if (imgUrl) {
              matchedCount++;
            } else {
              unmatchedCount++;
            }
            imgColValues.push([imgUrl]);
          }

          var imgRange = targetSheet.getRange(2, imgCol, imgColValues.length, 1);
          imgRange.setValues(imgColValues);
          imgRange.setHorizontalAlignment("left");
          targetSheet.setColumnWidth(imgCol, 320);
        }
      } else {
        // NẾU CHƯA CÓ FILE BƯỚC 1 -> TẠO FILE MỚI ĐẦY ĐỦ CỘT IMG
        var targetFolder;
        try {
          targetFolder = DriveApp.getFolderById(folderId);
        } catch (fErr2) {
          targetFolder = DriveApp.getRootFolder();
        }

        var timeZone = Session.getScriptTimeZone() || "GMT+7";
        var timestampStr = Utilities.formatDate(new Date(), timeZone, "yyyy-MM-dd_HH:mm");
        var createdAtDisplay = Utilities.formatDate(new Date(), timeZone, "yyyy-MM-dd HH:mm:ss");
        var fileName = title + " - Contact List (With Images) - " + timestampStr;

        targetSpreadsheet = SpreadsheetApp.create(fileName);
        targetSheet = targetSpreadsheet.getActiveSheet();
        targetSheet.setName("Contact List");

        var newHeaders = ["ID", "Name", "Email", "img", "Status", "Imported At"];
        targetSheet.appendRow(newHeaders);

        var headerRange = targetSheet.getRange(1, 1, 1, newHeaders.length);
        headerRange.setFontWeight("bold");
        headerRange.setBackground("#0f172a");
        headerRange.setFontColor("#ffffff");
        headerRange.setHorizontalAlignment("center");
        headerRange.setVerticalAlignment("middle");
        targetSheet.setRowHeight(1, 36);

        totalContactsCount = contacts.length;
        if (contacts.length > 0) {
          var dataRows = contacts.map(function(item) {
            var imgUrl = findMatchedImageUrl(item.id, imageMap);
            if (imgUrl) matchedCount++; else unmatchedCount++;
            return [
              item.id !== undefined && item.id !== null ? String(item.id) : "",
              item.name || "",
              item.email || "",
              imgUrl,
              item.status || "Hợp lệ",
              createdAtDisplay
            ];
          });

          var dataRange = targetSheet.getRange(2, 1, dataRows.length, newHeaders.length);
          dataRange.setValues(dataRows);
          targetSheet.getRange(2, 1, dataRows.length, 1).setHorizontalAlignment("center");
          targetSheet.getRange(2, 4, dataRows.length, 1).setHorizontalAlignment("left");
          targetSheet.getRange(2, 5, dataRows.length, 1).setHorizontalAlignment("center");
          targetSheet.getRange(2, 6, dataRows.length, 1).setHorizontalAlignment("center");
        }

        targetSheet.setColumnWidth(1, 140);
        targetSheet.setColumnWidth(2, 200);
        targetSheet.setColumnWidth(3, 250);
        targetSheet.setColumnWidth(4, 320);
        targetSheet.setFrozenRows(1);

        var newFile = DriveApp.getFileById(targetSpreadsheet.getId());
        if (typeof newFile.moveTo === "function") {
          newFile.moveTo(targetFolder);
        } else {
          targetFolder.addFile(newFile);
          DriveApp.getRootFolder().removeFile(newFile);
        }
      }

      var exportResponse = {
        success: true,
        action: "exportContactList",
        message: "Đã map ID và tự động bổ sung cột img vào Google Sheet thành công!",
        sheetId: targetSpreadsheet.getId(),
        sheetUrl: targetSpreadsheet.getUrl(),
        title: targetSpreadsheet.getName(),
        totalContacts: totalContactsCount,
        matchedCount: matchedCount,
        unmatchedCount: unmatchedCount,
        totalImagesFound: totalImages,
        sourceFolderId: sourceFolderId,
        targetFolderUrl: "https://drive.google.com/drive/folders/" + folderId,
        imageMap: imageMap
      };

      return ContentService.createTextOutput(JSON.stringify(exportResponse))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // =========================================================================
    // XỬ LÝ BƯỚC 2: QUÉT ẢNH TỪ DRIVE FOLDER & TẠO SHEET (ID, image_url)
    // =========================================================================
    if (payload.action === "listImages" || payload.type === "step2_images") {
      var sourceFolderId = payload.sourceFolderId;
      var targetFolderId = payload.targetFolderId || "1tyK0Q71BIPG0KLu4i1giISCJ5zvKCE6O";
      var title = payload.title || "Image List";

      var sourceFolder;
      try {
        sourceFolder = DriveApp.getFolderById(sourceFolderId);
      } catch (fErr) {
        throw new Error("Không thể mở Folder ảnh Drive. Vui lòng kiểm tra quyền truy cập!");
      }

      var targetFolder;
      try {
        targetFolder = DriveApp.getFolderById(targetFolderId);
      } catch (tErr) {
        targetFolder = DriveApp.getRootFolder();
      }

      var sourceFolderName = sourceFolder.getName();
      var timeZone = Session.getScriptTimeZone() || "GMT+7";
      var timestampStr = Utilities.formatDate(new Date(), timeZone, "yyyy-MM-dd_HH:mm");
      var createdAtDisplay = Utilities.formatDate(new Date(), timeZone, "yyyy-MM-dd HH:mm:ss");
      var fileName = (title || sourceFolderName) + " - Image List - " + timestampStr;

      var spreadsheet = SpreadsheetApp.create(fileName);
      var sheet = spreadsheet.getActiveSheet();
      sheet.setName("Image List");

      var headers = ["ID", "image_url"];
      sheet.appendRow(headers);

      var headerRange = sheet.getRange(1, 1, 1, 2);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0f172a");
      headerRange.setFontColor("#ffffff");
      headerRange.setHorizontalAlignment("center");
      headerRange.setVerticalAlignment("middle");
      sheet.setRowHeight(1, 36);

      var files = sourceFolder.getFiles();
      var imageRows = [];
      var sampleItems = [];

      while (files.hasNext()) {
        var file = files.next();
        var mime = file.getMimeType();
        var name = file.getName();
        if (mime.indexOf("image/") === 0 || /\\.(jpe?g|png|webp|gif|bmp|heic)$/i.test(name)) {
          var idWithoutExtension = name.replace(/\\.[^/.]+$/, "");
          var directUrl = "https://lh3.googleusercontent.com/d/" + file.getId();
          imageRows.push([idWithoutExtension, directUrl]);

          if (sampleItems.length < 15) {
            sampleItems.push({ id: idWithoutExtension, imageUrl: directUrl });
          }
        }
      }

      imageRows.sort(function(a, b) {
        return String(a[0]).localeCompare(String(b[0]), undefined, { numeric: true, sensitivity: 'base' });
      });

      if (imageRows.length > 0) {
        var dataRange = sheet.getRange(2, 1, imageRows.length, 2);
        dataRange.setValues(imageRows);
        sheet.getRange(2, 1, imageRows.length, 1).setHorizontalAlignment("center");
      }

      sheet.setColumnWidth(1, 200);
      sheet.setColumnWidth(2, 450);
      sheet.setFrozenRows(1);

      var ssFile = DriveApp.getFileById(spreadsheet.getId());
      if (typeof ssFile.moveTo === "function") {
        ssFile.moveTo(targetFolder);
      } else {
        targetFolder.addFile(ssFile);
        DriveApp.getRootFolder().removeFile(ssFile);
      }

      var step2Result = {
        success: true,
        message: "Tạo Google Sheet danh sách ảnh thành công!",
        sheetId: spreadsheet.getId(),
        sheetUrl: spreadsheet.getUrl(),
        title: fileName,
        totalImages: imageRows.length,
        sampleImages: sampleItems,
        sourceFolderId: sourceFolderId,
        sourceFolderName: sourceFolderName,
        createdAt: createdAtDisplay,
        targetFolderId: targetFolderId,
        targetFolderUrl: "https://drive.google.com/drive/folders/" + targetFolderId
      };

      return ContentService.createTextOutput(JSON.stringify(step2Result))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // =========================================================================
    // XỬ LÝ BƯỚC 1: TẠO GOOGLE SHEET CONTACT LIST TỪ FILE EXCEL
    // =========================================================================
    var title = payload.title || "Email campaign";
    var folderId = payload.folderId || "1IynnEuXISkogZT6vmbeEdgZLOy8p5Ouq";
    var contacts = payload.contacts || [];

    var targetFolder;
    try {
      targetFolder = DriveApp.getFolderById(folderId);
    } catch (folderErr) {
      targetFolder = DriveApp.getRootFolder();
    }

    var timeZone = Session.getScriptTimeZone() || "GMT+7";
    var timestampStr = Utilities.formatDate(new Date(), timeZone, "yyyy-MM-dd_HH:mm");
    var createdAtDisplay = Utilities.formatDate(new Date(), timeZone, "yyyy-MM-dd HH:mm:ss");
    var fileName = title + " - " + timestampStr;

    var spreadsheet = SpreadsheetApp.create(fileName);
    var sheet = spreadsheet.getActiveSheet();
    sheet.setName("Contact List");

    var headers = ["ID", "Name", "Email", "Status", "Imported At"];
    sheet.appendRow(headers);

    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#0f172a");
    headerRange.setFontColor("#ffffff");
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    sheet.setRowHeight(1, 36);

    if (contacts.length > 0) {
      var importedAt = createdAtDisplay;
      var dataRows = contacts.map(function(item) {
        return [
          item.id !== undefined && item.id !== null ? String(item.id) : "",
          item.name || "",
          item.email || "",
          item.status || "Hợp lệ",
          importedAt
        ];
      });

      var dataRange = sheet.getRange(2, 1, dataRows.length, headers.length);
      dataRange.setValues(dataRows);

      sheet.getRange(2, 1, dataRows.length, 1).setHorizontalAlignment("center");
      sheet.getRange(2, 4, dataRows.length, 1).setHorizontalAlignment("center");
      sheet.getRange(2, 5, dataRows.length, 1).setHorizontalAlignment("center");
    }

    for (var col = 1; col <= headers.length; col++) {
      sheet.autoResizeColumn(col);
    }
    if (sheet.getColumnWidth(1) < 120) sheet.setColumnWidth(1, 140);
    if (sheet.getColumnWidth(2) < 180) sheet.setColumnWidth(2, 200);
    if (sheet.getColumnWidth(3) < 220) sheet.setColumnWidth(3, 250);
    if (sheet.getColumnWidth(4) < 220) sheet.setColumnWidth(4, 260);
    sheet.setFrozenRows(1);

    var file = DriveApp.getFileById(spreadsheet.getId());
    if (typeof file.moveTo === "function") {
      file.moveTo(targetFolder);
    } else {
      targetFolder.addFile(file);
      DriveApp.getRootFolder().removeFile(file);
    }

    // Ghi vào bảng lịch sử tạo Campaign
    try {
      var historySheet = getOrCreateHistorySheet(folderId);
      var nextIndex = historySheet.getLastRow();
      historySheet.appendRow([
        nextIndex,
        createdAtDisplay,
        title,
        fileName,
        contacts.length,
        spreadsheet.getUrl(),
        spreadsheet.getId()
      ]);
    } catch (historyErr) {
      Logger.log("Lỗi ghi lịch sử: " + historyErr.toString());
    }

    var result = {
      success: true,
      message: "Tạo Google Sheet thành công!",
      sheetId: spreadsheet.getId(),
      sheetUrl: spreadsheet.getUrl(),
      title: fileName,
      campaignTitle: title,
      totalContacts: contacts.length,
      createdAt: createdAtDisplay,
      folderId: folderId,
      folderUrl: "https://drive.google.com/drive/folders/" + folderId
    };

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    var errorResult = {
      success: false,
      message: "Lỗi xử lý: " + error.toString(),
      error: error.toString()
    };
    return ContentService.createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET: Lấy lịch sử chiến dịch mới nhất
function doGet(e) {
  try {
    var folderId = (e && e.parameter && e.parameter.folderId) ? e.parameter.folderId : "1IynnEuXISkogZT6vmbeEdgZLOy8p5Ouq";
    var historySheet = getOrCreateHistorySheet(folderId);
    var lastRow = historySheet.getLastRow();

    var historyList = [];
    if (lastRow > 1) {
      var values = historySheet.getRange(2, 1, lastRow - 1, 7).getValues();
      for (var i = values.length - 1; i >= 0; i--) {
        var row = values[i];
        if (row[2] || row[3]) {
          historyList.push({
            id: String(row[6] || "hist-" + i),
            sheetId: String(row[6] || ""),
            createdAt: row[1] ? String(row[1]) : "",
            title: String(row[2] || "Email campaign"),
            fileName: String(row[3] || ""),
            totalContacts: Number(row[4] || 0),
            sheetUrl: String(row[5] || "")
          });
        }
      }
    }

    var response = {
      status: "online",
      success: true,
      service: "Contact List Creator & History Tracker",
      total: historyList.length,
      history: historyList.slice(0, 30)
    };

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "online",
      success: false,
      error: err.toString(),
      history: []
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;
