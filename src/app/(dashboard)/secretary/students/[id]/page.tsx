export default function SecretariaAlunoDetalhePage({ params }: { params: { id: string } }) {
  return <h1 className="text-3xl font-bold">Aluno {params.id} - Secretaria</h1>;
}
