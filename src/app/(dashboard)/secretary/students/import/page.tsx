"use client"

import { ImportWizard } from "@/components/import"
import type { ImportWizardConfig, PreviewRow } from "@/components/import"

const config: ImportWizardConfig = {
  entityLabel: "alunos",
  entityLabelSingular: "aluno",
  backPath: "/secretary/students",
  backLabel: "Voltar para alunos",
  pageTitle: "Importar alunos",
  pageDescription: "Importe alunos em lote a partir de uma planilha CSV ou XLSX.",
  templateColumns: [
    "Nome do aluno *",
    "Email do aluno *",
    "Matrícula *",
    "Turma",
    "Data de nascimento",
    "CPF do aluno",
    "Nome do responsável *",
    "Email do responsável *",
    "Telefone do responsável *",
    "Parentesco *",
    "CPF do responsável",
    "Info. de saúde",
  ],
  previewColumns: [
    { key: "name", label: "Aluno" },
    { key: "email", label: "Email" },
    { key: "registration", label: "Matrícula" },
    { key: "class", label: "Turma" },
    { key: "parent", label: "Responsável" },
  ],
}

const mockPreview: PreviewRow[] = [
  { row: 1, name: "Maria Silva", email: "maria@email.com", registration: "2026001", class: "1ª Série A", parent: "Ana Silva", status: "valid" },
  { row: 2, name: "João Santos", email: "joao@email.com", registration: "2026002", class: "1ª Série A", parent: "Carlos Santos", status: "valid" },
  { row: 3, name: "Pedro Oliveira", email: "", registration: "2026003", class: "2ª Série B", parent: "Lucia Oliveira", status: "error", error: "Email obrigatório" },
  { row: 4, name: "Ana Costa", email: "ana@email.com", registration: "2026001", class: "1ª Série A", parent: "Roberto Costa", status: "error", error: "Matrícula duplicada" },
  { row: 5, name: "Lucas Pereira", email: "lucas@email.com", registration: "2026005", class: "3ª Série A", parent: "Marta Pereira", status: "valid" },
]

export default function ImportStudentsPage() {
  return <ImportWizard config={config} mockPreview={mockPreview} />
}
