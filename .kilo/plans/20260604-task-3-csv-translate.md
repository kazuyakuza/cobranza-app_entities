# Task 3: Translate CSV Spanish Comments to English

## Overview
Translate every Spanish text in the `comments` column (5th column) of `.agent/project-info/entities-definition.csv` into English. Entity names, property names, type declarations, enum values, and identifier acronyms (CUIT, RUC, DNI, CBU) must remain unchanged.

## High-Level Approach
1. Open `.agent/project-info/entities-definition.csv` in a text editor.
2. Locate each row listed in the mapping below.
3. Replace the Spanish `comments` text with the English equivalent.
4. Preserve CSV quoting—multi-line comments are wrapped in double quotes (`"`). Do not break the quote block.
5. Do not translate identifiers or enum example values inside comments.
6. Save and verify the file still parses as valid CSV (same 306 lines, columns intact).

## Translation Mapping

### Company
| Property | Line | Current | Proposed |
|---|---|---|---|
| *(header)* | 2 | Empresa cliente del SaaS (el tenant principal) | SaaS client company (the main tenant) |
| name | 5 | Nombre comercial / fantaYesa | Trade name / brand name |
| business_name | 6 | Razón social | Legal business name |
| tax_id | 7 | CUIT / RUC / etc. | Tax ID (e.g., CUIT, RUC, etc.) |
| contact | 8 | Email o información de contacto que se mostrará al cliente final | Email or contact information to be displayed to the end client |
| phone | 9 | Teléfono de contacto | Contact phone |
| address | 10 | Dirección | Address |
| settings | 13 | Configuraciones generales de la company | General company settings |

### CompanyPlan
| Property | Line | Current | Proposed |
|---|---|---|---|
| *(header)* | 17 | Configuración de pricing (% de comisión, etc.) | Pricing configuration (% commission, etc.) |
| commission_rate | 20 | Ej: 0.085 = 8.5% (total) | E.g., 0.085 = 8.5% (total) |
| saas_percentage | 21 | Porcentaje que se queda la plataforma | Percentage retained by the platform |
| intermediary_percentage | 22 | Si hay intermediario | If there is an intermediary |
| valid_until | 26 | Null = indefinido | Null = undefined (no end date) |

### User
| Property | Line | Current | Proposed |
|---|---|---|---|
| *(header)* | 31 | Cualquier persona con cuenta en el sistema (Company users + futuros End Users con login) | Any person with an account in the system (Company users + future End Users with login) |
| email | 33 | Único a nivel global | Globally unique |
| password_updated_at | 35 | Fecha de último cambio de contraseña | Date of last password change |
| full_name | 36 | Opcional (puede completarse después) | Optional (can be completed later) |

### Role
| Property | Line | Current | Proposed |
|---|---|---|---|
| name | 46 | Ej: `company_admin`, `company_operator`, `end_user`, `super_admin` | E.g., `company_admin`, `company_operator`, `end_user`, `super_admin` |

### CompanyUser
| Property | Line | Current | Proposed |
|---|---|---|---|
| *(header)* | 50 | Relación many-to-many entre User y Company + rol específico dentro de la company | Many-to-many relationship between User and Company + specific role within the company |

### Client
| Property | Line | Current | Proposed |
|---|---|---|---|
| *(header)* | 59 | Cliente final / deudor de una Company | End client / debtor of a Company |
| client_code | 62 | Código único por Company (ej: `CLI-00042`) | Unique code per Company (e.g., `CLI-00042`) |
| full_name | 63 | Nombre completo del deudor | Full name of the debtor |
| email | 64 | Muy recomendado | Highly recommended |
| tax_id | 67 | DNI / CUIT del cliente final | National ID / Tax ID of the end client (e.g., DNI, CUIT) |
| extra_data | 68 | Campos personalizados (ej: `{ ""dni"": ""..."", ""categoria"": ""..."" }`) | Custom fields (e.g., `{ ""dni"": ""..."", ""category"": ""..."" }`) |
| notes | 70 | Notas internas | Internal notes |
| updated_by | 73 | ID del User que realizó la última modificación | ID of the User who made the last modification |

