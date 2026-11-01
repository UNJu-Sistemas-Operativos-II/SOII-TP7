#!/usr/bin/env python3
"""
=============================================================================
EVALUADOR AUTOMÁTICO DE TRABAJOS PRÁCTICOS - SISTEMAS OPERATIVOS II
Universidad Nacional de Jujuy (UNJu - Facultad de Ingeniería)
Ciclo Lectivo 2026 | Titular: Ing. María Fernanda Vázquez | JTP: Ing. Fabio D. Argañaraz
=============================================================================
Módulo de Evaluación del Trabajo Práctico N° 7 (Coordinación Distribuida)
"""

import sys
import os
import json
import hashlib
import argparse
from datetime import datetime

# Asegurar compatibilidad UTF-8 en consolas Windows
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RUBRIC_FILE = os.path.join(SCRIPT_DIR, "rubric_tp07.json")
CATEDRA_SALT = "SOII_UNJu_FI_2026_CatedraVazquez_SecretSalt"

def compute_hash(ex_id, item_key, val):
    clean_val = str(val).strip().lower() if val is not None else ""
    raw = f"{ex_id}:{item_key}:{clean_val}:{CATEDRA_SALT}"
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()

def load_json(filepath):
    if not os.path.exists(filepath):
        print(f"[ERROR] No se encontró el archivo: {filepath}", file=sys.stderr)
        sys.exit(1)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"[ERROR] Error al leer JSON '{filepath}': {e}", file=sys.stderr)
        sys.exit(1)

def grade_submission(submission, rubric):
    student = submission.get("estudiante", {})
    exercises_rubric = rubric.get("exercises", {})
    
    total_score = 0
    max_total_score = rubric.get("max_score", 100)
    exercise_results = {}

    for ex_id, ex_spec in exercises_rubric.items():
        weight = ex_spec.get("weight", 20)
        feedback = ex_spec.get("feedback", "")
        ex_score = 0
        details = []

        student_data = submission.get(ex_id, {})

        if "hashes" in ex_spec:
            expected_hashes = ex_spec["hashes"]

            if ex_spec.get("type") == "ordered_list":
                items_list = expected_hashes.get("items", [])
                total_items = len(items_list)
                correct_items_count = 0
                list_key = ex_spec.get("list_key", "orden_algoritmo_bully")
                actual_list = student_data.get(list_key, [])
                for idx, exp_hash in enumerate(items_list):
                    actual_val = actual_list[idx] if idx < len(actual_list) else None
                    actual_hash = compute_hash(ex_id, f"pos_{idx}", actual_val)
                    is_correct = (actual_hash == exp_hash)
                    if is_correct:
                        correct_items_count += 1
                    details.append({
                        "item": f"Etapa {idx + 1}",
                        "submitted": actual_val,
                        "is_correct": is_correct
                    })
                if total_items > 0:
                    ex_score = round((correct_items_count / total_items) * weight, 2)
            else:
                total_items = len(expected_hashes)
                correct_items_count = 0
                for item_key, exp_hash in expected_hashes.items():
                    actual_val = student_data.get(item_key)
                    actual_hash = compute_hash(ex_id, item_key, actual_val)
                    is_correct = (actual_hash == exp_hash)
                    if is_correct:
                        correct_items_count += 1
                    details.append({
                        "item": item_key,
                        "submitted": actual_val,
                        "is_correct": is_correct
                    })
                if total_items > 0:
                    ex_score = round((correct_items_count / total_items) * weight, 2)

        exercise_results[ex_id] = {
            "title": ex_spec.get("title", ex_id),
            "score": ex_score,
            "max_score": weight,
            "passed": (ex_score == weight),
            "feedback": feedback if ex_score < weight else "Completado correctamente.",
            "details": details
        }
        total_score += ex_score

    total_score = round(total_score, 2)

    return {
        "estudiante": student,
        "score": total_score,
        "max_score": max_total_score,
        "percentage": round((total_score / max_total_score) * 100, 1),
        "all_passed": (total_score == max_total_score),
        "exercises": exercise_results,
        "timestamp": datetime.now().isoformat()
    }

