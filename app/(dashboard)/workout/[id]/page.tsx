export default function WorkoutDetail({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <h1>Workout ID: {params.id}</h1>
    </div>
  );
}