### Debt
| Property | Line | Current | Proposed |
|---|---|---|---|
| *(header)* | 75 | Deuda individual | Individual debt |
| debt_schedule_id | 79 | Referencia si la deuda fue generada automáticamente desde un schedule | Reference if the debt was automatically generated from a schedule |
| debt_code | 80 | Código legible (ej: `DEUD-2026-0042`) | Human-readable code (e.g., `DEUD-2026-0042`) |
| description | 81 | Concepto de la deuda | Debt concept / description |
| total_amount | 82 | Monto original | Original amount |
| due_date | 84 | Fecha de vencimiento | Due date |
| issue_date | 85 | Fecha de emisión | Issue date |
| daily_interest_rate | 86 | Tasa de interés diaria post-vencimiento (ej: 0.0050 = 0.5% diario). Null = sin interés | Daily interest rate after due date (e.g., 0.0050 = 0.5% daily). Null = no interest |
| invoice_template_id | 94 | Plantilla de factura/recibo a usar | Invoice/receipt template to use |

#### Debt.status — Multi-line (Lines 87–91)
- **Current**: `PENDING -> Deuda vigente, aún no vencida.\nOVERDUE -> Vencida y no pagada (se puede aplicar interés diario).\nPARTIALLY_PAID -> Pagada parcialmente.\nPAID -> Totalmente pagada.\nCANCELLED -> Anulada/cancelada por la Company.`
- **Proposed**: `PENDING -> Active debt, not yet overdue.\nOVERDUE -> Overdue and unpaid (daily interest may be applied).\nPARTIALLY_PAID -> Partially paid.\nPAID -> Fully paid.\nCANCELLED -> Voided/cancelled by the Company.`

### DebtSchedule
| Property | Line | Current | Proposed |
|---|---|---|---|
| *(header)* | 100 | Deuda recurrente / programada | Recurring / scheduled debt |
| group_id | 103 | UUID para agrupar múltiples DebtSchedule creados en bulk (permite editar en grupo) | UUID to group multiple DebtSchedules created in bulk (allows group editing) |
| name | 105 | Nombre de la recurrencia | Name of the recurrence |
| amount | 107 | Monto base | Base amount |
| day_of_month | 110 | Ej: `15` → día 15 del mes.<br>Ej: `2L` → 2do Lunes, `4V` → 4to Viernes, `1D` → primer Domingo, etc. | E.g., `15` → day 15 of the month.<br>E.g., `2L` → 2nd Monday, `4V` → 4th Friday, `1D` → 1st Sunday, etc. |
| calculation_formula | 112 | Para cálculos dinámicos | For dynamic calculations |
| daily_interest_rate | 113 | Tasa diaria post-vencimiento (heredable a las deudas generadas) | Daily rate after due date (inheritable by generated debts) |
| end_date | 116 | Null = indefinido | Null = undefined (no end date) |
| invoice_template_id | 118 | Plantilla por defecto para las deudas generadas | Default template for generated debts |

### Invoice
| Property | Line | Current | Proposed |
|---|---|---|---|
| *(header)* | 126 | Factura / Pagaré (representación formal visible para el cliente) | Invoice / Promissory note (formal representation visible to the client) |
| invoice_template_id | 131 | Plantilla usada para generar esta factura | Template used to generate this invoice |
| invoice_number | 132 | Número legible | Human-readable number |

### InvoiceTemplate
| Property | Line | Current | Proposed |
|---|---|---|---|
| *(header)* | 144 | Plantilla configurable por Company | Template configurable by Company |
| name | 147 | Nombre interno de la plantilla | Internal template name |
| subject | 148 | Asunto (email o visualización) | Subject (email or display) |
| body_html | 149 | HTML con placeholders (`{{client_name}}`, `{{total_amount}}`, `{{due_date}}`, etc.) | HTML with placeholders (`{{client_name}}`, `{{total_amount}}`, `{{due_date}}`, etc.) |

