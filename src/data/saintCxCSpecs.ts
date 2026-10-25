export interface TipoCxCDef {
  codigo: string;
  nombre: string;
  factor: 1 | -1 | 0;
  clasificacion: 'Débito' | 'Crédito' | 'Neutro / Especial';
  descripcion: string;
  afectaSaldo: boolean;
  usoComun: string;
}

export const SAINT_TIPOS_CXC: TipoCxCDef[] = [
  {
    codigo: '10',
    nombre: 'Factura',
    factor: 1,
    clasificacion: 'Débito',
    descripcion: 'Facturación a crédito emitida. Incrementa la deuda por cobrar del cliente.',
    afectaSaldo: true,
    usoComun: 'Emisión de facturas desde Facturación o CxC'
  },
  {
    codigo: '20',
    nombre: 'Nota de Débito',
    factor: 1,
    clasificacion: 'Débito',
    descripcion: 'Aumenta la deuda del cliente por cargos adicionales, intereses o ajustes.',
    afectaSaldo: true,
    usoComun: 'Cargos financieros o ajustes por diferencia'
  },
  {
    codigo: '25',
    nombre: 'Anula Anticipo / Anulación',
    factor: 0,
    clasificacion: 'Neutro / Especial',
    descripcion: 'Anulación o reverso del adelanto recibido. En el acumulado histórico se excluye o neutraliza para mantener coherencia.',
    afectaSaldo: false,
    usoComun: 'Anulación de recibos de anticipo en CxC'
  },
  {
    codigo: '27',
    nombre: 'Nota de Débito (Especial / Miscelánea)',
    factor: 1,
    clasificacion: 'Débito',
    descripcion: 'Tipo de Nota de Débito para cargos adicionales, fletes o ajustes debitables.',
    afectaSaldo: true,
    usoComun: 'Cargos bancarios o administrativos'
  },
  {
    codigo: '31',
    nombre: 'Nota de Crédito',
    factor: -1,
    clasificacion: 'Crédito',
    descripcion: 'Nota de crédito por devolución o rebaja. Reduce la deuda viva del cliente.',
    afectaSaldo: true,
    usoComun: 'Devoluciones en ventas'
  },
  {
    codigo: '35',
    nombre: 'Reverso Adelanto',
    factor: 1,
    clasificacion: 'Débito',
    descripcion: 'Reverso de adelanto aplicado. Reabre o incrementa la deuda por cobrar al revertir el abono del anticipo.',
    afectaSaldo: true,
    usoComun: 'Corrección o reversión de cruces de anticipo'
  },
  {
    codigo: '36',
    nombre: 'Nota de Crédito (Ajuste / Descuento)',
    factor: -1,
    clasificacion: 'Crédito',
    descripcion: 'Nota de crédito aplicada por ajuste a favor del cliente o diferencia de precios.',
    afectaSaldo: true,
    usoComun: 'Ajustes comerciales y descuentos posteriores'
  },
  {
    codigo: '37',
    nombre: 'Nota de Crédito (Bonificación / Pronto Pago)',
    factor: -1,
    clasificacion: 'Crédito',
    descripcion: 'Nota de crédito por bonificación comercial o incentivo de pronto pago.',
    afectaSaldo: true,
    usoComun: 'Bonificaciones por volumen o convenios'
  },
  {
    codigo: '41',
    nombre: 'Pago Recibido (Cobro / Recibo)',
    factor: -1,
    clasificacion: 'Crédito',
    descripcion: 'Cobro o abono recibido del cliente. Reduce la deuda pendiente y el saldo acumulado.',
    afectaSaldo: true,
    usoComun: 'Recibos de cobranza ingresados en CxC'
  },
  {
    codigo: '50',
    nombre: 'Adelanto - Pago Anticipado Recibido',
    factor: -1,
    clasificacion: 'Crédito',
    descripcion: 'Adelanto o pago recibido a cuenta. En cartera viva representa saldo a favor (-Saldo). En SaldoAct acumulado se excluye para no duplicar cuando se aplica vía cobro 41.',
    afectaSaldo: true,
    usoComun: 'Cobranza anticipada previa a facturación'
  },
  {
    codigo: '60',
    nombre: 'Giro / Letra de Cambio',
    factor: 1,
    clasificacion: 'Débito',
    descripcion: 'Giro o letra de cambio comercial emitida a cobrar al cliente.',
    afectaSaldo: true,
    usoComun: 'Financiamiento comercial por giros'
  },
  {
    codigo: '70',
    nombre: 'Cuota - Suscripciones / Periódico',
    factor: 1,
    clasificacion: 'Débito',
    descripcion: 'Cargo por cuota recurrente, suscripción o mantenimiento contratado.',
    afectaSaldo: true,
    usoComun: 'Cargos periódicos mensuales'
  }
];

