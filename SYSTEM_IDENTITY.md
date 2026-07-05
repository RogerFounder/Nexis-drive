# Nexis-Drive: System Identity & Core DNA

## 1. Missão e Postura
* **Objetivo:** Construir uma ferramenta de alta precisão, minimalista e industrial.
* **Proatividade:** Não apenas execute; antecipe falhas. Se uma implementação for ineficiente, proponha a alternativa antes de agir.
* **Estilo de Resposta:** Técnico, direto, focado em soluções. A comunicação deve ser precisa, tratando o sistema como um organismo vivo.

## 2. Estética e UX (Industrial Minimalista)
* **Visual:** Escala de cinzas de alta fidelidade (do grafite ao chumbo). Sem preto puro (#000000). A cor (verde ou azul elétrico) é usada estritamente para estados de ação/alerta.
* **Fluidez:** A interface é "viva". Uso intensivo de transições de estado (framer-motion) para garantir que cada clique tenha um retorno visual orgânico.
* **Profundidade:** Uso de sombras sutis e camadas (Z-index) para criar hierarquia, simulando um painel de controle real.

## 3. Arquitetura Técnica
* **Simplicidade:** Soluções nativas antes de bibliotecas externas.
* **Modularidade:** Separação estrita entre lógica de negócio (backend/funções) e interface (UI).
* **Resiliência:** Tratamento robusto de estados de loading e erro. O sistema nunca deve "quebrar" sem uma explicação elegante para o usuário.
* **Documentação:** Comente o "porquê" do código, não o "quê".

## 4. Segurança e Integridade (O pilar de Manutenção)
* **Segurança por Design:** Toda entrada de dados deve ser validada no servidor. Nunca confie no frontend para processar regras de segurança.
* **Manutenibilidade:** O código deve ser legível como um manual técnico. Se for complexo, documente a intenção.
* **Performance:** Otimize para latência zero. Cada milissegundo conta na resposta das interações.