### PaymentProof
| Property | Line | Current | Proposed |
|---|---|---|---|
| *(header)* | 159 | Comprobante subido por el Client | Proof of payment uploaded by the Client |
| file_url | 163 | URL del comprobante subido | URL of the uploaded proof |
| file_name | 164 | Nombre original del archivo | Original file name |
| notes | 166 | Notas adicionales ingresadas por el cliente al subir | Additional notes entered by the client when uploading |
| created_by | 168 | (Client o System) | (Client or System) |

### PaymentAttempt
| Property | Line | Current | Proposed |
|---|---|---|---|
| *(header)* | 170 | Intento de pago (estado intermedio) | Payment attempt (intermediate state) |
| debt_id | 175 | **Obligatorio**: El cliente debe indicar a qué deuda corresponde el comprobante | **Required**: The client must indicate which debt the proof corresponds to |
| amount | 176 | Se llena automáticamente si el parseo del comprobante tiene éxito | Auto-filled if the proof parsing is successful |
| currency | 177 | `'ARS'`, `'USD'` — Se llena si el parseo es exitoso | `'ARS'`, `'USD'` — Filled if parsing is successful |
| rejection_reason | 184 | Motivo de rechazo (usado principalmente por Company User al rechazar manualmente) | Rejection reason (used mainly by Company User when manually rejecting) |
| reviewed_by | 185 | Usuario de la Company que revisó | Company user who reviewed |

#### PaymentAttempt.status — Multi-line (Lines 178–183)
- **Current**: `UPLOADED -> Comprobante recién subido\nPARSE_FAILED -> Falló el procesamiento automático del archivo\nPENDING_VALIDATION -> Esperando revisión o matching bancario\nMATCHED -> Coincidió automáticamente con movimiento bancario\nAPPROVED -> Aprobado manualmente por la Company\nREJECTED -> Rechazado (manual o automático)`
- **Proposed**: `UPLOADED -> Proof just uploaded\nPARSE_FAILED -> Automatic file processing failed\nPENDING_VALIDATION -> Awaiting review or bank matching\nMATCHED -> Automatically matched with bank transaction\nAPPROVED -> Manually approved by the Company\nREJECTED -> Rejected (manual or automatic)`

### Payment
| Property | Line | Current | Proposed |
|---|---|---|---|
| *(header)* | 190 | Pago confirmado (registro definitivo) | Confirmed payment (final record) |
| debt_id | 194 | Deuda a la que se aplica el pago | Debt to which the payment is applied |
| payment_attempt_id | 195 | Origen del pago (si proviene de un comprobante) | Payment origin (if it comes from a proof) |
| amount | 196 | Monto pagado | Amount paid |
| payment_date | 198 | Fecha efectiva del pago | Effective payment date |
| updated_by | 204 | Usuario que modificó el pago (generalmente Company User) | User who modified the payment (usually Company User) |

### BankStatement
| Property | Line | Current | Proposed |
|---|---|---|---|
| *(header)* | 206 | Extracto bancario subido (solo durante el proceso) | Uploaded bank statement (process-only) |
| bank | 209 | Ej: `'GALICIA'`, `'BBVA'`, `'SANTANDER'`, `'BRUBANK'`, `'MERCADOPAGO'`, etc. | E.g., `'GALICIA'`, `'BBVA'`, `'SANTANDER'`, `'BRUBANK'`, `'MERCADOPAGO'`, etc. |
| format | 210 | Ej: `'PDF_TEXT'`, `'PDF_TABLA'`, `'EXCEL'`, `'CSV'`, `'API'` — Define qué parser usar | E.g., `'PDF_TEXT'`, `'PDF_TABLA'`, `'EXCEL'`, `'CSV'`, `'API'` — Defines which parser to use |
| file_url | 211 | URL del extracto subido | URL of the uploaded statement |
| file_name | 212 | Nombre original del archivo | Original file name |
| period_from | 213 | Inicio del período del extracto | Start of the statement period |
| period_to | 214 | Fin del período del extracto | End of the statement period |
| total_transactions | 216 | Cantidad de movimientos detectados | Number of detected transactions |
| notes | 217 | Notas (útil para errores de parseo) | Notes (useful for parsing errors) |
| created_by | 220 | Usuario que subió el extracto | User who uploaded the statement |
| updated_by | 221 | Usuario que modificó (ej: para correcciones manuales) | User who modified (e.g., for manual corrections) |

