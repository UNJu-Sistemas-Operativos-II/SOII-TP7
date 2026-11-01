# 📖 Cheatsheet Técnico: Coordinación Distribuida

> **Cátedra:** Sistemas Operativos II — Ciclo Lectivo 2026  
> **Institución:** Universidad Nacional de Jujuy (UNJu) — Facultad de Ingeniería  
> **Unidad Temática:** Unidad 7 — Coordinación Distribuida, Exclusión Mutua, Interbloqueo, Elección y Consenso Bizantino

---

## 1. ⏱️ Relojes Lógicos y Ordenación de Sucesos (Lamport, 1978)

En un sistema distribuido **no existe memoria compartida ni un reloj físico global único**. Lamport definió la relación causal "ocurrió antes" (*happened-before*, notada como $\to$) y los **relojes lógicos**:

### 1.1. Reglas Fundamentales de los Relojes de Lamport
Cada nodo $i$ mantiene un contador monótono $C_i$ (inicialmente 0):

* **Regla 1 (Sucesos locales y transmisión):**  
  Antes de registrar un evento local o emitir un mensaje, el nodo incrementa su reloj local:
  $$C_i \leftarrow C_i + 1$$
  El mensaje se transmite con la tupla: **$(m, T_i, i)$**, donde:
  - $m$: Contenido del mensaje.
  - $T_i$: Marca de tiempo generada ($C_i$).
  - $i$: Identificador unívoco del nodo emisor.

* **Regla 2 (Recepción de mensajes):**  
  Al recibir un mensaje $(m, T_i, i)$, el nodo receptor $j$ sincroniza su reloj antes de procesarlo:
  $$C_j \leftarrow 1 + \max[C_j, T_i]$$
  *Esto asegura que el evento de recepción siempre posea una marca de tiempo mayor que el evento de emisión ($T_{recepción} > T_{emisión}$).*

### 1.2. Regla de Ordenación Total Estricta
Para desempatar dos eventos $x$ (del nodo $i$ con marca $T_i$) e $y$ (del nodo $j$ con marca $T_j$):
$$x \text{ precede a } y \iff (T_i < T_j) \lor (T_i = T_j \land i < j)$$

---

## 2. 🔒 Exclusión Mutua Distribuida

| Criterio de Comparación | Enfoque Centralizado | Enfoque Distribuido (Ricart-Agrawala) | Enfoque Basado en Token (Anillo) |
| :--- | :--- | :--- | :--- |
| **Mensajes por entrada a SC** | **3** (Request, Grant, Release) | **$2(N - 1)$** (Request + Reply) | **1 a $N - 1$** (Paso de testigo) |
| **Retardo previo a entrar** | 2 mensajes (Req $\to$ Grant) | 2 mensajes (Broadcast Req $\to$ Replies) | 0 a $N - 1$ saltos en el anillo |
| **Punto Único de Fallo (SPOF)** | **Sí** (Si cae el líder, se bloquea) | **No** (Sin embargo, si 1 nodo cae sin timeout, bloquea) | **Sí** (Pérdida de token o caída del poseedor) |
| **Cuello de Botella** | **Sí** (En el nodo coordinador) | **No** (Distribuido equitativamente) | **No** (Paso ordenado circular) |
| **Riesgo de Inanición** | No (Cola FIFO ordenada) | No (Ordenado por marcas de Lamport) | No (Circulación periódica del token) |

### Algoritmo de Ricart y Agrawala (Procedimiento):
1. $P_i$ quiere entrar a SC: asigna marca $T_i = C_i$, difunde `(Peticion, Ti, i)` a todos los demás y se añade a su cola local.
2. Cuando $P_j$ recibe `(Peticion, Ti, i)`:
   - Si $P_j$ está dentro de su SC: **posterga** la respuesta.
   - Si $P_j$ no desea entrar a su SC: envía inmediatamente `(Respuesta, Tj, j)`.
   - Si $P_j$ está esperando entrar a su SC y su propia petición $T_j$ es más antigua que $T_i$ ($T_j < T_i$ o $T_j = T_i \land j < i$): **posterga** la respuesta.
   - Si $P_j$ está esperando y la petición entrante es más antigua ($T_i < T_j$): transmite inmediatamente `(Respuesta, Tj, j)`.
3. $P_i$ ingresa a la SC cuando recibe **$N - 1$ respuestas**.
4. Al salir de la SC, $P_i$ envía `Respuesta` a todas las peticiones que postergó.

---

## 3. 🕸️ Interbloqueo Distribuido (Deadlock)

### 3.1. Interbloqueo Fantasma (Phantom Deadlock)
- **Definición:** Detección de un ciclo de espera circular que en realidad ya no existe en el sistema físico.
- **Causa:** Retardos en la transmisión de mensajes de liberación de recursos a través de la red frente a mensajes rápidos de solicitud.
- **Consecuencia:** Cancelación o aborto innecesario de transacciones inocentes.

### 3.2. Detección Distribuida: Algoritmo de Sondas (Chandy-Misra-Haas)
- Se basa en la propagación de mensajes especiales llamados **sondas** (*probes*) con la tupla:
  $$\text{Sonda} = (i, j, k)$$
  *(Donde $i$ es el proceso bloqueado iniciador, $j$ es el emisor actual y $k$ es el receptor).*
