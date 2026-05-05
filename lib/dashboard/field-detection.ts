const normalizeKey = (value: string) =>
    value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

const findField = (keys: string[], candidates: string[]) => {
    for (const key of keys) {
        const normalized = normalizeKey(key);
        if (candidates.includes(normalized)) {
            return key;
        }
    }
    return null;
};

const findFields = (keys: string[], candidates: string[]) => {
    const found: string[] = [];
    for (const key of keys) {
        const normalized = normalizeKey(key);
        if (candidates.includes(normalized)) {
            found.push(key);
        }
    }
    return found;
};

export const detectField = (keys: string[], candidates: string[]) => findField(keys, candidates);

export const detectStatusField = (keys: string[]) =>
    findField(keys, ["estado", "status", "state", "estado_oportunidad"]);

export const detectAmountField = (keys: string[]) =>
    findField(keys, ["monto", "amount", "total", "precio_lista_usd", "precio", "price", "monto_usd"]);

export const detectDateField = (keys: string[]) =>
    findField(keys, [
        "fecha",
        "date",
        "createdat",
        "updatedat",
        "syncedat",
        "synced_at",
        "created_at",
        "updated_at",
        "fecha_cierre_real",
        "fecha_cierre_estimada",
        "fecha_actualizacion",
    ]);

export const detectMarginUsdField = (keys: string[]) =>
    findField(keys, ["margen_usd", "margin_usd", "margen", "margin"]);

export const detectMarginPctField = (keys: string[]) =>
    findField(keys, ["margen_pct", "margin_pct", "margenporcentaje", "marginpercentage"]);

export const detectMontoBsField = (keys: string[]) =>
    findField(keys, ["monto_bs", "montobs", "amount_bs", "bolivares"]);

export const detectCanalField = (keys: string[]) =>
    findField(keys, ["canal", "channel", "origen_lead", "canal_venta"]);

export const detectVendedorField = (keys: string[]) =>
    findField(keys, ["vendedor", "seller", "asesor", "vendedor_nombre", "sales_rep"]);

export const detectCiudadField = (keys: string[]) =>
    findField(keys, ["ciudad", "city", "ciudad_cliente", "localidad"]);

export const detectSucursalField = (keys: string[]) =>
    findField(keys, ["sucursal", "branch", "oficina", "office", "sucursal_nombre"]);

export const detectCampanaField = (keys: string[]) =>
    findField(keys, ["campaña", "campana", "campaign", "campania"]);

export const detectProductoCategoriaField = (keys: string[]) =>
    findField(keys, ["producto_categoria", "categoria", "category", "producto", "product_category", "linea"]);

export const detectEtapaPipelineField = (keys: string[]) =>
    findField(keys, ["etapa_pipeline", "pipeline_stage", "etapa", "stage", "funnel_stage"]);

export const detectProbabilidadCierreField = (keys: string[]) =>
    findField(keys, ["probabilidad_cierre", "probabilidad", "probability", "prob_cierre", "win_probability"]);

export const detectCumplimientoSlaField = (keys: string[]) =>
    findField(keys, ["cumplimiento_sla", "sla_compliance", "cumple_sla", "sla"]);

export const detectFacturaRequeridaField = (keys: string[]) =>
    findField(keys, ["factura_requerida", "invoice_required", "req_factura", "requiere_factura"]);

export const detectFacturaEnviadaField = (keys: string[]) =>
    findField(keys, ["factura_enviada", "invoice_sent", "facturado", "enviada_factura"]);

export const detectSatisfaccionClienteField = (keys: string[]) =>
    findField(keys, ["satisfaccion_cliente", "satisfaction", "nps", "csat", "satisfaccion"]);

export const detectRiesgoChurnField = (keys: string[]) =>
    findField(keys, ["riesgo_churn", "churn_risk", "riesgo", "risk", "riesgo_baja"]);

export const detectTiempoRespuestaMinField = (keys: string[]) =>
    findField(keys, ["tiempo_respuesta_min", "response_time_min", "tiempo_respuesta", "response_minutes"]);

export const detectDiasEnPipelineField = (keys: string[]) =>
    findField(keys, ["dias_en_pipeline", "days_in_pipeline", "dias_pipeline", "pipeline_days"]);

export const detectTemperaturaLeadField = (keys: string[]) =>
    findField(keys, ["temperatura_lead", "lead_temperature", "temperatura", "lead_temp", "temperaturalead"]);

export const detectPrioridadField = (keys: string[]) =>
    findField(keys, ["prioridad", "priority", "urgencia", "urgency"]);

export const detectClienteNombreField = (keys: string[]) =>
    findField(keys, ["cliente_nombre", "client_name", "nombre_cliente", "cliente", "customer_name"]);

export const detectCostoEstimadoField = (keys: string[]) =>
    findField(keys, ["costo_estimado_usd", "costo", "cost", "estimated_cost", "costo_usd"]);

export const detectMotivoPerdidaField = (keys: string[]) =>
    findField(keys, ["motivo_perdida", "loss_reason", "motivo", "razon_perdida", "why_lost"]);

export const detectLlamadasRealizadasField = (keys: string[]) =>
    findField(keys, ["llamadas_realizadas", "calls_made", "llamadas", "calls"]);

