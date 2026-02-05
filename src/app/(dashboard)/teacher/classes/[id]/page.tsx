export default function ProfessorTurmaDetalhePage({ params }: { params: { id: string } }) {
  return <h1 className="text-3xl font-bold">Turma {params.id} - Professor</h1>;
}
