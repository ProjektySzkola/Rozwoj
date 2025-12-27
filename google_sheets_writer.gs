// Google Apps Script for writing data to Google Sheets
// Deploy as Web App with "Execute as me" and "Anyone can access" permissions

const SPREADSHEET_ID = '12oSSKhhbpV85d_rRQ1hUZU5KTRLPOT0SqxC1sdcNXAM';

/**
 * GŁÓWNE FUNKCJE OBSŁUGI (API)
 */

function doGet(e) {
  const params = e.parameter;
  const action = params.action;
  const callback = params.callback;
  
  let result;
  try {
    switch (action) {
      case 'updateRange': 
        // POPRAWKA: Bezpieczne parsowanie JSON
        let values = [];
        try {
          values = params.values ? JSON.parse(params.values) : [];
        } catch (jsonError) {
          throw new Error("Błąd parsowania parametru 'values': " + jsonError.message);
        }
        result = handleUpdateRangeCore(params.spreadsheetId || SPREADSHEET_ID, params.range, values); 
        break;
        
      case 'updateCell': 
        result = handleUpdateCellCore(params.spreadsheetId || SPREADSHEET_ID, params.range, params.value); 
        break;
        
      case 'updateMatchAssignment': 
        result = updateMatchAssignment(params); 
        break;
        
      default: 
        result = { success: false, error: 'Nieznana akcja: ' + action };
    }
  } catch (err) {
    result = { success: false, error: err.toString() };
  }

  // Zwracanie odpowiedzi w formacie JSONP
  if (callback) {
    const output = callback + '(' + JSON.stringify(result) + ')';
    return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    let result;
    
    switch (action) {
      case 'updateRange': result = handleUpdateRangeCore(data.spreadsheetId || SPREADSHEET_ID, data.range, data.values); break;
      case 'appendRow': result = handleAppendRowCore(data.spreadsheetId || SPREADSHEET_ID, data.sheetName, data.values); break;
      case 'updateRow': result = handleUpdateRowCore(data.spreadsheetId || SPREADSHEET_ID, data.sheetName, data.rowIndex, data.values); break;
      case 'clearRange': result = handleClearRangeCore(data.spreadsheetId || SPREADSHEET_ID, data.range); break;
      default: result = { success: false, error: 'Unknown action: ' + action };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * FUNKCJE CORE (LOGIKA ZAPISU)
 */

function handleUpdateCellCore(spreadsheetId, range, value) {
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const parts = range.split('!');
    const sheet = spreadsheet.getSheetByName(parts[0]);
    if (!sheet) return { success: false, error: 'Sheet not found: ' + parts[0] };
    
    sheet.getRange(parts[1]).setValue(value);
    return { success: true, message: 'Cell updated', newValue: value };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function handleUpdateRangeCore(spreadsheetId, range, values) {
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheetName = range.split('!')[0];
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: 'Sheet not found: ' + sheetName };
    
    const rangeObj = sheet.getRange(range);
    const startRow = rangeObj.getRow();

    // POPRAWKA: Zabezpieczenie przed błędem przy pustych arkuszach
    const lastRow = sheet.getLastRow();
    
    // Logika czyszczenia: jeśli aktualizujemy od 1. wiersza w dół, czyścimy "całą resztę" (Sync mode)
    // UWAGA: To wciąż ryzykowne przy wielu użytkownikach (Lost Update), ale wymagane przez obecną logikę frontendu.
    if (startRow === 1 && rangeObj.getNumRows() > 1) {
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn() || 1).clearContent();
      }
    } else {
      rangeObj.clearContent();
    }

    if (values && values.length > 0) {
      sheet.getRange(startRow, 1, values.length, values[0].length).setValues(values);
      return { success: true, rowsUpdated: values.length };
    }
    return { success: true, message: 'Range cleared' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function handleAppendRowCore(spreadsheetId, sheetName, values) {
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: 'Sheet not found' };
    
    if (values && values.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, values.length, values[0].length).setValues(values);
      return { success: true, rowsAdded: values.length };
    }
    return { success: false, error: 'No data to append' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function handleUpdateRowCore(spreadsheetId, sheetName, rowIndex, values) {
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: 'Sheet not found' };
    
    const values2D = Array.isArray(values[0]) ? values : [values];
    sheet.getRange(rowIndex, 1, 1, values2D[0].length).setValues(values2D);
    return { success: true, rowIndex: rowIndex };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function handleClearRangeCore(spreadsheetId, range) {
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    spreadsheet.getSheetByName(range.split('!')[0]).getRange(range).clearContent();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * FUNKCJA AKTUALIZACJI MECZÓW (POPRAWIONA)
 */
function updateMatchAssignment(params) {
  try {
    const { matchId, sport, date, time, pitch } = params;
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Mapowanie nazw arkuszy
    const sheetMap = {
      'basketball': 'matches_basketball',
      'football': 'matches_football',
      'volleyball': 'matches_volleyball'
    };
    // Fallback do "matches_SPORT" jeśli klucz nie istnieje
    const sheetName = sheetMap[sport] || ('matches_' + sport);
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) return { success: false, error: 'Arkusz ' + sheetName + ' nie istnieje.' };
    
    const data = sheet.getDataRange().getValues();
    if (data.length === 0) return { success: false, error: 'Arkusz jest pusty.' };

    // POPRAWKA: Normalizacja nagłówków do małych liter dla pewności
    const headers = data[0].map(h => String(h).toLowerCase().trim());
    
    // POPRAWKA: Elastyczne szukanie indeksów kolumn (obsługa nazw angielskich i polskich)
    const colIdx = {
      id: headers.findIndex(h => h.includes('match_id') || h === 'id'),
      date: headers.findIndex(h => h.includes('date') || h === 'data'),
      time: headers.findIndex(h => h.includes('time') || h === 'czas' || h === 'godzina'),
      place: headers.findIndex(h => h.includes('place') || h === 'miejsce' || h === 'boisko')
    };
    
    if (colIdx.id === -1) return { success: false, error: 'Nie znaleziono kolumny ID (match_id/id) w arkuszu ' + sheetName };
    
    // Znajdź wiersz z danym matchId
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      // POPRAWKA: Konwersja obu stron do stringa przed porównaniem
      if (data[i][colIdx.id].toString() === matchId.toString()) {
        rowIndex = i + 1; // +1 bo w Sheets wiersze są od 1
        break;
      }
    }

    if (rowIndex === -1) return { success: false, error: 'Nie znaleziono meczu o ID: ' + matchId };

    // Aktualizuj tylko te kolumny, które istnieją w danym arkuszu
    if (colIdx.date !== -1 && date) sheet.getRange(rowIndex, colIdx.date + 1).setValue(date);
    if (colIdx.time !== -1 && time) sheet.getRange(rowIndex, colIdx.time + 1).setValue(time);
    if (colIdx.place !== -1 && pitch) sheet.getRange(rowIndex, colIdx.place + 1).setValue(pitch);
    
    return { 
      success: true, 
      message: `Zaktualizowano ${sport} (ID: ${matchId}): ${date}, ${time}, ${pitch}` 
    };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}