export const detectMensajesEnviadosField = (keys: string[]) =>
    findField(keys, ["mensajes_enviados", "messages_sent", "mensajes", "messages", "sms_sent"]);

export const detectTestDriveField = (keys: string[]) =>
    findField(keys, ["test_drive", "testdrive", "prueba_manejo", "demo_drive"]);

export const detectMarcaField = (keys: string[]) =>
    findField(keys, ["marca", "brand", "make"]);

export const detectModeloField = (keys: string[]) =>
    findField(keys, ["modelo", "model"]);

export const detectSegmentoField = (keys: string[]) =>
    findField(keys, ["segmento", "segment"]);

export const detectIndustriaField = (keys: string[]) =>
    findField(keys, ["industria", "industry"]);

export const detectTipoClienteField = (keys: string[]) =>
    findField(keys, ["tipo_cliente", "customer_type", "tipo", "client_type"]);

export const detectTipoOperacionField = (keys: string[]) =>
    findField(keys, ["tipo_operacion", "operation_type", "tipo_op", "transaction_type"]);

export const detectBancoFinanciadorField = (keys: string[]) =>
    findField(keys, ["banco_financiador", "bank", "financiamiento_banco"]);

export const detectMetodoPagoField = (keys: string[]) =>
    findField(keys, ["metodo_pago", "payment_method", "forma_pago", "medio_pago"]);

export const detectMesField = (keys: string[]) =>
    findField(keys, ["mes", "month", "mes_nombre"]);

export type FieldMap = {
    id: string | null;
    fecha: string | null;
    fechaActualizacion: string | null;
    estado: string | null;
    monto: string | null;
    margenUsd: string | null;
    margenPct: string | null;
    montoBs: string | null;
    canal: string | null;
    vendedor: string | null;
    ciudad: string | null;
    sucursal: string | null;
    campana: string | null;
    productoCategoria: string | null;
    etapaPipeline: string | null;
    probabilidadCierre: string | null;
    cumplimientoSla: string | null;
    facturaRequerida: string | null;
    facturaEnviada: string | null;
    satisfaccionCliente: string | null;
    riesgoChurn: string | null;
    tiempoRespuestaMin: string | null;
    diasEnPipeline: string | null;
    temperaturaLead: string | null;
    prioridad: string | null;
    clienteNombre: string | null;
    costoEstimado: string | null;
    motivoPerdida: string | null;
    llamadasRealizadas: string | null;
    mensajesEnviados: string | null;
    testDrive: string | null;
    marca: string | null;
    modelo: string | null;
    segmento: string | null;
    industria: string | null;
    tipoCliente: string | null;
    tipoOperacion: string | null;
    bancoFinanciador: string | null;
    metodoPago: string | null;
    mes: string | null;
};

export function detectAllFields(keys: string[]): FieldMap {
    return {
        id: findField(keys, ["id", "opp_id", "opportunity_id", "codigo"]),
        fecha: detectDateField(keys),
        fechaActualizacion: findField(keys, ["fecha_actualizacion", "updated_at", "fecha_update"]),
        estado: detectStatusField(keys),
        monto: detectAmountField(keys),
        margenUsd: detectMarginUsdField(keys),
        margenPct: detectMarginPctField(keys),
        montoBs: detectMontoBsField(keys),
        canal: detectCanalField(keys),
        vendedor: detectVendedorField(keys),
        ciudad: detectCiudadField(keys),
        sucursal: detectSucursalField(keys),
        campana: detectCampanaField(keys),
        productoCategoria: detectProductoCategoriaField(keys),
        etapaPipeline: detectEtapaPipelineField(keys),
        probabilidadCierre: detectProbabilidadCierreField(keys),
        cumplimientoSla: detectCumplimientoSlaField(keys),
        facturaRequerida: detectFacturaRequeridaField(keys),
        facturaEnviada: detectFacturaEnviadaField(keys),
        satisfaccionCliente: detectSatisfaccionClienteField(keys),
        riesgoChurn: detectRiesgoChurnField(keys),
        tiempoRespuestaMin: detectTiempoRespuestaMinField(keys),
        diasEnPipeline: detectDiasEnPipelineField(keys),
        temperaturaLead: detectTemperaturaLeadField(keys),
        prioridad: detectPrioridadField(keys),
        clienteNombre: detectClienteNombreField(keys),
        costoEstimado: detectCostoEstimadoField(keys),
        motivoPerdida: detectMotivoPerdidaField(keys),
        llamadasRealizadas: detectLlamadasRealizadasField(keys),
        mensajesEnviados: detectMensajesEnviadosField(keys),
        testDrive: detectTestDriveField(keys),
        marca: detectMarcaField(keys),
        modelo: detectModeloField(keys),
        segmento: detectSegmentoField(keys),
        industria: detectIndustriaField(keys),
        tipoCliente: detectTipoClienteField(keys),
        tipoOperacion: detectTipoOperacionField(keys),
        bancoFinanciador: detectBancoFinanciadorField(keys),
        metodoPago: detectMetodoPagoField(keys),
        mes: detectMesField(keys),
    };
}
