"use client"

import { ImportWizard } from "@/components/import"
import type { ImportWizardConfig, PreviewRow } from "@/components/import"

const config: ImportWizardConfig = {
  entityLabel: "professores",
  entityLabelSingular: "professor",
  backPath: "/secretary/teachers",
  backLabel: "Voltar para professores",
  pageTitle: "Importar professores",
  pageDescription: "Importe professores em lote a partir de uma planilha CSV ou XLSX.",
  templateColumns: [
    "Nome completo *",
    "Email *",
    "WhatsApp / Telefone *",
    "CPF",
    "Data de nascimento",
    "Matrícula",
    "Especialização",
    "Observações",
  ],
  previewColumns: [
    { key: "name", label: "Professor" },
    { key: "email", label: "Email" },
    { key: "registration", label: "Matrícula" },
    { key: "specialization", label: "Especialização", hiddenBelow: "md" },
    { key: "phone", label: "Telefone", hiddenBelow: "lg" },
  ],
}

const mockPreview: PreviewRow[] = [
  { row: 1, name: "Maria Silva de Oliveira", email: "maria.silva@escola.com", registration: "PROF-001", specialization: "Licenciatura em Matemática", phone: "(11) 98888-7777", status: "valid" },
  { row: 2, name: "João Carlos Santos", email: "joao.santos@escola.com", registration: "PROF-002", specialization: "Letras - Português", phone: "(11) 97777-6666", status: "valid" },
  { row: 3, name: "Ana Paula Ferreira", email: "", registration: "PROF-003", specialization: "Educação Física", phone: "(11) 96666-5555", status: "error", error: "Email obrigatório" },
  { row: 4, name: "Roberto Lima Souza", email: "roberto.souza@escola.com", registration: "PROF-001", specialization: "Ciências Biológicas", phone: "(11) 95555-4444", status: "error", error: "Matrícula duplicada" },
  { row: 5, name: "Fernanda Costa Mendes", email: "fernanda.mendes@escola.com", registration: "PROF-005", specialization: "História", phone: "(11) 94444-3333", status: "valid" },
  { row: 6, name: "Carlos Eduardo Pereira", email: "carlos.pereira@escola.com", registration: "PROF-006", specialization: "Inglês", phone: "(11) 93333-2222", status: "valid" },
]

export default function ImportTeachersPage() {
  return <ImportWizard config={config} mockPreview={mockPreview} />
}
