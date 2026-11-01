/**
 * ==============================================================================
 * SISTEMAS OPERATIVOS II - UNJu - FACULTAD DE INGENIERÍA (2026)
 * APLICACIÓN WEB INTERACTIVA — TRABAJO PRÁCTICO N° 7
 * Tema: Coordinación Distribuida, Exclusión Mutua, Deadlock, Bully y Bizantinos
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'UNJU_SO2_TP7_STATE_V1';
    const TOTAL_ACADEMIC_ITEMS = 31;

    // Estado Reactivo de la Aplicación (6 Secciones Académicas)
    const state = {
        estudiante: {
            nombre: '',
            legajo: '',
            github: ''
        },
        seccion1_lamport_estados: {
            q1_estado_global_dificultad: null,
            q2_ejemplo_banco_inconsistencia: null,
            q3_regla_emisor_lamport: null,
            q4_regla_receptor_lamport: null,
            q5_ordenacion_total_desempate: null
        },
        seccion2_exclusion_mutua: {
            q1_centralizado_spof: null,
            q2_ricart_agrawala_mensajes: null,
            q3_ricart_criterio_postergacion: null,
            q4_token_anillo_ventaja: null,
            q5_token_perdida_vulnerabilidad: null
        },
        seccion3_interbloqueo_prevencion: {
            sw1_interbloqueo_fantasma: null,
            sw2_sondas_chandy_misra: null,
            sw3_wait_die_viejo_pide_joven: null,
            sw4_wait_die_joven_pide_viejo: null,
            sw5_wound_wait_viejo_pide_joven: null,
            sw6_wound_wait_joven_pide_viejo: null
        },
        seccion4_algoritmos_eleccion: {
            sim_bully_deteccion_timeout: null,
            sim_bully_quien_recibe_eleccion: null,
            sim_bully_regreso_nodo_alto: null,
            sim_anillo_criterio_ganador: null
        },
        seccion5_secuencia_algoritmos: {
            orden_algoritmo_bully: [
                '1_NODO_DETECTA_FALLO_COORDINADOR_POR_TIMEOUT',
                '2_ENVIA_MENSAJE_ELECCION_A_NODOS_ID_MAYOR',
                '3_SI_RECIBE_OK_CEDE_Y_ESPERA_NUEVO_LIDER',
                '4_SI_EXPIRA_TIMEOUT_SIN_OK_PROCLAMA_LIDERAZGO',
                '5_ENVIA_MENSAJE_COORDINADOR_A_TODOS_LOS_MENORES',
                '6_NODOS_SUBORDINADOS_ACTUALIZAN_TABLA_LIDER'
            ]
        },
        seccion6_consenso_bizantino: {
            q1_fallas_bizantinas_caracteristica: null,
            q2_condicion_ic1_acuerdo: null,
            q3_condicion_ic2_validez: null,
            q4_mensajes_orales_limite_m1: null,
            q5_mensajes_firmados_limite_m1: null
        }
    };

    let hasTriggeredConfetti = false;

    // Elementos DOM Principales
    const progressFill = document.getElementById('progress-fill');
    const progressLabel = document.getElementById('progress-label');
    const btnDownloadTop = document.getElementById('btn-download-json');
    const btnDownloadBottom = document.getElementById('btn-download-bottom');
    const downloadStatusMsg = document.getElementById('download-status-msg');
    const btnThemeToggle = document.getElementById('btn-theme-toggle');
    const btnImport = document.getElementById('btn-import-json');
    const fileImportInput = document.getElementById('file-import-input');
    const toastContainer = document.getElementById('toast-container');

    // --------------------------------------------------------------------------
    // 1. Tema Claro / Oscuro con Persistencia
    // --------------------------------------------------------------------------
    const currentTheme = localStorage.getItem('SO2_THEME') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);

    btnThemeToggle.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('SO2_THEME', theme);
        showToast(`Tema cambiado a ${theme === 'dark' ? 'Oscuro' : 'Claro'}`, 'info');
    });

    // --------------------------------------------------------------------------
    // 2. Notificaciones Toast
    // --------------------------------------------------------------------------
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = { info: 'ℹ️', success: '✅', warn: '⚠️', error: '❌' };
        toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    // --------------------------------------------------------------------------
    // 3. Conteo de Progreso Estrictamente Académico (31 Ítems)
    // --------------------------------------------------------------------------
    function countCompletedItems() {
        let count = 0;

        // Sección 1: 5 radio cards
        for (const k in state.seccion1_lamport_estados) {
            if (state.seccion1_lamport_estados[k]) count++;
        }

        // Sección 2: 5 selects
        for (const k in state.seccion2_exclusion_mutua) {
            if (state.seccion2_exclusion_mutua[k]) count++;
        }

        // Sección 3: 6 switches
        for (const k in state.seccion3_interbloqueo_prevencion) {
            if (state.seccion3_interbloqueo_prevencion[k]) count++;
        }

        // Sección 4: 4 selects
        for (const k in state.seccion4_algoritmos_eleccion) {
            if (state.seccion4_algoritmos_eleccion[k]) count++;
        }

        // Sección 5: 6 etapas ordenadas
        const dnd = state.seccion5_secuencia_algoritmos.orden_algoritmo_bully;
        if (Array.isArray(dnd) && dnd.length === 6 && dnd.every(x => Boolean(x))) {
            count += 6;
        }

        // Sección 6: 5 selects
        for (const k in state.seccion6_consenso_bizantino) {
            if (state.seccion6_consenso_bizantino[k]) count++;
        }

        return count;
    }

    function updateProgressUI() {
        const completed = countCompletedItems();
        const pct = Math.round((completed / TOTAL_ACADEMIC_ITEMS) * 100);

        progressFill.style.width = `${pct}%`;
        progressLabel.textContent = `${pct}% (${completed}/${TOTAL_ACADEMIC_ITEMS})`;

        const hasStudentInfo = Boolean(state.estudiante.nombre.trim()) && Boolean(state.estudiante.legajo.trim());
        const isReady = completed >= TOTAL_ACADEMIC_ITEMS && hasStudentInfo;

        btnDownloadTop.disabled = !isReady;
        btnDownloadBottom.disabled = !isReady;

        if (isReady) {
            downloadStatusMsg.innerHTML = '<span style="color: var(--accent);">¡Excelente! Trabajo Práctico completo y listo para descargar respuestas_tp07.json.</span>';
            if (!hasTriggeredConfetti && typeof confetti === 'function') {
                confetti({
                    particleCount: 120,
                    spread: 80,
                    origin: { y: 0.6 }
                });
                hasTriggeredConfetti = true;
                showToast('¡Felicitaciones! Has completado el 100% del TP 7 🎉', 'success');
            }
        } else {
            let msg = `Progreso académico: ${completed}/${TOTAL_ACADEMIC_ITEMS} ítems resueltos.`;
            if (!hasStudentInfo) {
                msg += ' Recuerde ingresar su Nombre y Legajo.';
            }
            downloadStatusMsg.textContent = msg;
        }
    }

    // --------------------------------------------------------------------------
    // 4. Persistencia en LocalStorage
    // --------------------------------------------------------------------------
    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Error guardando en localStorage:', e);
        }
    }

    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                Object.assign(state.estudiante, parsed.estudiante || {});
                Object.assign(state.seccion1_lamport_estados, parsed.seccion1_lamport_estados || {});
                Object.assign(state.seccion2_exclusion_mutua, parsed.seccion2_exclusion_mutua || {});
                Object.assign(state.seccion3_interbloqueo_prevencion, parsed.seccion3_interbloqueo_prevencion || {});
                Object.assign(state.seccion4_algoritmos_eleccion, parsed.seccion4_algoritmos_eleccion || {});
                if (parsed.seccion5_secuencia_algoritmos && Array.isArray(parsed.seccion5_secuencia_algoritmos.orden_algoritmo_bully)) {
                    state.seccion5_secuencia_algoritmos.orden_algoritmo_bully = parsed.seccion5_secuencia_algoritmos.orden_algoritmo_bully;
                }
                Object.assign(state.seccion6_consenso_bizantino, parsed.seccion6_consenso_bizantino || {});
                renderStateToUI();
            }
        } catch (e) {
            console.warn('Error cargando estado guardado:', e);
        }
    }

    function renderStateToUI() {
        // Datos del estudiante
        document.getElementById('alumno-nombre').value = state.estudiante.nombre || '';
        document.getElementById('alumno-legajo').value = state.estudiante.legajo || '';
        document.getElementById('alumno-github').value = state.estudiante.github || '';

        // Sección 1: Radios
        for (const [qid, val] of Object.entries(state.seccion1_lamport_estados)) {
            if (val) {
                const radio = document.querySelector(`input[name="${qid}"][value="${val}"]`);
                if (radio) radio.checked = true;
            }
        }

        // Sección 2: Selects
        for (const [qid, val] of Object.entries(state.seccion2_exclusion_mutua)) {
            if (val) {
                const sel = document.getElementById(`select-${qid}`);
                if (sel) sel.value = val;
            }
        }

        // Sección 3: Switches
        for (const [qid, val] of Object.entries(state.seccion3_interbloqueo_prevencion)) {
            if (val) {
                const item = document.querySelector(`.switch-item[data-qid="${qid}"]`);
                if (item) {
                    item.querySelectorAll('.seg-btn').forEach(b => {
                        b.classList.toggle('active', b.getAttribute('data-val') === val);
                    });
                }
            }
        }

        // Sección 4: Selects
        for (const [qid, val] of Object.entries(state.seccion4_algoritmos_eleccion)) {
            if (val) {
                const sel = document.getElementById(`select-${qid}`);
                if (sel) sel.value = val;
            }
        }

        // Sección 5: Drag & Drop slots
        renderDndSlotsFromState();

        // Sección 6: Selects
        for (const [qid, val] of Object.entries(state.seccion6_consenso_bizantino)) {
            if (val) {
                const sel = document.getElementById(`select-${qid}`);
                if (sel) sel.value = val;
            }
        }

        updateProgressUI();
    }

    // --------------------------------------------------------------------------
    // 5. Enlace de Eventos en Formularios y Controles
    // --------------------------------------------------------------------------
    // Inputs de datos personales
    ['alumno-nombre', 'alumno-legajo', 'alumno-github'].forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('input', () => {
            const field = id.replace('alumno-', '');
            state.estudiante[field] = input.value;
            saveState();
            updateProgressUI();
        });
    });

    // Sección 1: Radios
    document.querySelectorAll('.question-block[data-qid]').forEach(block => {
        const qid = block.getAttribute('data-qid');
        block.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', () => {
                state.seccion1_lamport_estados[qid] = radio.value;
                saveState();
                updateProgressUI();
            });
        });
    });

    // Sección 2: Selects
    document.querySelectorAll('#seccion-2 .select-box').forEach(sel => {
        sel.addEventListener('change', () => {
            const qid = sel.id.replace('select-', '');
            state.seccion2_exclusion_mutua[qid] = sel.value || null;
            saveState();
            updateProgressUI();
        });
    });

    // Sección 3: Switches segmentados
    document.querySelectorAll('.switch-item[data-qid]').forEach(item => {
        const qid = item.getAttribute('data-qid');
        item.querySelectorAll('.seg-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.getAttribute('data-val');
                item.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.seccion3_interbloqueo_prevencion[qid] = val;
                saveState();
                updateProgressUI();
            });
        });
    });

    // Sección 4: Selects
    document.querySelectorAll('#seccion-4 .select-box').forEach(sel => {
        sel.addEventListener('change', () => {
            const qid = sel.id.replace('select-', '');
            state.seccion4_algoritmos_eleccion[qid] = sel.value || null;
            saveState();
            updateProgressUI();
        });
    });

    // Sección 6: Selects
    document.querySelectorAll('#seccion-6 .select-box').forEach(sel => {
        sel.addEventListener('change', () => {
            const qid = sel.id.replace('select-', '');
            state.seccion6_consenso_bizantino[qid] = sel.value || null;
            saveState();
            updateProgressUI();
        });
    });

    // --------------------------------------------------------------------------
    // 6. Drag & Drop - Sección 5 (Algoritmo Bully)
    // --------------------------------------------------------------------------
    const bullyStagesDesc = {
        '1_NODO_DETECTA_FALLO_COORDINADOR_POR_TIMEOUT': 'Un nodo detecta caída del coordinador por expiración de temporizador (T > 2Tp + Tt).',
        '2_ENVIA_MENSAJE_ELECCION_A_NODOS_ID_MAYOR': 'El nodo difunde un mensaje de ELECCION únicamente a los nodos con identificador mayor.',
        '3_SI_RECIBE_OK_CEDE_Y_ESPERA_NUEVO_LIDER': 'Si recibe respuesta OK de algún nodo mayor, se inhibe y espera a que este asuma el mando.',
        '4_SI_EXPIRA_TIMEOUT_SIN_OK_PROCLAMA_LIDERAZGO': 'Si expira el timeout sin recibir ningún OK de nodos superiores, se autoproclama nuevo líder.',
        '5_ENVIA_MENSAJE_COORDINADOR_A_TODOS_LOS_MENORES': 'El nuevo líder transmite el mensaje COORDINADOR a todos los nodos con identificador menor.',
        '6_NODOS_SUBORDINADOS_ACTUALIZAN_TABLA_LIDER': 'Los nodos subordinados reciben el anuncio y actualizan su referencia interna de coordinador.'
    };

    function renderDndSlotsFromState() {
        const container = document.getElementById('dnd-bully-slots');
        if (!container) return;
        container.innerHTML = '';
        const list = state.seccion5_secuencia_algoritmos.orden_algoritmo_bully;

        list.forEach((stageId, idx) => {
            const slot = document.createElement('div');
            slot.className = 'dnd-slot';
            slot.setAttribute('data-index', idx);

            const badge = document.createElement('span');
            badge.className = 'slot-index';
            badge.textContent = `Etapa ${idx + 1}`;

            const chip = document.createElement('div');
            chip.className = 'dnd-chip';
            chip.setAttribute('data-id', stageId);

            const textSpan = document.createElement('span');
            textSpan.textContent = bullyStagesDesc[stageId] || stageId;

            const handle = document.createElement('span');
            handle.className = 'chip-handle';
            handle.textContent = '☰';

            chip.appendChild(textSpan);
            chip.appendChild(handle);
            slot.appendChild(badge);
            slot.appendChild(chip);
            container.appendChild(slot);
        });

        initBullySortable();
    }

    function initBullySortable() {
        const container = document.getElementById('dnd-bully-slots');
        if (!container) return;
        if (typeof Sortable !== 'undefined') {
            Sortable.create(container, {
                animation: 150,
                handle: '.dnd-chip',
                onEnd: () => {
                    const chips = container.querySelectorAll('.dnd-chip');
                    const newOrder = [];
                    chips.forEach((c, idx) => {
                        newOrder.push(c.getAttribute('data-id'));
                        const badge = c.parentElement.querySelector('.slot-index');
                        if (badge) badge.textContent = `Etapa ${idx + 1}`;
                    });
                    state.seccion5_secuencia_algoritmos.orden_algoritmo_bully = newOrder;
                    saveState();
                    updateProgressUI();
                }
            });
        }
    }

    window.resetBullyDndOrder = function() {
        const keys = Object.keys(bullyStagesDesc);
        // Shuffle determinista invertido
        keys.reverse();
        state.seccion5_secuencia_algoritmos.orden_algoritmo_bully = keys;
        renderDndSlotsFromState();
        saveState();
        updateProgressUI();
        showToast('Etapas mezcladas. Arrastre para colocarlas en orden secuencial.', 'info');
    };

    // --------------------------------------------------------------------------
    // 7. Simulador 1: Relojes Lógicos de Lamport
    // --------------------------------------------------------------------------
    let lamportClocks = { 1: 0, 2: 0, 3: 0 };

    window.triggerLamportLocalEvent = function(nodeId) {
        lamportClocks[nodeId] += 1;
        document.getElementById(`clock-p${nodeId}`).textContent = lamportClocks[nodeId];
        logLamport(`[P${nodeId}] Suceso local ejecutado. Reloj incrementa: C_${nodeId} = ${lamportClocks[nodeId]}`);
        highlightNode(`sim-node-p${nodeId}`);
    };

    window.sendLamportMsg = function(fromId, toId) {
        lamportClocks[fromId] += 1;
        const sendTimestamp = lamportClocks[fromId];
        document.getElementById(`clock-p${fromId}`).textContent = sendTimestamp;

        const prevRecClock = lamportClocks[toId];
        const newRecClock = 1 + Math.max(prevRecClock, sendTimestamp);
        lamportClocks[toId] = newRecClock;
        document.getElementById(`clock-p${toId}`).textContent = newRecClock;

        logLamport(`[P${fromId} &rarr; P${toId}] Mensaje transmitido con marca T=${sendTimestamp}. Receptor P${toId} actualiza: 1 + max(${prevRecClock}, ${sendTimestamp}) = ${newRecClock}`);
        highlightNode(`sim-node-p${fromId}`);
        setTimeout(() => highlightNode(`sim-node-p${toId}`), 200);
    };

    window.resetLamportClocks = function() {
        lamportClocks = { 1: 0, 2: 0, 3: 0 };
        [1, 2, 3].forEach(id => {
            document.getElementById(`clock-p${id}`).textContent = '0';
        });
        document.getElementById('lamport-log').innerHTML = '&gt; Relojes lógicos reiniciados: C1=0, C2=0, C3=0.';
    };

    function logLamport(msg) {
        const log = document.getElementById('lamport-log');
        log.innerHTML += `<div>&gt; ${msg}</div>`;
        log.scrollTop = log.scrollHeight;
    }

    function highlightNode(nodeElementId) {
        const el = document.getElementById(nodeElementId);
        if (!el) return;
        el.classList.add('active');
        setTimeout(() => el.classList.remove('active'), 500);
    }

    // --------------------------------------------------------------------------
    // 8. Simulador 2: Wait-Die vs Wound-Wait
    // --------------------------------------------------------------------------
    window.runDeadlockSimulation = function() {
        const tReq = parseInt(document.getElementById('sim-treq').value, 10);
        const tHold = parseInt(document.getElementById('sim-thold').value, 10);
        const scheme = document.getElementById('sim-scheme').value;
        const resBox = document.getElementById('sim-deadlock-result');

        if (tReq === tHold) {
            resBox.className = 'sim-status-card warn';
            resBox.innerHTML = 'Conflicto trivial: Ambas transacciones tienen la misma marca temporal. En el modelo se asume marcas únicas.';
            return;
        }

        const isReqOlder = tReq < tHold; // Menor marca = Más vieja

        if (scheme === 'wait_die') {
            if (isReqOlder) {
                resBox.className = 'sim-status-card success';
                resBox.innerHTML = `Vieja (${tReq}) solicita a Joven (${tHold}) bajo Wait-Die &rarr; <strong>La transacción vieja ESPERA</strong> pacíficamente a que la joven libere el recurso.`;
            } else {
                resBox.className = 'sim-status-card error';
                resBox.innerHTML = `Joven (${tReq}) solicita a Vieja (${tHold}) bajo Wait-Die &rarr; <strong>La transacción joven MUERE</strong> y se reinicia conservando su marca original.`;
            }
        } else {
            // wound_wait
            if (isReqOlder) {
                resBox.className = 'sim-status-card error';
                resBox.innerHTML = `Vieja (${tReq}) solicita a Joven (${tHold}) bajo Wound-Wait &rarr; <strong>La transacción vieja HIERE</strong> (expropia el recurso) y la joven se cancela/reinicia.`;
            } else {
                resBox.className = 'sim-status-card success';
                resBox.innerHTML = `Joven (${tReq}) solicita a Vieja (${tHold}) bajo Wound-Wait &rarr; <strong>A la transacción joven se le permite ESPERAR</strong> a que la vieja termine.`;
            }
        }
    };

    // --------------------------------------------------------------------------
    // 9. Simulador 3: Bully Algorithm
    // --------------------------------------------------------------------------
    let bullyCoordinator = 7;
    let node7Alive = true;

    window.simCrashLeader = function() {
        node7Alive = false;
        const n7 = document.getElementById('bnode-7');
        n7.className = 'node-card failed';
        n7.innerHTML = '<span>Nodo 7</span><span class="badge-tag" style="background: rgba(244,63,94,0.2); color: var(--rose);">Caído</span>';
        logBully('¡ALERTA! El coordinador Nodo 7 ha dejado de responder.');
        showToast('El Nodo 7 ha colapsado. Se requiere convocar a elección.', 'warn');
    };

    window.simElectionFromP3 = function() {
        if (node7Alive) {
            showToast('El Nodo 7 continúa activo como líder. Debe simular su caída primero.', 'info');
            return;
        }
        logBully('Nodo 3 detecta timeout (T > 2Tp + Tt) y convoca ELECCION a nodos superiores (4, 5, 6, 7).');
        logBully('Nodos 4, 5 y 6 responden OK al Nodo 3. El Nodo 3 se inhibe.');
        logBully('Nodo 6 convoca ELECCION al Nodo 7. El Nodo 7 no responde.');
        logBully('Expira el temporizador para el Nodo 6. ¡El Nodo 6 se autoproclama nuevo COORDINADOR!');
        logBully('Nodo 6 envía mensaje COORDINADOR a los nodos 1, 2, 3, 4 y 5.');

        bullyCoordinator = 6;
        document.querySelectorAll('#bully-nodes-grid .node-card').forEach(nc => nc.classList.remove('active'));
        const n6 = document.getElementById('bnode-6');
        n6.className = 'node-card active';
        n6.innerHTML = '<span>Nodo 6</span><span class="badge-tag emerald">Nuevo Líder</span>';
        showToast('¡Elección finalizada! Nodo 6 proclamado nuevo Coordinador.', 'success');
    };

    window.simReviveLeader = function() {
        node7Alive = true;
        const n7 = document.getElementById('bnode-7');
        n7.className = 'node-card active';
        n7.innerHTML = '<span>Nodo 7</span><span class="badge-tag emerald">Líder (Bully)</span>';

        const n6 = document.getElementById('bnode-6');
        n6.className = 'node-card';
        n6.innerHTML = '<span>Nodo 6</span><span class="badge-tag blue">Vivo</span>';

        logBully('⚡ Nodo 7 (mayor ID) se reactiva en la red.');
        logBully('Nodo 7 inicia elección de inmediato y como no hay nodos superiores, se impone como COORDINADOR (Bully).');
        logBully('Nodo 7 envía mensaje COORDINADOR a todos los nodos (1 a 6). El Nodo 6 cede el control.');
        showToast('El Nodo 7 se reactivó e impuso su liderazgo inmediatamente.', 'info');
    };

    window.resetBullySim = function() {
        node7Alive = true;
        bullyCoordinator = 7;
        const grid = document.getElementById('bully-nodes-grid');
        grid.innerHTML = `
            <div class="node-card" id="bnode-1"><span>Nodo 1</span><span class="badge-tag blue">Vivo</span></div>
            <div class="node-card" id="bnode-2"><span>Nodo 2</span><span class="badge-tag blue">Vivo</span></div>
            <div class="node-card" id="bnode-3"><span>Nodo 3</span><span class="badge-tag blue">Vivo</span></div>
            <div class="node-card" id="bnode-4"><span>Nodo 4</span><span class="badge-tag blue">Vivo</span></div>
            <div class="node-card" id="bnode-5"><span>Nodo 5</span><span class="badge-tag blue">Vivo</span></div>
            <div class="node-card" id="bnode-6"><span>Nodo 6</span><span class="badge-tag blue">Vivo</span></div>
            <div class="node-card active" id="bnode-7"><span>Nodo 7</span><span class="badge-tag emerald">Líder</span></div>
        `;
        document.getElementById('bully-log').innerHTML = '&gt; Topología reseteada. Nodo 7 activo como Coordinador.';
    };

    function logBully(msg) {
        const log = document.getElementById('bully-log');
        log.innerHTML += `<div>&gt; ${msg}</div>`;
        log.scrollTop = log.scrollHeight;
    }

    // --------------------------------------------------------------------------
    // 10. Simulador 4: Consenso y Generales Bizantinos
    // --------------------------------------------------------------------------
    window.calculateByzantineLimits = function() {
        const m = parseInt(document.getElementById('byz-m-input').value, 10) || 1;
        const minOral = 3 * m + 1;
        const minSigned = m + 2;

        document.getElementById('byz-oral-result').value = `${minOral} nodos (n > 3m)`;
        document.getElementById('byz-signed-result').value = `${minSigned} nodos (n > m + 1)`;

        const info = document.getElementById('byz-math-info');
        info.innerHTML = `Para tolerar <strong>m = ${m}</strong> traidores: se requieren al menos <strong>${minOral} generales</strong> bajo Mensajes Orales. Con firmas digitales no falsificables, la cota se reduce a solo <strong>${minSigned} generales</strong>.`;
    };

    // --------------------------------------------------------------------------
    // 11. Descarga del Archivo respuestas_tp07.json
    // --------------------------------------------------------------------------
    function downloadJSON() {
        const completed = countCompletedItems();
        const hasStudentInfo = Boolean(state.estudiante.nombre.trim()) && Boolean(state.estudiante.legajo.trim());

        if (completed < TOTAL_ACADEMIC_ITEMS || !hasStudentInfo) {
            showToast('Debe completar los 31 ítems académicos y sus datos antes de descargar.', 'warn');
            return;
        }

        const payload = {
            estudiante: {
                nombre: state.estudiante.nombre.trim(),
                legajo: state.estudiante.legajo.trim(),
                github: state.estudiante.github.trim()
            },
            seccion1_lamport_estados: { ...state.seccion1_lamport_estados },
            seccion2_exclusion_mutua: { ...state.seccion2_exclusion_mutua },
            seccion3_interbloqueo_prevencion: { ...state.seccion3_interbloqueo_prevencion },
            seccion4_algoritmos_eleccion: { ...state.seccion4_algoritmos_eleccion },
            seccion5_secuencia_algoritmos: {
                orden_algoritmo_bully: [...state.seccion5_secuencia_algoritmos.orden_algoritmo_bully]
            },
            seccion6_consenso_bizantino: { ...state.seccion6_consenso_bizantino }
        };

        const jsonStr = JSON.stringify(payload, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'respuestas_tp07.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('¡Archivo respuestas_tp07.json descargado con éxito!', 'success');
    }

    btnDownloadTop.addEventListener('click', downloadJSON);
    btnDownloadBottom.addEventListener('click', downloadJSON);

    // --------------------------------------------------------------------------
    // 12. Carga / Importación de Respuestas Guardadas
    // --------------------------------------------------------------------------
    btnImport.addEventListener('click', () => fileImportInput.click());

    fileImportInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (imported.estudiante) Object.assign(state.estudiante, imported.estudiante);
                if (imported.seccion1_lamport_estados) Object.assign(state.seccion1_lamport_estados, imported.seccion1_lamport_estados);
                if (imported.seccion2_exclusion_mutua) Object.assign(state.seccion2_exclusion_mutua, imported.seccion2_exclusion_mutua);
                if (imported.seccion3_interbloqueo_prevencion) Object.assign(state.seccion3_interbloqueo_prevencion, imported.seccion3_interbloqueo_prevencion);
                if (imported.seccion4_algoritmos_eleccion) Object.assign(state.seccion4_algoritmos_eleccion, imported.seccion4_algoritmos_eleccion);
                if (imported.seccion5_secuencia_algoritmos && Array.isArray(imported.seccion5_secuencia_algoritmos.orden_algoritmo_bully)) {
                    state.seccion5_secuencia_algoritmos.orden_algoritmo_bully = imported.seccion5_secuencia_algoritmos.orden_algoritmo_bully;
                }
                if (imported.seccion6_consenso_bizantino) Object.assign(state.seccion6_consenso_bizantino, imported.seccion6_consenso_bizantino);

                saveState();
                renderStateToUI();
                showToast('Respuestas cargadas y restauradas correctamente.', 'success');
            } catch (err) {
                showToast('Error al procesar el archivo JSON: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
        fileImportInput.value = '';
    });

    // --------------------------------------------------------------------------
    // 13. Inicialización General
    // --------------------------------------------------------------------------
    loadState();
    renderDndSlotsFromState();
    updateProgressUI();
});
