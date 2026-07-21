# Onboarding de um cliente novo

Processo pra provisionar o acesso de um cliente novo (dono de assistência técnica ou
oficina/estética automotiva) no modelo atual: **um deployment isolado por cliente**
(próprio banco Neon + próprio projeto Vercel, mesmo código-fonte).

## Caminho automático (recomendado) — 1 comando, ~2 min

Validado ponta a ponta em 2026-07-10 (criou e apagou dois clientes de teste reais via
API — um no plano mensal recorrente, outro no plano vitalício fundador — banco Neon,
projeto Vercel com deploy, cliente + cobrança + webhook no Asaas).

### Configuração única (só na primeira vez)

Crie `.env.provisioning` na raiz do projeto (nunca é commitado — coberto pelo
`.env*` do `.gitignore`) com três chaves de API:

```bash
VERCEL_API_TOKEN=""   # vercel.com/account/settings/tokens → Create Token
NEON_API_KEY=""        # console.neon.tech → avatar → Account Settings → API Keys
NEON_ORG_ID=""         # GET /users/me/organizations com a key acima, campo "id"
ASAAS_API_KEY=""       # asaas.com → Integrações → Chaves de API → Gerar chave de API
                        # (exige "Minha Conta" → aba Informações → faturamento preenchido
                        # antes de liberar; e NÃO marque permissão de saque na chave)
RESEND_API_KEY=""      # resend.com → API Keys. Opcional: sem isso, o cliente novo é
                        # provisionado normalmente, só sem o aviso automático por e-mail
                        # de "lead novo" (ADMIN_EMAIL vira o destinatário automaticamente).
```

### Rodando pra cada cliente novo — plano mensal (cliente #11 em diante)

```bash
CLIENT_SLUG="oficina-do-joao" \
CLIENT_NAME="Oficina do João" \
VERTENTE_ATIVA="estetica" \
ADMIN_EMAIL="joao@oficinadojoao.com" \
ADMIN_PASSWORD="SenhaForte123!" \
ASAAS_CLIENT_CPF_CNPJ="12345678900" \
ASAAS_SUBSCRIPTION_VALUE="147.00" \
npx tsx scripts/provisioning/new-client.ts
```

### Rodando pra cada cliente novo — plano fundador vitalício (só os 10 primeiros)

Igual ao de cima, mas troca `ASAAS_SUBSCRIPTION_VALUE` por `FOUNDER_LIFETIME_PRICE`
(nunca os dois juntos):

```bash
CLIENT_SLUG="oficina-do-joao" \
CLIENT_NAME="Oficina do João" \
VERTENTE_ATIVA="estetica" \
ADMIN_EMAIL="joao@oficinadojoao.com" \
ADMIN_PASSWORD="SenhaForte123!" \
ASAAS_CLIENT_CPF_CNPJ="12345678900" \
FOUNDER_LIFETIME_PRICE="297.00" \
npx tsx scripts/provisioning/new-client.ts
```

Diferença: cobrança **única** no Asaas (não recorrente) e o acesso já é marcado
como `ACTIVE`/permanente direto no banco, no momento do provisionamento — não
depende do webhook confirmar o pagamento pra liberar (mais resistente a falha:
mesmo se o pagamento atrasar ou o webhook tiver problema, o fundador já está com
acesso). **Controle manual de quantos vagas de fundador já foram usadas** — o
script não impõe limite de 10, isso é combinado com você mesmo antes de rodar.

- `CLIENT_SLUG`: vira o nome do projeto Vercel e o subdomínio
  (`https://<slug>.vercel.app`) — só letras minúsculas, números e hífen.
- `VERTENTE_ATIVA`: `"assistencia"` ou `"estetica"` (mesma regra de sempre — a
  distinção estética/oficina/ambos é feita depois, dentro do painel).
- `ASAAS_CLIENT_CPF_CNPJ`: CPF ou CNPJ do cliente (só dígitos ou formatado, o script
  limpa a formatação) — exigido pelo Asaas pra criar o cliente.
