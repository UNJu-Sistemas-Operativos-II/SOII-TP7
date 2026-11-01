#!/usr/bin/env bash
# ==============================================================================
# UNIVERSIDAD NACIONAL DE JUJUY (UNJu) - FACULTAD DE INGENIERÍA
# SISTEMAS OPERATIVOS II - CICLO LECTIVO 2026
# SUITE DE EVALUACIÓN AUTOMATIZADA — TRABAJO PRÁCTICO N° 7
# Tema: Coordinación Distribuida — Modalidad 100% Web Interactivo
# ==============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

PUNTAJE_TOTAL=0
MAX_PUNTAJE=100
FALLOS=0

imprimir_banner() {
    echo -e "${BLUE}================================================================${NC}"
    echo -e "${BOLD}     UNJu — SISTEMAS OPERATIVOS II — EVALUACIÓN AUTOMÁTICA TP 7   ${NC}"
    echo -e "${CYAN}     Tema: Coordinación Distribuida — Módulo Web Interactivo      ${NC}"
    echo -e "${BLUE}================================================================${NC}"
}

PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    if command -v python &> /dev/null; then
        PYTHON_CMD="python"
    else
        echo -e "${RED}[ERROR CRÍTICO] Python 3 no está instalado en el entorno.${NC}"
        exit 1
    fi
fi

mkdir -p soluciones

test_modulo_web() {
    echo -e "\n${BOLD}Verificando Módulo Web Interactivo (soluciones/respuestas_tp07.json)...${NC}"
    local target="soluciones/respuestas_tp07.json"

    if [ ! -f "$target" ]; then
        echo -e "  ${RED}✗ Falta el archivo '$target'.${NC}"
        echo -e "  ${YELLOW}ℹ Pasos para completar el trabajo práctico:${NC}"
        echo -e "    1. Abra 'web/index.html' en su navegador web preferido."
        echo -e "    2. Ingrese sus datos (Nombre, Legajo, GitHub)."
        echo -e "    3. Resuelva los laboratorios interactivos (Lamport, Exclusión Mutua, Wait-Die/Wound-Wait, Bully/Anillo y Bizantinos)."
        echo -e "    4. Al alcanzar el 100% académico, haga clic en '📥 Descargar respuestas_tp07.json'."
        echo -e "    5. Mueva el archivo descargado a la carpeta 'soluciones/' de este repositorio."
        echo -e "    6. Vuelva a ejecutar './test.sh'."
        echo -e "\n  ${RED}✗ [FAIL] Módulo Web no entregado (+0 Pts)${NC}"
        FALLOS=$((FALLOS + 1))
        return
    fi

    echo -e "  ${CYAN}ℹ Ejecutando autograder_tp07.py sobre '$target'...${NC}"
    if $PYTHON_CMD autograder_tp07.py "$target" --rubric rubric_tp07.json; then
        echo -e "\n  ${GREEN}✓ [PASS] Módulo Web validado al 100% con autograder_tp07.py (+100 Pts)${NC}"
        PUNTAJE_TOTAL=$MAX_PUNTAJE
    else
        echo -e "\n  ${RED}✗ [FAIL] autograder_tp07.py reportó discrepancias o puntaje incompleto (+0 Pts)${NC}"
        echo -e "  ${YELLOW}ℹ Revise las secciones marcadas como [REVISAR] y vuelva a generar el archivo en 'web/index.html'.${NC}"
        FALLOS=$((FALLOS + 1))
    fi
}

# ------------------------------------------------------------------------------
# Ejecución Principal
# ------------------------------------------------------------------------------
imprimir_banner

test_modulo_web

echo -e "\n${BLUE}================================================================${NC}"
echo -e "${BOLD}                       RESUMEN DE CALIFICACIÓN                  ${NC}"
echo -e "${BLUE}================================================================${NC}"
porcentaje=$((PUNTAJE_TOTAL * 100 / MAX_PUNTAJE))

if [ $PUNTAJE_TOTAL -eq 100 ]; then
    echo -e "  ${GREEN}${BOLD}PUNTAJE FINAL: ${PUNTAJE_TOTAL} / ${MAX_PUNTAJE} Pts (${porcentaje}%)${NC}"
    echo -e "  ${GREEN}${BOLD}ESTADO: ¡FELICITACIONES! TP 7 COMPLETADO EXITOSAMENTE ✅${NC}"
    echo -e "${BLUE}================================================================${NC}"
    exit 0
else
    echo -e "  ${YELLOW}${BOLD}PUNTAJE FINAL: ${PUNTAJE_TOTAL} / ${MAX_PUNTAJE} Pts (${porcentaje}%)${NC}"
    echo -e "  ${RED}${BOLD}ESTADO: TP 7 INCOMPLETO — Requiere atención antes de la entrega ⚠️${NC}"
    echo -e "${BLUE}================================================================${NC}"
    exit 1
fi
