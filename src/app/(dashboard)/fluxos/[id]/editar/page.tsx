import { FlowEditor } from "@/components/fluxos/flow-editor";

export default function EditarFluxoPage({ params }: { params: { id: string } }) {
  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editar Fluxo</h1>
      </div>
      <FlowEditor />
    </div>
  );
}
