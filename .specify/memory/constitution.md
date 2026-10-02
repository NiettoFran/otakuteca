<!--
Sync Impact Report
- Versión: (plantilla sin ratificar) → 1.0.0
- Principios definidos:
  - I. Simplicidad orientada al MVP
  - II. Idioma y tono personal
  - III. Cero alcance fantasma (carga manual estricta)
  - IV. Verificable por un visitante no técnico
  - V. Seguridad y aislamiento por defecto
- Secciones agregadas: Restricciones técnicas, Flujo de trabajo, Governance
- Secciones eliminadas: ninguna
- Plantillas:
  - ✅ .specify/templates/plan-template.md (Constitution Check es genérico; toma los gates de este archivo)
  - ✅ .specify/templates/spec-template.md (sin cambios necesarios)
  - ✅ .specify/templates/tasks-template.md (sin cambios necesarios)
- TODOs diferidos: ninguno
-->

# Otakuteca Constitution

Otakuteca es un catálogo digital personal y público para centralizar y compartir el historial
de anime y manga de su creador.

## Core Principles

### I. Simplicidad orientada al MVP

- Ante dos opciones, se DEBE elegir la más directa.
- El enrutamiento multipágina DEBE ser limpio y predecible.
- NO se crean componentes de React, hooks ni abstracciones de Tailwind "por si acaso":
  solo se abstrae cuando hay al menos dos usos reales.
- Si la funcionalidad básica cumple, se avanza.

**Por qué**: es una v1. Lo que no se necesita hoy es deuda, no inversión.

### II. Idioma y tono personal

- Todo el producto (textos, botones, mensajes de error, metadatos) DEBE estar en español
  de Argentina (voseo: "mirá", "filtrá", "elegí").
- Los textos y el diseño NO DEBEN sonar corporativos ni genéricos: es el espacio de alguien
  que comparte lo que le gusta con amigos y conocidos.

**Por qué**: la personalidad es parte del producto; un catálogo neutro no tiene razón de existir.

### III. Cero alcance fantasma (carga manual estricta)

- NO se implementan conexiones a APIs externas de catálogo (MyAnimeList, Kitsu, AniList, etc.).
- NO se implementan sistemas automáticos para traer portadas ni metadatos.
- Toda la carga de datos en v1 es 100 % manual.
- Cualquier idea de automatización se anota en el backlog de la v2 y NO se codifica.

**Por qué**: el alcance fantasma es lo que más rápido mata un MVP.

### IV. Verificable por un visitante no técnico

- La interfaz pública DEBE explicarse sola: si alguien que recibe el enlace necesita
  instrucciones para usar los filtros o navegar el catálogo, la UI falló.
- Cada funcionalidad DEBE poder validarse haciendo clics en la web, sin leer código.
- Los criterios de aceptación de cada spec se escriben como acciones de un visitante.

**Por qué**: el público objetivo son amigos y conocidos, no desarrolladores.

### V. Seguridad y aislamiento por defecto

- La vista pública es de solo lectura y DEBE ser a prueba de manipulaciones: ningún dato
  se modifica desde ella.
- El panel de control DEBE estar protegido con autenticación; ninguna ruta, endpoint ni
  acción de edición puede quedar accesible sin sesión válida.
- Las credenciales y secretos NUNCA se suben al repositorio: van en variables de entorno
  fuera del control de versiones.
- La protección se valida del lado del servidor, no solo ocultando botones en la UI.

**Por qué**: el objetivo final es publicar el sitio; lo público no puede ser la puerta de entrada
a lo privado.

## Restricciones técnicas

- Stack actual: React + TypeScript + Vite, Tailwind CSS y shadcn/ui, desplegado en Vercel.
- Agregar una dependencia nueva requiere justificar por qué lo existente no alcanza.
- El código y los nombres técnicos pueden estar en inglés; todo lo que ve el usuario va en
  español de Argentina.

## Flujo de trabajo

- Cada feature pasa por spec → plan → tareas antes de implementarse.
- El "Constitution Check" del plan DEBE verificar los cinco principios; cualquier excepción
  se documenta en la tabla de complejidad con su justificación.
- Antes de cerrar una feature: `pnpm lint`, `pnpm build` y una verificación manual en el
  navegador desde la vista pública.

## Governance

- Esta constitución prevalece sobre cualquier otra práctica del proyecto.
- Las enmiendas se hacen editando este archivo, con su Sync Impact Report y bump de versión:
  - MAJOR: se quita o redefine un principio.
  - MINOR: se agrega un principio o sección, o se amplía de forma sustancial.
  - PATCH: aclaraciones y redacción.
- Toda revisión de specs, planes y código DEBE chequear el cumplimiento de estos principios.

**Version**: 1.0.0 | **Ratified**: 2026-10-01 | **Last Amended**: 2026-10-01
