# Dashboard de Sincronizacion

Sistema de dashboard que recibe datos desde n8n, los guarda en PostgreSQL y los muestra con metricas, graficos y logs.

## Requisitos

- Node.js 20+
- PostgreSQL

## Configuracion

1. Copia .env.example a .env.
2. Completa DATABASE_URL y N8N_DASHBOARD_SECRET.

## Instalacion

```bash
npm install
```

## Migraciones Prisma

```bash
npx prisma migrate dev --name init
npx prisma generate
```

## Ejecutar

```bash
npm run dev
```

## Endpoints

- POST /api/sheets-sync
- GET /api/dashboard-data
- GET /api/sync-logs
- GET /api/health

## Prueba con curl

```bash
curl -X POST http://localhost:3000/api/sheets-sync \
	-H "Content-Type: application/json" \
	-H "x-dashboard-secret: cambia_este_secreto_largo" \
	-d '{
		"event": "row_added_or_updated",
		"id": "demo-1",
		"rowNumber": 1,
		"data": {
			"nombre": "Cliente Demo",
			"telefono": "+584121234567",
			"estado": "activo",
			"monto": "150",
			"fecha": "2026-05-04"
		},
		"previous": null,
		"source": {
			"type": "google_sheets",
			"spreadsheetId": "demo-sheet",
			"sheetName": "Hoja1"
		},
		"syncedAt": "2026-05-04T00:00:00.000Z"
	}'
```

## Configurar n8n

- URL: http://localhost:3000/api/sheets-sync
- Header: x-dashboard-secret: 123456789

## Verificacion rapida

1. Ejecuta el servidor con npm run dev.
2. Ejecuta el curl de prueba.
3. Entra a /dashboard y confirma tablas, metricas, graficos y logs.

## Errores comunes

- 401: el secreto no coincide con N8N_DASHBOARD_SECRET.
- 422: payload invalido, revisa campos obligatorios.
- 500: revisa DATABASE_URL y migraciones de Prisma.
