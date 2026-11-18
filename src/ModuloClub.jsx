import React from 'react';
import ModuloTienda from './ModuloTienda';

/**
 * PATRÓN FACADE / ADAPTER (SOLID - Liskov Substitution & DRY):
 * Erradica la duplicación entre el antiguo ModuloClub y el nuevo Centro Unificado.
 * Cualquier vista, enlace o módulo secundario que invoque <ModuloClub />
 * aterriza directamente en la pestaña de Membresías Club VIP sin fallos.
 */
export default function ModuloClub({ currentUser, db, onVolver, onSuscribir }) {
  return (
    <ModuloTienda
      currentUser={currentUser}
      db={db}
      tabInicial="socios"
      onVolver={onVolver}
      onSuscribir={onSuscribir}
    />
  );
}