- `ADMIN_TRIAL_DAYS` (opcional, padrão 7): dias de trial pra esse cliente específico
  — só relevante no plano mensal (fundador já entra com acesso ativo, sem trial).

O script faz, nessa ordem, com rollback automático se algum passo falhar
(apaga o que já criou nesta execução — exceto o cliente Asaas, ver nota abaixo):

1. Cria o banco Neon
2. Roda as migrations e cria a conta do dono
3. Cria o cliente + assinatura no Asaas (gera o link de pagamento)
4. Cria o projeto Vercel (linkado ao mesmo repo) e configura todas as env vars
5. Dispara o deploy de produção

No final, imprime: URL do painel, login, link de pagamento Asaas, e onde achar o
projeto na Vercel.

**Nota sobre rollback:** se a falha acontecer DEPOIS do cliente já ter sido criado no
Asaas (passo 3), esse registro não é apagado automaticamente — confira manualmente em
**Meus Clientes** no painel do Asaas antes de rodar de novo com o mesmo cliente.

## Caminho manual (fallback)

Use se não tiver as três chaves de API configuradas, ou pra entender o que o script
automatiza por baixo dos panos.

### 1. Criar o banco (Neon) — ~1 min

1. [console.neon.tech](https://console.neon.tech) → **New Project**
2. Nome: identifique o cliente (ex: `cliente-nome-do-negocio`)
3. Region: `AWS US East 1 (N. Virginia)` — mesma dos outros projetos
4. Postgres version: a mesma usada nos outros (18)
5. **Enable Neon Auth**: deixe desligado (o app tem seu próprio sistema de login)
6. Criar → abre a tela **Connect to your database**:
   - Clique em **Show password** pra revelar a senha
   - Copie a string com **Connection pooling** ligado → isso é o `DATABASE_URL`
   - Desligue **Connection pooling** → copie a string sem `-pooler` no host → isso é o `DIRECT_URL`

### 2. Rodar o script de banco/admin — 1 comando

```bash
VERTENTE_ATIVA="assistencia" \
DATABASE_URL="<pooled do cliente>" \
DIRECT_URL="<direct do cliente>" \
ADMIN_EMAIL="dono@clientexyz.com" \
ADMIN_PASSWORD="SenhaForte123!" \
npx tsx scripts/provision-client.ts
```

O script roda as migrations no banco novo, cria a conta do dono e imprime no final
as variáveis prontas pra colar na Vercel (incluindo um `SESSION_SECRET` novo gerado
na hora).

### 3. Criar o projeto na Vercel — ~2 min

1. [vercel.com/new](https://vercel.com/new) → **Import** o repositório
   `RogerFounder/Nexis-drive` (pode importar o mesmo repo várias vezes, cada import
   vira um projeto/deployment separado)
2. Antes do primeiro deploy, expanda **Environment Variables** e cole os valores que
   o script imprimiu: `VERTENTE_ATIVA`, `DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`
3. **Deploy**
4. (Opcional) domínio próprio em **Domains**

### 4. Configurar o Asaas dele (billing)

Mesmo processo do deployment principal:
1. **Meus Clientes** → cadastrar o cliente → gerar uma assinatura recorrente pra ele
   (não usar o "Link de Pagamento" genérico pra clientes reais — uma assinatura
   vinculada a um cliente específico dá um `customerId` estável, necessário pro
   próximo item)
2. Configurar o webhook do Asaas apontando pra
   `https://<domínio-do-cliente>/api/webhooks/asaas`, com um token de acesso forte
3. Colar `ASAAS_CHECKOUT_URL`, `ASAAS_WEBHOOK_TOKEN` e `ASAAS_CUSTOMER_ID`
   (o `customerId` do passo 1) na Vercel → redeploy

**Por que `ASAAS_CUSTOMER_ID` é obrigatório, não opcional:** o Asaas manda webhook
pra **todos os endpoints cadastrados na conta sempre que qualquer cliente paga** — não
tem como avisar só o deployment certo. Sem essa variável, o webhook de um cliente pode
acidentalmente ativar o acesso de outro (ver `src/server/services/billing/asaas-webhook-guard.ts`).

Sem isso configurado, o painel do cliente funciona normalmente durante o trial de
7 dias, só não tem como ele assinar de verdade depois.

### 5. Primeiro login do cliente

1. Manda pro cliente: domínio + e-mail/senha definidos no passo 2
2. No primeiro login, o sistema redireciona automaticamente pra
   **Configurações** (onboarding obrigatório uma vez) — lá ele:
   - Se for vertente `estetica`: escolhe **Estética**, **Oficina** ou **Ambos**
   - Ajusta os itens do checklist de laudo (vem com sugestões padrão)
   - Salva
3. Depois de salvar, o painel completo (Visão geral, Leads, Laudo) libera normalmente
4. O trial (7 dias por padrão) já está contando desde a criação da conta (passo 2) —
   o bloqueio pra `/assinatura` acontece automaticamente quando expira

## Ajustar a duração do trial de um cliente específico

Pra dar um trial promocional mais longo (ex: 30 dias) sem afetar nenhum outro
cliente:

```bash
DATABASE_URL="<pooled do cliente>" \
ADMIN_EMAIL="dono@clientexyz.com" \
ADMIN_TRIAL_DAYS="30" \
npx tsx scripts/set-trial-days.ts
```

Não mexe em senha nem reaplica migrations — só ajusta esse número. Pode rodar a
qualquer momento, inclusive depois que o cliente já está usando o painel.

## Cliente com pagamento único (sem passar pelo Asaas)

Pros primeiros clientes com cobrança avulsa (ex: PIX recebido diretamente, sem
assinatura recorrente no Asaas), libera o acesso manualmente:

```bash
DATABASE_URL="<pooled do cliente>" \
ADMIN_EMAIL="dono@clientexyz.com" \
npx tsx scripts/activate-lifetime-access.ts
```

Isso marca o acesso como pago (`ACTIVE`) sem data de expiração — não depende do
Asaas nem de webhook nenhum. Se quiser um prazo em vez de permanente, adicione
`ACCESS_UNTIL="2027-12-31"` ao comando.

## Erros conhecidos desse processo

- **Build falha com `VERTENTE_ATIVA inválida`**: o valor tem que ser exatamente
  `assistencia` ou `estetica`, minúsculo, sem aspas extras. Nada de `"Oficina"`,
  `"Estética"` etc. aqui.
- **Página quebra com `The table 'public.settings' does not exist`**: as migrations
  não rodaram nesse banco — confirme que `DIRECT_URL` no passo 2 estava correto e
  rode o script de novo (é idempotente, seguro repetir).
- **"Too Many Requests" (429) que não passa**: normalmente é cache/cookie antigo do
  navegador de quem está testando (não do servidor) — testar em aba anônima ou outro
  dispositivo resolve. Ver `src/proxy.ts` para a lógica do rate limiter (só conta
  requisições de mutação, não navegação).
- **Deploy da Vercel falha com `errorCode: sts_credentials_fetch_failed`**: não é
  problema do nosso script — em 2026-07-10 isso bateu com um incidente confirmado no
  status page da Vercel (bug no sistema de controle de gastos pausando deployments).
  Se acontecer, espere 1-2 min e dispare o deploy de novo (`npx tsx
  scripts/provisioning/new-client.ts` de novo é seguro só se o cliente ainda não foi
  criado em nenhum lugar; se já foi, redisparar só o deploy é mais seguro — ver o
  código de `triggerVercelDeployment` em `scripts/provisioning/lib/vercel.ts`).
- **Webhook do Asaas fica "Interrompido"**: o Asaas pausa a fila de entrega
  automaticamente depois de várias falhas seguidas (ex: enquanto a URL/token estava
  sendo configurada). Reative em **Integrações → Webhooks → editar → ligar o
  toggle "ficará ativo"** — não é algo que o script de provisionamento corrige
  sozinho, e o próprio Asaas às vezes reinterrompe depois de mudanças na
  configuração da conta.
