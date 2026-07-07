# Onboarding de um cliente novo

Processo pra provisionar o acesso de um cliente novo (dono de assistência técnica ou
oficina/estética automotiva) no modelo atual: **um deployment isolado por cliente**
(próprio banco Neon + próprio projeto Vercel, mesmo código-fonte).

Validado ponta a ponta em 2026-07-07 com um cliente de teste.

## 1. Criar o banco (Neon) — ~1 min

1. [console.neon.tech](https://console.neon.tech) → **New Project**
2. Nome: identifique o cliente (ex: `cliente-nome-do-negocio`)
3. Region: `AWS US East 1 (N. Virginia)` — mesma dos outros projetos
4. Postgres version: a mesma usada nos outros (18)
5. **Enable Neon Auth**: deixe desligado (o app tem seu próprio sistema de login)
6. Criar → abre a tela **Connect to your database**:
   - Clique em **Show password** pra revelar a senha
   - Copie a string com **Connection pooling** ligado → isso é o `DATABASE_URL`
   - Desligue **Connection pooling** → copie a string sem `-pooler` no host → isso é o `DIRECT_URL`

## 2. Rodar o script de provisionamento — 1 comando

Do terminal, na raiz do projeto:

```bash
VERTENTE_ATIVA="assistencia" \
DATABASE_URL="<pooled do cliente>" \
DIRECT_URL="<direct do cliente>" \
ADMIN_EMAIL="dono@clientexyz.com" \
ADMIN_PASSWORD="SenhaForte123!" \
npx tsx scripts/provision-client.ts
```

- `VERTENTE_ATIVA`: `"assistencia"` (conserto de eletrônicos) ou `"estetica"` (tudo
  relacionado a veículo — moto/carro, estética **ou** oficina mecânica **ou** ambos).
  Não existe um terceiro valor `"oficina"` aqui — a distinção
  estética/oficina/ambos é feita depois, dentro do próprio painel.
- O script roda as migrations no banco novo, cria a conta do dono e imprime no final
  as variáveis prontas pra colar na Vercel (incluindo um `SESSION_SECRET` novo gerado
  na hora).

## 3. Criar o projeto na Vercel — ~2 min

1. [vercel.com/new](https://vercel.com/new) → **Import** o repositório
   `RogerFounder/Nexis-drive` (pode importar o mesmo repo várias vezes, cada import
   vira um projeto/deployment separado)
2. Antes do primeiro deploy, expanda **Environment Variables** e cole os valores que
   o script imprimiu: `VERTENTE_ATIVA`, `DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`
3. **Deploy**
4. (Opcional) domínio próprio em **Domains**

## 4. Configurar o Asaas dele (billing)

Mesmo processo do deployment principal:
1. Criar a assinatura/plano no Asaas do cliente (ou sub-conta), gerar o link de checkout
2. Configurar o webhook do Asaas apontando pra
   `https://<domínio-do-cliente>/api/webhooks/asaas`, com um token de acesso forte
3. Colar `ASAAS_CHECKOUT_URL` e `ASAAS_WEBHOOK_TOKEN` na Vercel → redeploy

Sem isso configurado, o painel do cliente funciona normalmente durante o trial de
7 dias, só não tem como ele assinar de verdade depois.

## 5. Primeiro login do cliente

1. Manda pro cliente: domínio + e-mail/senha definidos no passo 2
2. No primeiro login, o sistema redireciona automaticamente pra
   **Configurações** (onboarding obrigatório uma vez) — lá ele:
   - Se for vertente `estetica`: escolhe **Estética**, **Oficina** ou **Ambos**
   - Ajusta os itens do checklist de laudo (vem com sugestões padrão)
   - Salva
3. Depois de salvar, o painel completo (Visão geral, Leads, Laudo) libera normalmente
4. O trial de 7 dias já está contando desde a criação da conta (passo 2) — o bloqueio
   pra `/assinatura` acontece automaticamente quando expira

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