### BankTransaction
| Property | Line | Current | Proposed |
|---|---|---|---|
| *(header)* | 223 | Movimientos parseados del extracto | Parsed transactions from the statement |
| client_id | 227 | Cliente detectado automáticamente o manualmente a partir de los datos de la transferencia | Client detected automatically or manually from the transfer data |
| transaction_date | 228 | Fecha del movimiento | Transaction date |
| amount | 229 | Monto | Amount |
| description | 231 | Descripción completa del banco | Full bank description |
| reference | 232 | Número de referencia / operación / CBU / alias | Reference / operation / CBU / alias number |
| balance_after | 233 | Saldo posterior | Balance after |

### PaymentMatch
| Property | Line | Current | Proposed |
|---|---|---|---|
| *(header)* | 238 | Registro del matcheo exitoso | Record of successful matching |
| matched_amount | 243 | Monto que se usó para el match (permite coincidencias parciales) | Amount used for the match (allows partial matches) |
| confidence_score | 244 | Puntaje de coincidencia automática (0.00 - 100.00) | Automatic match score (0.00 - 100.00) |
| notes | 247 | Notas del matcheo (ej: "coincidencia por monto + referencia") | Match notes (e.g., "match by amount + reference") |

### Notification
| Property | Line | Current | Proposed |
|---|---|---|---|
| user_id | 253 | Usuario destinatario (Company o End User) | Recipient user (Company or End User) |
| notification_template_id | 254 | Plantilla usada (si corresponde) | Template used (if applicable) |
| to | 255 | Email / Teléfono / WhatsApp destino | Destination email / phone / WhatsApp |
| from | 256 | Remitente (ej: no-reply@conciliador.app) | Sender (e.g., no-reply@conciliador.app) |
| subject | 258 | Asunto final | Final subject |
| body | 259 | Contenido final (HTML o texto) | Final content (HTML or text) |

### NotificationTemplate
| Property | Line | Current | Proposed |
|---|---|---|---|
| name | 268 | Nombre interno | Internal name |
| type | 269 | Igual que `Notification.type` | Same as `Notification.type` |
| subject | 270 | Asunto con placeholders | Subject with placeholders |
| body_plain | 271 | Versión texto plano (para WhatsApp/SMS) | Plain text version (for WhatsApp/SMS) |
| body_html | 272 | Versión HTML (para email) | HTML version (for email) |

### ClientDebtSummary
| Property | Line | Current | Proposed |
|---|---|---|---|
| *(header)* | 281 | Saldo actual, deuda total, etc. (puede ser vista materializada) | Current balance, total debt, etc. (can be a materialized view) |

### CompanyMonthlySummary
| Property | Line | Current | Proposed |
|---|---|---|---|
| *(header)* | 296 | Para facturación del SaaS | For SaaS billing |
| total_debts_generated | 301 | Monto total de deudas generadas | Total amount of generated debts |
| total_payments_received | 302 | Monto total de pagos confirmados | Total amount of confirmed payments |
| commission_earned | 303 | Comisión generada para la plataforma | Commission earned by the platform |

## Implementation Steps
1. Open `.agent/project-info/entities-definition.csv` in a text editor.
2. For each row in the Translation Mapping above, replace the Spanish `comments` text with the Proposed English text.
3. **Preserve CSV formatting**: multi-line comments are enclosed in double quotes. Ensure opening and closing quotes remain intact.
4. **Do not translate identifiers**: keep entity names, property names, enum values, and system acronyms unchanged.
5. Save the file.

## Verification
- Confirm the file still has 306 lines.
- Confirm columns 1–4 are unchanged.
- Confirm multi-line quoted fields are not corrupted.
- Confirm no Spanish text remains in the `comments` column.