def print_text_report(report):
    print("=" * 72)
    print("   UNJu — FACULTAD DE INGENIERÍA — SISTEMAS OPERATIVOS II (2026)")
    print("   EVALUADOR AUTOMÁTICO: TRABAJO PRÁCTICO N° 7 (COORDINACIÓN DISTRIBUIDA)")
    print("=" * 72)
    est = report.get("estudiante", {})
    print(f"Estudiante : {est.get('nombre', 'Desconocido')}")
    print(f"Legajo     : {est.get('legajo', 'S/D')}")
    print(f"GitHub     : {est.get('github', 'S/D')}")
    print(f"Fecha      : {report.get('timestamp')}")
    print("-" * 72)
    print(f"{'Sección / Ejercicio Evaluado':<52} | {'Puntaje':<15}")
    print("-" * 72)

    for ex_id, res in report.get("exercises", {}).items():
        status = "✓ [OK]" if res["passed"] else "✗ [REVISAR]"
        score_str = f"{res['score']} / {res['max_score']} Pts"
        print(f"{res['title'][:50]:<52} | {score_str:<10} {status}")
        if not res["passed"]:
            print(f"  └─ Feedback: {res['feedback']}")
            failed_items = [d['item'] for d in res['details'] if not d['is_correct']]
            if failed_items:
                print(f"  └─ Items con discrepancia: {', '.join(failed_items)}")

    print("=" * 72)
    print(f"PUNTAJE TOTAL OBTENIDO : {report['score']} / {report['max_score']} Pts ({report['percentage']}%)")
    if report["all_passed"]:
        print("RESULTADO FINAL        : ¡APROBADO AL 100%! EXCELENTE TRABAJO 🎉")
    else:
        print("RESULTADO FINAL        : INCOMPLETO — Corrija las secciones observadas.")
    print("=" * 72)

def append_github_step_summary(report):
    summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
    if not summary_file:
        return
    try:
        with open(summary_file, 'a', encoding='utf-8') as f:
            f.write("# 📊 Reporte de Autograding — TP 7 (Coordinación Distribuida)\n\n")
            est = report.get("estudiante", {})
            f.write(f"- **Estudiante:** `{est.get('nombre', 'S/D')}` (LU: `{est.get('legajo', 'S/D')}`)\n")
            f.write(f"- **Puntaje Final:** **`{report['score']} / {report['max_score']} Pts`** (`{report['percentage']}%`)\n")
            f.write(f"- **Estado:** {'✅ **APROBADO (100%)**' if report['all_passed'] else '⚠️ **REQUIERE REVISIÓN**'}\n\n")
            f.write("| Sección Evaluada | Puntaje | Estado |\n")
            f.write("| :--- | :---: | :---: |\n")
            for ex_id, res in report.get("exercises", {}).items():
                st = "✅ Aprobado" if res["passed"] else "❌ Incompleto"
                f.write(f"| {res['title']} | {res['score']}/{res['max_score']} Pts | {st} |\n")
            f.write("\n")
    except Exception as e:
        print(f"[WARN] No se pudo escribir en GITHUB_STEP_SUMMARY: {e}", file=sys.stderr)

def main():
    parser = argparse.ArgumentParser(description="Evaluador Automático TP7 - UNJu SO2")
    parser.add_argument("submission", help="Ruta al archivo respuestas_tp07.json del estudiante")
    parser.add_argument("--rubric", default=RUBRIC_FILE, help="Ruta a rubric_tp07.json")
    parser.add_argument("--json", action="store_true", help="Salida en formato JSON crudo")
    args = parser.parse_args()

    submission_data = load_json(args.submission)
    rubric_data = load_json(args.rubric)

    report = grade_submission(submission_data, rubric_data)

    if args.json:
        print(json.dumps(report, indent=2, ensure_ascii=False))
    else:
        print_text_report(report)

    append_github_step_summary(report)

    if not report["all_passed"]:
        sys.exit(1)
    sys.exit(0)

if __name__ == "__main__":
    main()

