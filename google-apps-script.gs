// ============================================================
//  FITNESS CLUB FERNANDEZ — Google Apps Script
//  Guarda cada inscripcion en Google Sheets automaticamente
//
//  INSTRUCCIONES:
//  1. Ir a https://script.google.com
//  2. Crear nuevo proyecto, pegar TODO este codigo
//  3. Click en "Implementar" > "Nueva implementacion"
//  4. Tipo: "Aplicacion web"
//     - Ejecutar como: "Yo"
//     - Quien tiene acceso: "Cualquier usuario"
//  5. Click "Implementar" y copiar la URL generada
//  6. Pegar esa URL en main.js donde dice TU_URL_AQUI
// ============================================================

function doGet(e) {
  try {
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Inscripciones') || ss.insertSheet('Inscripciones');

    // Encabezados si la hoja esta vacia
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Fecha', 'Nombre', 'Apellido', 'Email', 'WhatsApp', 'Clase de interes']);
      sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    const p = e.parameter;
    sheet.appendRow([
      new Date().toLocaleString('es-ES', { timeZone: 'America/La_Paz' }),
      p.nombre   || '',
      p.apellido || '',
      p.email    || '',
      p.telefono || '',
      p.servicio || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', msg: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
