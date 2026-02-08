# School Form Components

Componentes modulares e reutilizáveis para o formulário de cadastro de escolas.

## 📁 Estrutura

```
src/components/admin/schools/
├── constants.ts                 # Constantes e dados estáticos
├── StepIndicator.tsx           # Indicador de progresso visual
├── StepNavigation.tsx          # Botões de navegação
├── SchoolFormContent.tsx       # Container do conteúdo do formulário
└── steps/                      # Componentes de cada step
    ├── BasicInfoStep.tsx       # Step 1: Informações Básicas
    ├── AddressStep.tsx         # Step 2: Endereço
    ├── ContactStep.tsx         # Step 3: Contato
    └── ConfigurationStep.tsx   # Step 4: Configurações
```

## 🎯 Arquitetura

### Separação de Responsabilidades

- **constants.ts**: Dados estáticos (estados, timezones, tipos)
- **StepIndicator**: UI de progresso (visual only)
- **StepNavigation**: Lógica de navegação e ações
- **SchoolFormContent**: Renderização dinâmica dos steps
- **steps/**: Cada step é um componente isolado

### Custom Hook

`useSchoolFormSteps` - Gerencia a lógica do formulário multi-step:
- Validação por step
- Navegação entre steps
- Controle de eventos de teclado

## 🚀 Uso

```tsx
import { StepIndicator } from "@/components/admin/schools/StepIndicator"
import { SchoolFormContent } from "@/components/admin/schools/SchoolFormContent"
import { StepNavigation } from "@/components/admin/schools/StepNavigation"
import { useSchoolFormSteps } from "@/hooks/useSchoolFormSteps"

// Na página
const { currentStep, handleNext, handlePrevious, handleKeyDown } = useSchoolFormSteps(form)

return (
  <>
    <StepIndicator currentStep={currentStep} />
    <div onKeyDown={handleKeyDown}>
      <SchoolFormContent currentStep={currentStep} form={form} />
      <StepNavigation {...props} />
    </div>
  </>
)
```

## ✨ Benefícios

1. **Manutenibilidade**: Cada componente tem uma responsabilidade única
2. **Testabilidade**: Componentes isolados são fáceis de testar
3. **Reusabilidade**: Steps podem ser reutilizados em outros formulários
4. **Escalabilidade**: Adicionar novos steps é simples e direto
5. **Performance**: Renderização otimizada por step

## 🔧 Extensibilidade

### Adicionar novo step:

1. Criar componente em `steps/`
2. Adicionar em `FORM_STEPS` (constants.ts)
3. Adicionar em `STEP_COMPONENTS` (SchoolFormContent.tsx)
4. Atualizar validação em `useSchoolFormSteps`

### Adicionar nova constante:

Adicionar em `constants.ts` e exportar:

```ts
export const NEW_OPTIONS = [
  { value: "opt1", label: "Option 1" },
] as const
```

## 📝 TypeScript

Todos os componentes são fortemente tipados:
- Props interfaces explícitas
- Validação com Zod Schema
- Type-safe constants com `as const`
