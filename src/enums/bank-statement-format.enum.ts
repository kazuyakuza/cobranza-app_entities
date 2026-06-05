/**
 * Supported bank statement file formats.
 * Determines which parser to use for processing.
 */
export enum BankStatementFormat {
  PDF_TEXT = 'PDF_TEXT',
  PDF_TABLA = 'PDF_TABLA',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
  API = 'API',
}