export interface ScriptAuditIssue {
  id: string;
  severidad: 'CRITICA' | 'ALTA' | 'MEDIA' | 'INFORMACION';
  titulo: string;
  problemaEnScript: string;
  impactoNegativo: string;
  solucionOptima: string;
}

export const AUDITORIA_SCRIPT_USUARIO: ScriptAuditIssue[] = [
  {
    id: 'missing-saclie-update',
    severidad: 'CRITICA',
    titulo: 'El script NO actualiza la tabla SACLIE (Omisión Fatal)',
    problemaEnScript: 'En su solicitud indicó que el script "debe actualizar los saldos correctos en la tabla saclie", pero en el código T-SQL únicamente ejecuta: UPDATE SAACxC SET SALDOACT = @saldoant WHERE NroUnico = @NroUnico. No existe ninguna sentencia UPDATE SACLIE.',
    impactoNegativo: 'La tabla SACLIE quedará con saldos totalmente desfasados, bloqueando créditos a clientes o permitiendo ventas a clientes morosos, ya que el sistema Saint lee SACLIE.Saldo para validaciones instantáneas.',
    solucionOptima: 'Incluir una sentencia basada en conjuntos (JOIN / Subquery de saldo pendiente) que sincronice SACLIE.Saldo con la sumatoria real de saldos vivos de SAACxC.'
  },
  {
    id: 'nested-cursors-rbar',
    severidad: 'CRITICA',
    titulo: 'Uso de Cursores Anidados (RBAR: Row-By-Agonizing-Row)',
    problemaEnScript: 'Tiene un cursor MCLIE que recorre cada cliente, y por cada cliente abre otro cursor MCURSOR que recorre documento a documento haciendo un UPDATE por cada registro individualmente.',
    impactoNegativo: 'En una base de datos con 5.000 clientes y 200.000 registros de CxC, este script realiza cientos de miles de operaciones I/O y transacciones individuales. Puede tardar entre 45 minutos y 4 horas, bloqueando las tablas y saturando el Transaction Log (LDF).',
    solucionOptima: 'Reemplazar los dos cursores por una sola consulta con Window Functions (SUM() OVER (PARTITION BY CodClie ORDER BY FechaE, NroUnico)) dentro de un CTE o UPDATE directo. Se ejecuta en menos de 3 a 5 segundos.'
  },
  {
    id: 'no-transaction-acid',
    severidad: 'ALTA',
    titulo: 'Falta de Manejo Transaccional (ACID) y Control de Errores',
    problemaEnScript: 'No cuenta con BEGIN TRANSACTION, COMMIT TRANSACTION ni bloque TRY...CATCH. Tampoco tiene SET XACT_ABORT ON.',
    impactoNegativo: 'Si el script se interrumpe a mitad de camino (por tiempo de espera, reinicio del servicio, fallo eléctrico o error de conversión), la mitad de la base de datos quedará recalculada y la otra mitad con los datos viejos, dejando la BD en estado inconsistente y sin rollback.',
    solucionOptima: 'Encapsular toda la rutina en una sola transacción atómica con XACT_ABORT ON y TRY...CATCH con ROLLBACK automático ante cualquier imprevisto.'
  },
  {
    id: 'chronological-order-risk',
    severidad: 'MEDIA',
    titulo: 'Orden Cronológico de Cálculo de Saldo Acumulado',
    problemaEnScript: 'El cursor ordena por: ORDER BY CodClie, A.NroUnico. Si en Saint se registraron cobranzas con fecha anterior a una factura pero con NroUnico mayor, el saldo acumulado histórico se desvirtúa cronológicamente.',
    impactoNegativo: 'Los estados de cuenta históricos de clientes mostrarán saldos acumulados inconsistentes con las fechas de emisión y pagos.',
    solucionOptima: 'Ordenar la función de ventana por ORDER BY CodClie, FechaE ASC, NroUnico ASC para garantizar rigor cronológico.'
  },
  {
    id: 'decimal-precision',
    severidad: 'MEDIA',
    titulo: 'Tipo de dato DECIMAL(13,2) vs Estructura Saint',
    problemaEnScript: 'Declara variables DECIMAL(13,2). En bases de datos con histórico de reconversiones monetarias venezolanas o montos en monedas extranjeras altas, un acumulado histórico de facturación puede superar 13 dígitos.',
    impactoNegativo: 'Riesgo de error "Arithmetic overflow error converting expression to data type numeric", deteniendo todo el proceso.',
    solucionOptima: 'Usar DECIMAL(28,4) o la definición nativa de Saint DECIMAL(28,2) / DECIMAL(18,2).'
  }
];