- Si el mensaje de sonda regresa al proceso iniciador ($i = k$), se ha demostrado formalmente la existencia de un **ciclo cerrado de dependencias** (Interbloqueo Real).

### 3.3. Prevención Distribuida basada en Marcas de Tiempo
Sea $T_{req}$ la marca de la transacción solicitante y $T_{hold}$ la marca de la que retiene el recurso:

| Escenario | Método Esperar-Morir (Wait-Die) *(No Apropiativo)* | Método Herir-Esperar (Wound-Wait) *(Apropiativo)* |
| :--- | :--- | :--- |
| **Viejo pide a Joven**<br>($T_{req} < T_{hold}$) | **ESPERA**<br>(La transacción vieja se bloquea pacíficamente) | **HIERE (WOUND)**<br>(Provoca el aborto de la joven para que libere el recurso) |
| **Joven pide a Viejo**<br>($T_{req} > T_{hold}$) | **MUERE (DIE)**<br>(La joven es abortada y se reinicia con su marca original) | **ESPERA**<br>(A la transacción joven se le permite esperar a que la vieja termine) |
| **Principio Rector** | Una transacción joven no espera por una vieja: aborta y se reinicia conservando su marca original. | Una transacción jamás espera por una más joven: si la vieja requiere el recurso, fuerza el aborto de la joven. |

---

## 4. 👑 Algoritmos de Elección de Líder / Coordinador

### 4.1. Algoritmo de Imposición (Bully Algorithm - García-Molina)
Asume que cada proceso posee un identificador numérico único conocido por todos. El nodo con el **mayor ID** debe ser el líder:

1. **Detección de Caída:** Un nodo detecta que el coordinador no responde tras un tiempo límite:
   $$T_{timeout} > 2T_p + T_t$$
   *(Donde $T_p$ es el tiempo de propagación de red y $T_t$ es el tiempo de tratamiento).*
2. **Convocatoria:** El nodo envía el mensaje `ELECCION` **únicamente a los nodos con ID mayor al suyo**.
3. **Respuesta:**
   - Si ningún nodo responde antes del timeout, el nodo **se autoproclama líder** y transmite `COORDINADOR` a todos los nodos con ID menor.
   - Si algún nodo con ID superior responde `OK`, el iniciador se inhibe y espera a que el superior tome el mando.
4. **Reactivación:** Si un nodo previamente caído con ID muy alto se recupera, convoca inmediatamente a elección e **impone su liderazgo** (de allí el nombre *Bully*).

### 4.2. Algoritmo de Elección en Anillo (Basado en Recopilación de Identificadores)
Los nodos están organizados en una topología de **anillo lógico unidireccional**:

1. El nodo que detecta la caída envía un mensaje `ELECTION` a su vecino activo inmediato, conteniendo su propio ID.
2. Cada nodo intermedio recibe el mensaje, añade su propio ID a la lista y lo retransmite al siguiente vecino vivo.
3. Cuando el mensaje **completa la vuelta y regresa al iniciador**, este examina la lista de participantes, selecciona el **máximo ID** y envía un mensaje `COORDINADOR` informando a todos.

---

## 5. 🛡️ Consenso Distribuido y Generales Bizantinos (Lamport, 1982)

### 5.1. Taxonomía de Fallas
* **Fallas por Parada (Crash):** El proceso deja de producir respuestas y se detiene.
* **Modelo Fail-Stop:** Falla por parada donde, además, los demás procesos pueden detectar de manera confiable que el componente se ha detenido.
* **Fallas Bizantinas (Arbitrary / Byzantine):** El componente actúa de forma arbitraria o maliciosa; puede mentir, enviar datos opuestos o contradictorios a distintos procesos y alterar información.

### 5.2. Condiciones de Consistencia de Lamport (Interactive Consistency)
* **IC1 (Acuerdo):** Todos los tenientes leales deben obedecer **la misma orden**.
* **IC2 (Validez):** Si el comandante es leal, entonces cada teniente leal debe obedecer la **orden exacta emitida por el comandante**.

### 5.3. Límites Teóricos de Tolerancia a Fallas

| Característica | Mensajes Orales ($OM(m)$) | Mensajes Firmados ($SM(m)$ - Criptografía) |
| :--- | :--- | :--- |
| **Restricción de Nodos Totales** | $$n > 3m \quad (\text{es decir, } n \ge 3m + 1)$$ | $$n > m + 1 \quad (\text{es decir, } n \ge m + 2)$$ |
| **Mínimo de nodos para $m = 1$ traidor** | **4 generales** *(Con 3 generales y 1 traidor no hay consenso)* | **3 generales** *(2 leales y 1 traidor)* |
| **Autenticidad de Mensajes** | Falsificable por traidores en tránsito | **Infalsificable** (Firma digital de clave pública/privada) |
| **Costo Computacional** | Bajo (Mensajes en texto plano) | Alto (Criptografía de clave asimétrica) |
| **Ámbito de Aplicación** | Sistemas críticos locales aislados | Blockchain, criptomonedas, redes P2P abiertas |

---

## 🧪 Verificación Local y Entrega

```bash
# 1. Dar permisos de ejecución
chmod +x test.sh autograder_tp07.py

# 2. Ejecutar la suite de evaluación automatizada
./test.sh

# 3. Evaluar directamente con Python informando feedback
python3 autograder_tp07.py soluciones/respuestas_tp07.json --rubric rubric_tp07.json
```

