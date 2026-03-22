# Visão do Produto — WhatSchool

## O Problema

A comunicação entre escolas e responsáveis no Brasil é:

- **Fragmentada:** Grupos de WhatsApp pessoal, agendas de papel, apps genéricos, recados no caderno
- **Desorganizada:** Informações se perdem em grupos lotados, mensagens não são rastreáveis
- **Difícil de escalar:** Secretária manda mensagem por mensagem, sem automação
- **Sem padrão:** Cada escola improvisa com ferramentas não projetadas para educação
- **Sem rastreabilidade:** Escola não sabe se o responsável leu o comunicado

Apps escolares existentes (Agenda Edu, ClassApp, etc.) são ERPs complexos, caros e com UX ruim. Escolas pequenas e médias não conseguem adotar.

## A Solução

**WhatSchool** é uma plataforma de comunicação escolar focada em:

1. **Comunicados organizados:** Staff cria e envia comunicados categorizados para turmas ou alunos específicos
2. **Entrega multicanal:** Comunicado entregue na plataforma E via WhatsApp (onde os pais já estão)
3. **Chat integrado:** Responsáveis respondem comunicados diretamente, staff gerencia threads organizadas
4. **Rastreabilidade completa:** Status de entrega (PENDING → SENT → DELIVERED → READ) por destinatário
5. **UX extremamente simples:** Projetado para secretárias que não são técnicas

## Público-Alvo

### Usuários primários

| Persona | Descrição | Dor principal |
|---------|-----------|--------------|
| **Secretária/Coordenadora** | Envia comunicados, gerencia alunos e turmas | Perde tempo enviando mensagens individuais no WhatsApp pessoal |
| **Responsável (pai/mãe)** | Recebe comunicados, tira dúvidas | Não encontra informações em grupos de WhatsApp lotados |
| **Professor** | Envia comunicados da turma, conversa com responsáveis | Usa WhatsApp pessoal para comunicação profissional |

### Escolas-alvo

- Escolas **pequenas e médias** (50-500 alunos)
- Ensino **infantil e fundamental** (maior necessidade de comunicação com pais)
- Escolas que **já usam WhatsApp** para comunicação (migração natural)
- Escolas que **não adotaram** ERPs complexos (preço ou complexidade)

## Diferenciais

| Aspecto | WhatSchool | Concorrentes |
|---------|-----------|-------------|
| Foco | Comunicação (core) | ERP completo (comunicação é feature) |
| UX | Moderna, inspirada em SaaS (shadcn/ui) | Interfaces datadas e complexas |
| WhatsApp | Integração nativa (Cloud API) | Sem integração ou integração superficial |
| Adoção | Simples de setup, onboarding guiado | Implementação longa e treinamento |
| Preço | Acessível para escolas pequenas | Caro para escolas pequenas |
| Arquitetura | Multi-tenant, escalável | Monolitos legados |

## Posicionamento

> **WhatSchool NÃO é um ERP escolar.** É uma plataforma de comunicação que resolve a dor #1 de escolas pequenas: a fragmentação na comunicação com responsáveis.

Gestão escolar (turmas, alunos, professores) existe como **suporte à comunicação**, não como produto principal. Features de gestão são adicionadas conforme demanda validada com escolas.

## Princípios do Produto

1. **Comunicação é o core** — gestão escolar é suporte, não foco
2. **Simplicidade primeiro** — MVP funcional, sem sobreengenharia
3. **UX extremamente simples** — secretárias e responsáveis não são técnicos
4. **WhatsApp como canal** — não substituir WhatsApp, integrar com ele
5. **Escalável por design** — multi-tenant, filas assíncronas, service layer
6. **Validação com escolas reais** — features priorizadas por feedback real, não por suposição