export interface SampleTransaction {
  nroUnico: number;
  codClie: string;
  fechaE: string;
  numeroD: string;
  tipoCxC: string;
  monto: number;
  saldoDoc: number;
  saldoActErroneo: number;
  saldoActCorrecto?: number;
}

export const SAMPLE_CLIENT_TRANSACTIONS: SampleTransaction[] = [
  {
    nroUnico: 104201,
    codClie: 'C-00142',
    fechaE: '2025-01-15',
    numeroD: 'FAC-00891',
    tipoCxC: '10', // Factura (+1)
    monto: 1500.00,
    saldoDoc: 0.00,
    saldoActErroneo: 0.00 // Dañado
  },
  {
    nroUnico: 104255,
    codClie: 'C-00142',
    fechaE: '2025-01-18',
    numeroD: 'NC-00012',
    tipoCxC: '31', // Nota de Crédito (-1)
    monto: 150.00,
    saldoDoc: 0.00,
    saldoActErroneo: 2500.00 // Dañado
  },
  {
    nroUnico: 104310,
    codClie: 'C-00142',
    fechaE: '2025-01-20',
    numeroD: 'REC-00445',
    tipoCxC: '41', // Pago recibido (-1)
    monto: 1350.00,
    saldoDoc: 0.00,
    saldoActErroneo: 100.00 // Dañado
  },
  {
    nroUnico: 104402,
    codClie: 'C-00142',
    fechaE: '2025-02-05',
    numeroD: 'FAC-00940',
    tipoCxC: '10', // Factura (+1)
    monto: 3200.00,
    saldoDoc: 1700.00,
    saldoActErroneo: 500.00 // Dañado
  },
  {
    nroUnico: 104450,
    codClie: 'C-00142',
    fechaE: '2025-02-08',
    numeroD: 'ND-00031',
    tipoCxC: '27', // Nota de Débito (+1)
    monto: 180.00,
    saldoDoc: 180.00,
    saldoActErroneo: 300.00 // Dañado
  },
  {
    nroUnico: 104490,
    codClie: 'C-00142',
    fechaE: '2025-02-12',
    numeroD: 'REC-00512',
    tipoCxC: '41', // Pago recibido (-1)
    monto: 1500.00,
    saldoDoc: 0.00,
    saldoActErroneo: 120.00 // Dañado
  },
  {
    nroUnico: 104520,
    codClie: 'C-00142',
    fechaE: '2025-02-15',
    numeroD: 'ANT-00088',
    tipoCxC: '50', // Adelanto / Anticipo recibido
    monto: 400.00,
    saldoDoc: 400.00,
    saldoActErroneo: 0.00 // Excluido de SaldoAct para evitar duplicidad de cruce
  }
];
