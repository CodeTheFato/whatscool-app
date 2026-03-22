export interface PreviewColumnDef {
  key: string
  label: string
  hiddenBelow?: "md" | "lg"
}

export interface PreviewRow {
  row: number
  status: "valid" | "error"
  error?: string
  [key: string]: unknown
}

export interface ImportWizardConfig {
  entityLabel: string
  entityLabelSingular: string
  backPath: string
  backLabel: string
  pageTitle: string
  pageDescription: string
  templateColumns: string[]
  previewColumns: PreviewColumnDef[]
}
