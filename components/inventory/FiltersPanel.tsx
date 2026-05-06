import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { InventoryFilters } from "@/lib/inventory/types";
import { Search, X } from "lucide-react";

export function FiltersPanel({
  filters,
  options,
  onChange,
  onClear,
}: {
  filters: InventoryFilters;
  options: {
    marcas: string[];
    modelos: string[];
    anos: string[];
    categorias: string[];
    sucursales: string[];
    colores: string[];
    condiciones: string[];
    estados: string[];
  };
  onChange: (f: InventoryFilters) => void;
  onClear: () => void;
}) {
  const update = (key: keyof InventoryFilters, value: string | number | null) => {
    onChange({ ...filters, [key]: value });
  };

  const hasFilters = useMemo(() => {
    return (
      filters.search ||
      filters.marca ||
      filters.modelo ||
      filters.ano ||
      filters.categoria ||
      filters.sucursal ||
      filters.color ||
      filters.condicion ||
      filters.estadoInventario ||
      filters.precioMin !== null ||
      filters.precioMax !== null
    );
  }, [filters]);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-(--border) bg-(--panel) p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)" />
          <Input
            placeholder="Buscar marca, modelo, VIN, placa..."
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            className="pl-9"
          />
        </div>
        <FilterSelect
          label="Marca"
          value={filters.marca ?? ""}
          options={options.marcas}
          onChange={(v) => update("marca", v || null)}
        />
        <FilterSelect
          label="Modelo"
          value={filters.modelo ?? ""}
          options={options.modelos}
          onChange={(v) => update("modelo", v || null)}
        />
        <FilterSelect
          label="Año"
          value={filters.ano ?? ""}
          options={options.anos}
          onChange={(v) => update("ano", v || null)}
        />
        <FilterSelect
          label="Categoría"
          value={filters.categoria ?? ""}
          options={options.categorias}
          onChange={(v) => update("categoria", v || null)}
        />
        <FilterSelect
          label="Sucursal"
          value={filters.sucursal ?? ""}
          options={options.sucursales}
          onChange={(v) => update("sucursal", v || null)}
        />
        <FilterSelect
          label="Color"
          value={filters.color ?? ""}
          options={options.colores}
          onChange={(v) => update("color", v || null)}
        />
        <FilterSelect
          label="Condición"
          value={filters.condicion ?? ""}
          options={options.condiciones}
          onChange={(v) => update("condicion", v || null)}
        />
        <FilterSelect
          label="Estado"
          value={filters.estadoInventario ?? ""}
          options={options.estados}
          onChange={(v) => update("estadoInventario", v || null)}
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-(--muted-foreground)">Precio min</label>
          <Input
            type="number"
            placeholder="0"
            value={filters.precioMin ?? ""}
            onChange={(e) => update("precioMin", e.target.value ? Number(e.target.value) : null)}
            className="w-32"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-(--muted-foreground)">Precio max</label>
          <Input
            type="number"
            placeholder="∞"
            value={filters.precioMax ?? ""}
            onChange={(e) => update("precioMax", e.target.value ? Number(e.target.value) : null)}
            className="w-32"
          />
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="gap-1">
            <X className="h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-(--muted-foreground)">{label}</label>
      <Select value={value} onChange={(e) => onChange(e.target.value)} className="min-w-[140px]">
        <option value="">Todos</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </Select>
    </div>
  );
}
